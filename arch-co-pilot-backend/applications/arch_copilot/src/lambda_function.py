import json
import yaml
import logging
from datetime import datetime
from botocore.exceptions import ClientError
import boto3
from proces_upload_doc import execute_model_response1
import pandas as pd
from utils import load_config



logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

config = load_config("config.yaml")

s3_c = boto3.client('s3')
bedrock_runtime = boto3.client(service_name='bedrock-runtime')
rds_client = boto3.client('rds-data')




global response_memory_df


response_memory_df = pd.DataFrame(columns = ["answer", "session_id", "user_question"])
print(f"response_memory_df init {response_memory_df.shape}") 

primary_foundation_model = config['bedrock_agent']['primary_foundation_model']
secondary_foundation_model = config['bedrock_agent']['secondary_foundation_model']



def lambda_handler(event, context):
    global response_memory_df
    print(f'event --> {event}')
      
    #validate event
    #validate_event_format(event)
    
    # Parse headers
    headers = event.get('headers', {})
    print(f"headers 0 -> {headers}")

    # Parse body
    try:
        body = json.loads(event['body'])
        #body = event['body']
        print(f"body -> {body}")
        user_question = body['userQuestion']
        print(f"type body {type(body)}")
        print(f"user_question -> {user_question}")
        adhoc_document_path = body.get('addHocDocumentPath', None)
        print(f"adhoc_document_path --> {adhoc_document_path}")
    except (json.JSONDecodeError, KeyError) as e:
        return response(400, {"error": f"Invalid body or missing required fields: {str(e)}"},headers)

    # Process the request 
    try:
        run_answer = False
        session_id = headers['sessionid']
        print(f"response_memory_df handler 1 {response_memory_df.shape[0]}") 
        if response_memory_df.shape[0] > 0:
            response_user_memory_df = response_memory_df[(response_memory_df['session_id'] == session_id) & (response_memory_df['user_question'] == user_question)]
            if response_memory_df.shape[0] > 0:
                print(f"response_user_memory ->  {response_user_memory_df[['answer']].to_dict('records')}") 
                answer = response_user_memory_df[['answer']].to_dict('records') 
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
            answer = execute_model_response1(bedrock_runtime, rds_client, session_id, user_question, adhoc_document_path)
            response_answer_memory_df = pd.DataFrame([{"answer": answer, "session_id": session_id, "user_question": user_question}])
            response_memory_df = pd.concat([response_answer_memory_df, response_memory_df]).reset_index(drop=True) 
        print(f"response_memory_df handler 2 {response_memory_df.shape[0]}") 
    except ClientError as e:
        return response(400, {"error": {str(e)}, "event": event},headers)
        
    # Construct response body
    response_body = {
        "answer": answer,
        "event": event 
    } 

    # Return successful response
    return response(200, response_body,headers)


# Utility function to generate response with CORS headers
def response(status_code, body,headers):
    # Parse headers
    
    event_datetime = headers['eventdatetime']
    session_id = headers['sessionid']
    user_id = headers['userid']
    conversation_topic = headers['conversationtopic']
        
    return {
        "statusCode": status_code,
        "body": json.dumps(body),
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",  # CORS header to allow all origins
            "Access-Control-Allow-Headers": "Content-Type,eventDatetime,sessionId,userId,conversationTopic",
            "Access-Control-Allow-Methods": "POST",  # Allow POST method
            "sessionId": session_id,
            "userId": user_id,
            "conversationTopic": conversation_topic,
            "eventDatetime": datetime.utcnow().isoformat() + 'Z'
        }
    }
 
 