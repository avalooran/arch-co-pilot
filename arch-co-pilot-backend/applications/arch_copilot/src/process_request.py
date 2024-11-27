import json
import boto3
from utils import timeit
import pandas as pd
from pandas.io.json._normalize import nested_to_record 
from datetime import datetime
from common.parse_docs import ParsePDFDocTextImages as PDFDocParserTI
from common.embbed_docs import MultimodalEmbeding
from common.llm_prompts import LLMPrompts
from common.doc_pgvector import DocPGVector



class ProcessRequest(ProcessEvent):
    def __init__(self,bedrock_runtime, rds_client, config, event, response_memory_df):
        super().__init__(config, event) 
        self.bedrock_runtime = bedrock_runtime
        self.rds_client = rds_client
        self.response_memory_df = response_memory_df
        self.s3_pdf_path = s3_pdf_path
        self.s3_output_folder = s3_output_folder
        self.pdf_parser_inst = PDFDocParserTI(s3_c, config, s3_pdf_path,s3_output_folder)
        self.m_embbeding = MultimodalEmbeding(bedrock_runtime, config)
        self.llm_prompt = LLMPrompts(bedrock_runtime, config)
        self.doc_pgvctr = DocPGVector(rds_client, config)
        self.primary_model = self.config['models']['primary_model']
        self.secondary_model = self.config['models']['secondary_model']


    def process_request(self):
        try:
            run_answer = False
            print(f"response_memory_df handler 1 {self.response_memory_df.shape[0]}") 
            if self.response_memory_df.shape[0] > 0:
                self.response_user_memory_df = self.response_memory_df[(self.response_memory_df['session_id'] == self.session_id) & (self.response_memory_df['user_question'] == self.user_question)]
                if self.response_memory_df.shape[0] > 0:
                    print(f"response_user_memory ->  {self.response_user_memory_df[['answer']].to_dict('records')}") 
                    answer = self.response_user_memory_df[['answer']].to_dict('records') 
                    if len(answer) > 0:
                        answer = answer[0]['answer']
                        print(f"memorised answer {answer}")
                    else:
                        run_answer = True
                else:
                    run_answer = True
            else:
                run_answer = True
                
            if run_answer: 
                answer = self.execute_model_response()
                response_answer_memory_df = pd.DataFrame([{"answer": answer, "session_id": session_id, "user_question": user_question}])
                self.response_memory_df = pd.concat([response_answer_memory_df, self.response_memory_df]).reset_index(drop=True) 
            print(f"response_memory_df handler 2 {self.response_memory_df.shape[0]}") 
        except ClientError as e:
            return response(400, {"error": {str(e)}, "event": event},self.headers)


    def execute_model_response(self):
 
        accumulated_text_chunks = [{'chunk_number': 0, 'accumulated_text': ''} ,{'chunk_number': 0, 'accumulated_text': ''}]
        accumulated_image_chunks = {}
        
        if self.adhoc_document_path:
            question_type = 'summarize'
            contexts_size = 100000
            #proces pdf to extract text and images
            self.page_details, self.accumulated_chunks, self.doc_text  = self.pdf_parser_inst.process_pdf_pages()
            
            accumulated_chunks_df = pd.DataFrame(self.accumulated_chunks)
            accumulated_text_chunks = accumulated_chunks_df[['chunk_number','accumulated_text']].to_dict('records') 
            accumulated_image_chunks = accumulated_chunks_df[['chunk_number','accumulated_images']].to_dict('records') 
            
        else:
            question_type = 'question'
            print(f"caling get_question_context")
            accumulated_text_chunks, accumulated_image_chunks, contexts_size = self.get_question_context(bedrock_runtime, rds_client, user_question)
            print(f"contexts_size is -> {contexts_size}")
            if contexts_size > 0:
                question_type = 'question_context'  
        
        response_body, invoke_error = proces_pdf_question(accumulated_text_chunks, accumulated_image_chunks, self.primary_model, question_type)
        if invoke_error:
            invoke_error = None
            response_body, invoke_error = proces_pdf_question(accumulated_text_chunks, accumulated_image_chunks,self.secondary_model, question_type)
            if invoke_error:
                logger.error("A client error occurred: %s", invoke_eror)
                print("A client error occured: " + invoke_eror)
        
        return response_body


    def get_question_context(self):
        embed_question_vector = []
        contexts = ''
        print(f"user_question -> {self.user_question}")
        user_question = self.m_embbeding.remove_stop_words(self.user_question)
        embed_question_vector = self.m_embbeding.get_titan_embedding(user_question, None)

        contexts_dict = self.doc_pgvctr.get_doc_cosine_topn_similar_records(5, embed_question_vector, min_threshold=0.6)
        print(f"contexts -> {contexts_dict}")
        contexts_size = len(contexts_dict)
        print(f"context size -> {contexts_size}")

        #save context search in RAG
        columns = self.doc_pgvctr.get_table_column_names(self.rag_response_hist_table)
        if contexts_size > 0:
            response_df = pd.DataFrame(contexts_dict)
        else:
            response_df = pd.DataFrame(columns=columns)
        response_dict['user_id'] = self.user_id
        response_dict['session_id'] = self.session_id
        response_dict['user_question'] = self.user_question
        response_dict['response_timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
        response_dict['response_date'] = datetime.now().strftime("%Y-%m-%d")
        sql_parameter_sets = self.format_records(response_dict, self.rag_response_hist_table)
        insrt_stmnt = self.format_insert_stmnt(self.rag_response_hist_table, columns) 
        records = self.batch_execute_statement(insrt_stmnt, sql_parameter_sets)


        if contexts_size > 0:
            #acumulate al responses into one context
            accumulated_chunks_df = pd.DataFrame(contexts_dict)
            accumulated_chunks_df['chunk_number'] = 1

            accumulated_chunks_df = accumulated_chunks_df[['chunk_number', 'image_description', 'image_base64', 'document_source_link']] 
            accumulated_chunks_df = accumulated_chunks_df.groupby("chunk_number").apply(
                                            lambda group: pd.Series({
                                            "accumulated_text": " ".join(group["image_description"]),  # Concatenate descriptions
                                            "document_source_links": list(group["document_source_link"].unique()),  # Unique links
                                            "accumulated_images": [
                                                {"type": "image","source": {"type": "base64", "media_type": "image/jpeg","data": row["image_base64"]}
                                                } for _, row in group.iterrows()], 
                                        })).reset_index()

        else:
            accumulated_chunks_df = [{'chunk_number': 0, 'accumulated_text': '', 'accumulated_images': {}}]

        return accumulated_chunks_df, contexts_size


    def proces_doc_question(self, accumulated_text_chunks, accumulated_image_chunks,self.secondary_model, question_type):
        max_tokens = self.config['models']['max_tokens']
        model_responses = []

        for indx, accumulated_text in enumerate(accumulated_text_chunks):
            context = accumulated_text['accumulated_text']
            chunk_number = accumulated_text['chunk_number']
            
            if indx == 0:
                continue 
            if len(accumulated_image_chunks) > 0:
                accumulated_images_for_chunk = next(item['accumulated_images'] for item in accumulated_image_chunks if item['chunk_number'] == chunk_number)
                images_df = pd.DataFrame(accumulated_images_for_chunk)
            else:
                doc_images = []

            return_image_format = """text_response_ended@[{"image_number": image_number, "image_path": "image path",
            "image_description": "description", "image_summary": "summary"}]"""

            input_text = f"""
                        0.  Answer the question from the user {self.user_question} .\
                        1. Be consize and precise. Maximum 9 paragraphs are enough.\
                        2. To answer the user's question, Use the folowing context to answer {context}.\
                            Pay atention to text in document first, and then images.
                        3. If The context contains images, then the image path is included.\
                        image path is included in this format 'image_path': './extracted_images/page_4_block_2.png'\
                        4. if images/diagrams are included in context, please retun image number starting with 0 and image path which help answer the question in JSON format.\
                            to get the image path corect, correlate image number you recieve with image path .
                        5. when returning JSON of image paths, include description and sumary of image. return using format {return_image_format}\
                            Please return a valid json .
                        6. if the context contains images/diagrams,Include JSON with image paths after answerring the question.\
                        7. Answer the question first and then return {return_image_format}\
                        8. only include text_response_ended@ once. after text_response_ended@ return all images/diagram in {return_image_format}, \
                            do not include double quotes in your answer.
                        9.If you do not know the anser, say I do not know\
                        """
            message = {"role": "user",
                    "content": [
                        *doc_images,
                        {"type": "text", "text": input_text}
                        ]}
            

            messages = [message]

            body = json.dumps(
                {
                "anthropic_version": "bedrock-2023-05-31",
                "system": "You are a honest and helpful bot.Be consize",
                "max_tokens": max_tokens,
                "temperature": 0.0,
                "top_k": 250, 
                "top_p": 1, 
                "messages": messages
                }
            )

            
            response = bedrock_runtime.invoke_model(body=body, modelId=model_id)
            response_body = ""

            response_body = json.loads(response.get('body').read())
            response_body = response_body['content'][0]['text']
            
            if ('text_response_ended@' in response_body) and (len(accumulated_image_chunks) > 0):
                text_response = response_body.split('text_response_ended@')[0]
                image_response = json.loads(response_body.split('text_response_ended@')[1])
                image_data_df = pd.DataFrame(image_response)
                images_json_struct = json.loads(images_df.to_json(orient="records"))
                images_df_flat = pd.json_normalize(images_json_struct)
                image_response = pd.merge(image_data_df, images_df_flat[['image_path', 'source.data']], on='image_path', how='inner').rename(columns={"source.data": "image_base64"}).to_dict(orient='records')
            else:
                if ('text_response_ended@' in response_body):
                    text_response = response_body.split('text_response_ended@')[0]
                else:
                    text_response = response_body
                image_response = [{}]
                
            question_response = {'text_response': text_response, 'image_response': image_response}
            model_responses.append(question_response)
            
        return model_responses

    

    
    def proces_pdf_question(user_question, bedrock_runtime,  session_id, accumulated_text_chunks, accumulated_image_chunks, model_id,question_type):
        try:
            max_tokens = self.config['models']['max_tokens']
            model_responses = []
            
            print(f"question_type -> {question_type}")

            for indx, accumulated_text in enumerate(accumulated_text_chunks):
                context = accumulated_text['accumulated_text']
                
                chunk_number = accumulated_text['chunk_number']
                
                
                if indx == 0:
                    continue 
                print(f"length of accumulated_image_chunks in proces_pdf_question1 \n {len(accumulated_image_chunks)}")
                if len(accumulated_image_chunks) > 0:
                
                    accumulated_image_chunks = accumulated_image_chunks[1:]
                    if len(accumulated_image_chunks) > 0:
                        #print(f"accumulated_image_chunks in proces_pdf_question1 \n {accumulated_image_chunks }")
                        if question_type == 'summarize':
                            accumulated_images_for_chunk = next(item['accumulated_images'] for item in accumulated_image_chunks if item['chunk_number'] == chunk_number)
                            images_df = pd.DataFrame(accumulated_images_for_chunk)
                        else:
                       
                            
                            images_df = pd.json_normalize(accumulated_image_chunks, max_level=1) 
                            images_df = images_df[images_df['chunk_number'] == chunk_number]
                
                            columns_list = images_df.columns
                            images_df.columns = [col.replace('accumulated_images.', '') for col in images_df.columns]
        
                            print(images_df.columns)  
                        
                  
                        context = context + str(images_df[['image_path']].to_dict('records'))
                        images = images_df[['type', 'source']].to_dict('records') 
                        print(f"images -> \n {images_df.columns}") 
                        doc_images = images
                    else:
                        doc_images = []
                else:
                    doc_images = []
                    
                #temporary 
                #doc_images = doc_images[7:8] 
                    
                #print(f"doc_images 1 {doc_images}")

                return_image_format = """text_response_ended@[{"image_number": image_number, "image_path": "image path",
                "image_description": "description", "image_summary": "summary"}]"""
                
                #print(f"context \n {context}")
                if question_type == 'summarize':
                    input_text = f"""
                                0.  Answer the question from the user {user_question} .\
                                1. Be consize and precise. Maximum 9 paragraphs are enough.\
                                2. To answer the user's question, Use the folowing context to answer {context}.\
                                    Pay atention to text in document first, and then images.
                                3. If The context contains images, then the image path is included.\
                                image path is included in this format 'image_path': './extracted_images/page_4_block_2.png'\
                                4. if images/diagrams are included in context, please retun image number starting with 0 and image path which help answer the question in JSON format.\
                                    to get the image path corect, correlate image number you recieve with image path .
                                5. when returning JSON of image paths, include description and sumary of image. return using format {return_image_format}\
                                    Please return a valid json .
                                6. if the context contains images/diagrams,Include JSON with image paths after answerring the question.\
                                7. Answer the question first and then return {return_image_format}\
                                8. only include text_response_ended@ once. after text_response_ended@ return all images/diagram in {return_image_format}, \
                                    do not include double quotes in your answer.
                                9.If you do not know the anser, say I do not know\
                                """
                elif 'question_context':
                    input_text = f"""
                                0.  Answer the question from the user {user_question} .\
                                    To answer, use context I am sending first if available. \
                                1. Be consize and precise. Maximum 6 paragraphs are enough.\
                                2. To answer the user's question, Use the folowing context to answer {context}.\
                                3. if image is included in context, please retun image paths which help answer the question in JSON format.\
                                    when returning JSON of image paths, return a valid json dictionary not a string; 
                                    include description and sumary of image. return using format {return_image_format}\
                                    if you recieve images, only return key and important images not all, max 3 images.\
                                    return a valid json dictionary not a string.
                                6. if the context contains images,Include JSON with image paths after answerring the question.\
                                7.If you do not know the anser, say I do not know\
                                """
                else:                  
                    input_text = f"""
                                0. Answer the question from the user {user_question} .\\
                                1. Be accurate and knowledgeable. Maximum 6 paragraphs are enough.\
                                2.If you do not know the anser, say I do not know\
                                """
                
                message = {"role": "user",
                    "content": [
                        *doc_images,
                        {"type": "text", "text": input_text}
                        ]}
            

                messages = [message]

                body = json.dumps(
                    {
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": max_tokens,
                    "temperature": 0.0,
                    "top_k": 250, 
                    "top_p": 1, 
                    "messages": messages
                    }
                )
    
                
                response = bedrock_runtime.invoke_model(body=body, modelId=model_id)
                response_body = ""

                response_body = json.loads(response.get('body').read())
                response_body = response_body['content'][0]['text']
                
                #print("********************response_body**********************")
                #print(response_body)
                #print("************************response_body***********************")
                #print(f"is text_response_ended@ in response_body --> {'text_response_ended@' in response_body}")
                
                if ('text_response_ended@' in response_body) and (len(accumulated_image_chunks) > 0):
                    #print(f" images_df {images_df.columns}") 
                    text_response = response_body.split('text_response_ended@')[0]
                    image_response = json.loads(response_body.split('text_response_ended@')[1])
                    image_data_df = pd.DataFrame(image_response)
                    images_json_struct = json.loads(images_df.to_json(orient="records"))
                    images_df_flat = pd.json_normalize(images_json_struct)
                    #print(f"images_df_flat.columns \n {images_df_flat.columns}")
                    #print(f"images_df_flat[['image_path']]\n {images_df_flat[['image_path']].to_dict(orient='records')}")
                    image_response = pd.merge(image_data_df, images_df_flat[['image_path', 'source.data']], on='image_path', how='inner').rename(columns={"source.data": "image_base64"}).to_dict(orient='records')
                    #image_response = [{}]
                    #print("******************image_response************n")
                    #print(image_response)
                    #image_response = image_response.replace('\\n            ', ' ')
                else:
                    if ('text_response_ended@' in response_body):
                        text_response = response_body.split('text_response_ended@')[0]
                    else:
                        text_response = response_body
                    image_response = [{}]
                    
                question_response = {'text_response': text_response, 'image_response': image_response}
                model_responses.append(question_response)
                
                #print("***********************************************")
                #print("*******************model_responses****************************")
                #print(model_responses)
                #print("*******************model_responses****************************")
                #print("***********************************************")
                
        except ClientError as err:
            message = err.response["Error"]["Message"]
            if 'ServiceUnavailableException' in message or 'Too many connections, please wait before trying again' in message:
                return  None, message
            else:    
                message = err.response["Error"]["Message"]
                logger.error("A client error occurred: %s", message)
                return  None, message

        return model_responses, None        
        
    
    