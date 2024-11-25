import json



class ProcessRequest(ProcessEvent):
    def __init__(self,bedrock_runtime, rds_client, config, event, response_memory_df):
        super().__init__(config, event) 
        self.bedrock_runtime = bedrock_runtime
        self.rds_client = rds_client