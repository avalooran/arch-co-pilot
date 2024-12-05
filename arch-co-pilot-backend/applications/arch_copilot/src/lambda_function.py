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
from process_request import AsyncProcessRequest




logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

common_config = load_config("common/config.yaml")
app_config = load_config("arch_copilot/config.yaml")
config = {**common_config, **app_config}

print(f"config --- \n {config}")

s3_c = boto3.client('s3')
bedrock_runtime = boto3.client(service_name='bedrock-runtime')
rds_client = boto3.client('rds-data')


def lambda_handler(event, context):
    print(f'event --> {event}')
      
    #validate event, Parse body, headers
    #proc_event = ProcessEvent(config, event)
    proc_request = AsyncProcessRequest(bedrock_runtime, rds_client, s3_c, config, event)
    answer = proc_request.process_request()
    

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio

app = FastAPI()





async def stream_response(event):
    """
    Endpoint to stream Bedrock responses.
    """

    async_proc_request = AsyncProcessRequest(bedrock_runtime, rds_client, s3_c, config, event)
    print("AsyncProcessRequest initialized ")

    async def response_generator():
        async for response in async_proc_request.process_request_stream():
            yield f" {response} \n\n"

    async for data in response_generator():
        print(data)

    return StreamingResponse(response_generator(), media_type="text/event-stream")

    
 
event = {"headers": {"conversationtopic": "abc", "eventdatetime": "abc", "sessionid": "abc", "userid": "abc"}, 
          "body": '{"userQuestion": "What is Data Mesh?", \
          "addHocDocumentPath": "s3://arch-copilot-files-store/input_files/Data_Mesh_Architecture_latest.pdf"}'}

 
event = {"headers": {"conversationtopic": "abc", "eventdatetime": "abc", "sessionid": "abc", "userid": "abc"}, 
          "body": '{"userQuestion": "how can Cluster Linking be used ? How can it be used for disaster recovery?"}'}

context = ''

#lambda_handler(event, context)

asyncio.run(stream_response(event))  