import json
import boto3
from botocore.exceptions import ClientError
import pandas as pd
from pandas.io.json._normalize import nested_to_record 
from datetime import datetime
from common.utils import timeit
from common.parse_docs import ParsePDFDocTextImages as PDFDocParserTI
from common.embbed_docs import MultimodalEmbeding
from common.llm_prompts import LLMPrompts, AsyncBedrockLLMHandler
from common.doc_pgvector import DocPGVector
from common.s3_interface import S3Interface
from common.session_memory import SessionMemory
from process_event import ProcessEvent
from model_response import AsyncModelResponse




class AsyncProcessRequest(ProcessEvent):
    def __init__(self,bedrock_runtime, rds_client, s3_c, config, event):
        super().__init__(config, event) 
        self.bedrock_runtime = bedrock_runtime
        self.rds_client = rds_client
        self.s3_c = s3_c
        self.m_embbeding = MultimodalEmbeding(bedrock_runtime, config)
        self.llm_prompt = LLMPrompts(bedrock_runtime, config)
        self.doc_pgvctr = DocPGVector(rds_client, config)
        self.session_memory = SessionMemory(bedrock_runtime, rds_client, config)
        self.s3i = S3Interface(s3_c, config)
        self.async_model_response = AsyncModelResponse(bedrock_runtime, config)
        self.primary_model = self.config['models']['primary_model']
        self.secondary_model = self.config['models']['secondary_model']


    async def process_request_stream(self):
        answer = ''
        try:
            run_answer = False
            if self.adhoc_document_path:
                run_answer = True
            else:
                embed_user_question = self.m_embbeding.remove_stop_words(self.user_question)
                embed_user_question = self.m_embbeding.get_titan_embedding(embed_user_question, None)
                response_memory = self.session_memory.get_similar_question_response(embed_user_question)
                if response_memory:
                    self.response_memory_df = pd.DataFrame(response_memory)
                    print(f"response_memory_df handler 1 {self.response_memory_df.shape[0]}") 
                    if self.response_memory_df.shape[0] > 0:
                        answer = self.response_user_memory_df[['llm_response', 'response_images']].to_dict('records') 
                else:
                    run_answer = True
                
            if run_answer: 
                async for response_part in self.execute_model_response_stream():
                    yield response_part
                # Update session memory
                #self.response_memory_entry = pd.DataFrame([{"answer": answer,"session_id": self.session_id,"user_question": self.user_question}])
                #self.response_memory_df = pd.concat([response_memory_entry, self.response_memory_df]).reset_index(drop=True)
            #print(f"answer is \n {answer}")
            #print(f"response_memory_df handler 2 {self.response_memory_df.shape[0]}") 
        except ClientError as e:
            yield self.format_response(400, str(e))
            return

      

        
    async def execute_model_response_stream(self):
        print(f"execute_model_response_stream")
        """
        Process the request and generate a response in streaming mode.
        """
        answer = ''
        accumulated_text_chunks = [{'chunk_number': 0, 'accumulated_text': ''} ,{'chunk_number': 0, 'accumulated_text': ''}]
        accumulated_image_chunks = {}
        accumulated_text_chunks, accumulated_image_chunks, contexts_size = self.prepare_chunks()

        model_id = self.primary_model

        if self.adhoc_document_path:
            async for response_part in self.async_model_response.process_text_question_stream(
                self.doc_text, model_id, self.user_question):
                answer = answer + ''.join(response_part)
                yield response_part
        else:
            session_memory_df = self.session_memory.get_user_session_memory(self.user_id, self.session_id)
            if contexts_size > 0:
                accumulated_text_chunk = accumulated_text_chunks[0]['accumulated_text']
                accumulated_image_chunk = accumulated_image_chunks[0]['accumulated_images']
                async for response_part in self.async_model_response.process_user_question_stream(accumulated_text_chunk, 
                accumulated_image_chunk, session_memory_df, model_id, self.user_question):
                    answer = answer + ''.join(response_part)
                    yield response_part
                yield accumulated_image_chunk
            else:
                pass
        
        print(f"execute_model_response_stream answer is \n {answer}")

    def prepare_chunks(self):
        """
        Prepare accumulated text and image chunks based on the request.
        """
        if self.adhoc_document_path:
            doc_bucket , doc_key = self.s3i.parse_s3_uri(self.adhoc_document_path)
            s3_output_folder = 's3://' + doc_bucket + '/' + self.config['output_details']['output_key']
            self.pdf_parser_inst = PDFDocParserTI(self.s3_c, self.config, self.adhoc_document_path,s3_output_folder)
            page_details, accumulated_chunks, self.doc_text  = self.pdf_parser_inst.process_pdf_pages()
            
            contexts_size = 0
        else:
            print(f"caling get_question_context")
            accumulated_image_chunks = {}
            accumulated_chunks, contexts_size = self.get_question_context()
            print(f"contexts_size is -> {contexts_size}")

        accumulated_chunks_df = pd.DataFrame(accumulated_chunks)
        accumulated_text_chunks = accumulated_chunks_df[['chunk_number','accumulated_text']].to_dict('records') 
        accumulated_image_chunks = accumulated_chunks_df[['chunk_number','accumulated_images']].to_dict('records') 

        return accumulated_text_chunks, accumulated_image_chunks, contexts_size


    def get_question_context(self):
        embed_question_vector = []
        contexts = ''
        print(f"user_question -> {self.user_question}")
        user_question = self.m_embbeding.remove_stop_words(self.user_question)
        embed_question_vector = self.m_embbeding.get_titan_embedding(user_question, None)

        contexts_dict = self.doc_pgvctr.get_doc_cosine_topn_similar_records(5, embed_question_vector, min_threshold=0.6)
        contexts_size = len(contexts_dict)
        print(f"context size -> {contexts_size}")
        print(f"contexts_dict keys {contexts_dict[0].keys()}")

        #save context search in RAG
        columns = self.doc_pgvctr.get_table_column_names(self.session_memory.rag_response_hist_table)
        if contexts_size > 0:
            response_df = pd.DataFrame(contexts_dict)
        else:
            response_df = pd.DataFrame(columns=columns)
        response_df['user_id'] = self.user_id
        response_df['session_id'] = self.session_id
        response_df['user_question'] = self.user_question
        response_df['response_timestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
        response_df['response_date'] = datetime.now().strftime("%Y-%m-%d")
        response_df = response_df[columns]
        sql_parameter_sets = self.doc_pgvctr.format_records(response_df, self.session_memory.rag_response_hist_table)
        insrt_stmnt = self.doc_pgvctr.format_insert_stmnt(self.session_memory.rag_response_hist_table, columns) 
        records = self.doc_pgvctr.batch_execute_statement(insrt_stmnt, sql_parameter_sets)


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
                                                } for _, row in group.iterrows() if row["image_base64"] is not None], 
                                        })).reset_index()
    
            accumulated_chunks = accumulated_chunks_df.to_dict('records') 

        else:
            accumulated_chunks = [{'chunk_number': 0, 'accumulated_text': '', 'accumulated_images': {}}]

        return accumulated_chunks, contexts_size
