import json
import pandas as pd
from embbed_docs import MultimodalEmbeding



class SessionMemory(DocPGVector):
    def __init__(self,bedrock_runtime, rds_client, config):
        super().__init__(rds_client, config) 
        self.m_embbeding = MultimodalEmbeding(bedrock_runtime, config)
        self.llm_prompt = LLMPrompts(bedrock_runtime, config)

    
    @property
    def session_memory_table(self):
        return  self.config['session_memory_table']['name']
        
    @session_memory_table.setter
    def session_memory_table(self, value):
        if not isinstance(value, str):
            raise ValueError("Name must be a string")
        self.session_memory_table = value
    @property
    def session_columns(self):
        return self.config['session_details']['session_columns']
        
    @session_columns.setter
    def session_columns(self, value):
        if not isinstance(value, list):
            raise ValueError("Name must be a list")
        self.session_columns = value

    @property
    def session_length(self):
        return self.config['session_details']['session_length']
        
    @session_length.setter
    def session_length(self, value):
        if not isinstance(value, int):
            raise ValueError("Name must be an integer")
        self.session_length = value

    def initialize_session(self):
        self.session_memory_df = pd.DataFrame(columns = self.session_columns)

    def get_similar_question_response(self,  user_question):
        user_question = self.m_embbeding.remove_stop_words(user_question)
        user_question_embedding = self.m_embbeding.get_titan_embedingd(user_question, None)
        return self.get_similar_question_response(user_question_embedding)


    def get_user_session_memory(self, user_id, session_id):
        sql_stmnt = f"""select user_id, session_id, llm_response_sumarization 
                    from {self.session_memory_table}
                    where user_id = {user_id} and session_id = {session_id}
                    order by session_timestamp desc limit {self.session_length};
        """

        response = self.execute_statement(sql_stmnt) 
        return self.formatOutputJsonRecords(response)

    def set_user_session_memory(self, user_id, session_id, llm_response):
        llm_response_sumarization = self.summarize_response(llm_response)


    def summarize_response(self, llm_response):
        prompt_instructions = f"""1. summarize this text. \
                                  2. The summary should not exceed 1 paragraph.\
                                  3. The summary should only be based on text context {llm_response} .\
                                  4. give a response based on context. 
                                  5. your response should only be the summary, nothing else.
                                  """
        response_prompt = self.llm_prompt.execute_text_prompt(prompt_instructions)
        response_prompt = re.sub(r'[\n\r\t]', ' ', response_prompt)


    def get_similar_question_response(self, similarity_vector, min_threshold=0.9, top_n=1):
        sql_stmnt = f"""select user_question, llm_response, response_images ,
                1 - (question_embedding <=> '{similarity_vector}') as cosine_similarity
                from {self.session_memory_table} 
                where (1 - (question_embedding <=> '{similarity_vector}')) > {min_threshold} 
                ORDER BY cosine_similarity DESC LIMIT { top_n}) topn_srch; """
        response = self.execute_statement(sql_stmnt) 
        return self.formatOutputJsonRecords(response)