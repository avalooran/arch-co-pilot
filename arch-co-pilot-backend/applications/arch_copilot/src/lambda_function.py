import json
import yaml
import logging
from datetime import datetime
from botocore.exceptions import ClientError
import boto3
import pandas as pd

from common.session_memory import SessionMemory
from common.utils import load_config
from process_event import ProcessEvent
from process_request import ProcessRequest



logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

common_config = load_config("common/config.yaml")
app_config = load_config("arch_copilot/config.yaml")
config = {**common_config, **app_config}

print(f"config --- \n {config}")

s3_c = boto3.client('s3')
bedrock_runtime = boto3.client(service_name='bedrock-runtime')
rds_client = boto3.client('rds-data')

sesn_memory = SessionMemory(bedrock_runtime, rds_client, config)

global response_memory_df

response_memory_df = sesn_memory.session_memory_df

print(f"response_memory_df init1 {response_memory_df.shape}") 

def lambda_handler(event, context):
    global response_memory_df
    print(f'event --> {event}')
      
    #validate event, Parse body, headers
    #proc_event = ProcessEvent(config, event)
    proc_request = ProcessRequest(bedrock_runtime, rds_client, s3_c, config, event, response_memory_df)
    answer = proc_request.process_request()
    
 
event = {"headers": {"conversationtopic": "abc", "eventdatetime": "abc", "sessionid": "abc", "userid": "abc"}, 
          "body": '{"userQuestion": "What is Data Mesh?", \
          "addHocDocumentPath": "s3://arch-copilot-files-store/input_files/Data_Mesh_Architecture_latest.pdf"}'}
context = ''

lambda_handler(event, context)
