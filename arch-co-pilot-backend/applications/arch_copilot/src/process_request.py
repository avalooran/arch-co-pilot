import json
import boto3
from botocore.exceptions import ClientError
import pandas as pd
from pandas.io.json._normalize import nested_to_record 
from datetime import datetime
from common.utils import timeit
from common.parse_docs import ParsePDFDocTextImages as PDFDocParserTI
from common.embbed_docs import MultimodalEmbeding
from common.llm_prompts import LLMPrompts
from common.doc_pgvector import DocPGVector
from common.s3_interface import S3Interface
from process_event import ProcessEvent




class ProcessRequest(ProcessEvent):
    def __init__(self,bedrock_runtime, rds_client, s3_c, config, event, response_memory_df):
        super().__init__(config, event) 
        self.bedrock_runtime = bedrock_runtime
        self.rds_client = rds_client
        self.s3_c = s3_c
        self.response_memory_df = response_memory_df
        self.m_embbeding = MultimodalEmbeding(bedrock_runtime, config)
        self.llm_prompt = LLMPrompts(bedrock_runtime, config)
        self.doc_pgvctr = DocPGVector(rds_client, config)
        self.s3i = S3Interface(s3_c, config)
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

        return answer

    def execute_model_response(self):
 
        accumulated_text_chunks = [{'chunk_number': 0, 'accumulated_text': ''} ,{'chunk_number': 0, 'accumulated_text': ''}]
        accumulated_image_chunks = {}
        
        if self.adhoc_document_path:
            question_type = 'summarize'
            contexts_size = 100000
            #proces pdf to extract text and images
            doc_bucket , doc_key = self.s3i.parse_s3_uri(self.adhoc_document_path)
            s3_output_folder = 's3://' + doc_bucket + '/' + self.config['output_details']['output_key']
            self.pdf_parser_inst = PDFDocParserTI(self.s3_c, self.config, self.adhoc_document_path,s3_output_folder)
            self.page_details, self.accumulated_chunks, self.doc_text  = self.pdf_parser_inst.process_pdf_pages()
            
            accumulated_chunks_df = pd.DataFrame(self.accumulated_chunks)
            accumulated_text_chunks = accumulated_chunks_df[['chunk_number','accumulated_text']].to_dict('records') 
            accumulated_image_chunks = accumulated_chunks_df[['chunk_number','accumulated_images']].to_dict('records') 

            response_body, invoke_error = proces_pdf_question(accumulated_text_chunks, accumulated_image_chunks, self.primary_model, question_type)
            if invoke_error:
                invoke_error = None
                response_body, invoke_error = proces_pdf_question(accumulated_text_chunks, accumulated_image_chunks,self.secondary_model, question_type)
                if invoke_error:
                    logger.error("A client error occurred: %s", invoke_eror)
                    print("A client error occured: " + invoke_eror)
            
        else:
            question_type = 'question'
            print(f"caling get_question_context")
            accumulated_text_chunks, accumulated_image_chunks, contexts_size = self.get_question_context(bedrock_runtime, rds_client, user_question)
            print(f"contexts_size is -> {contexts_size}")
            if contexts_size > 0:
                question_type = 'question_context'  

        response_body, invoke_error = proces_doc_question(accumulated_text_chunks, accumulated_image_chunks, self.primary_model, question_type)
        if invoke_error:
            invoke_error = None
            response_body, invoke_error = proces_doc_question(accumulated_text_chunks, accumulated_image_chunks,self.secondary_model, question_type)
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
