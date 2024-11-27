import json
import boto3
import logging
import pandas as pd
import yaml
from common.embbed_docs import MultimodalEmbeding
from store_embeddings import StoreEmbeddings
from common.s3_interface import S3Interface
from common.utils import timeit, load_config
from common.pgvector_interface import PGVectorInterface


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

common_config = load_config("common/config.yaml")
app_config = load_config("arch_rag_builder/config.yaml")
config = {**common_config, **app_config}

print(f"config --- \n {config}")


s3_c = boto3.client('s3')
bedrock_runtime = boto3.client(service_name='bedrock-runtime')
rds_client = boto3.client('rds-data')



def lambda_handler(event, context):
    
    print(event)
    
  
    s3_obj = S3Interface(s3_c, config)
    
    s3_record = event['Records'][0] 
    #for sqs evnts
    s3_record = json.loads(s3_record['body'])
    print(f's3_record {s3_record}')
    
    s3_record = s3_record['Records'][0]
    print(f's3_record1 {s3_record}')
    #for sqs evnts 

    doc_bucket = s3_record['s3']['bucket']['name']
    doc_key = s3_record['s3']['object']['key']
    print(f"doc_bucket --> {doc_bucket}; doc_key --> {doc_key}") 
    file_name = doc_key.split('/')[-1]
    s3_pdf_path = 's3://' + doc_bucket + '/' + doc_key
    s3_output_folder = 's3://' + doc_bucket.replace('input','output') + '/' + doc_key.replace('current','rag-images').replace(file_name, '')
  
    
    print(f"s3_pdf_path --> {s3_pdf_path} \n s3_output_folder -> {s3_output_folder}")
    
    
    store_embeddings = StoreEmbeddings(s3_c,bedrock_runtime, rds_client, config, s3_pdf_path,s3_output_folder)


    delete_existing_recs = store_embeddings.delete_related_tables_records(store_embeddings.main_doc_table, store_embeddings.embedding_tables,'document_filename', store_embeddings.document_filename)
    
    records = store_embeddings.store_doc_details()
    records = store_embeddings.main_embedding()
    records = store_embeddings.search_embedding()
    s3_obj = S3Interface(s3_c,config)
    s3_obj.delete_s3_object(doc_bucket, doc_key)

   
    

event = {'Records': [{'messageId': '2c0c10e2-728d-4e88-8904-56f58a062269', 'receiptHandle': 'AQEBsoHHrNqfUu83MSDwJLQPP0ulJu1ny1qjImqJUvilO4+pvIxqMSmq6ga+zUKiKkMtgLvzpluA0TdBYmJyn2nFHpcg7sF5eJuw9+jQhOpw04skc4UWt/Y16WWF5BAwaDryLG9lXYXPnOuUpIuk8b4fQJfo8vr3AIGh4rZgfniXB+WEuZ4OeqEgXhQnvVHYgHzkjIehOuBVkZZmzZ2SFSqQMuG+biICLGpMgHa9xUSYq4ugjXzSREe9pejpi94pVkPtBKvBJMl4GhWCCbieOedJ/E6pz43KwFuJOpsK0dNABTvrOKcjjVAxSAKwT45lxKgB9gU4JiKnuB/+FcfYtCqJXLBu1IWDI7Az9+ik6LTlJXoiM8gActSpxcwbEOHNU9agE94EtR2o9v++F5ZyxNBASnHoswSPQbZmwPxvhebQSl4=', 'body': '{"Records":[{"eventVersion":"2.1","eventSource":"aws:s3","awsRegion":"us-east-1","eventTime":"2024-11-27T18:10:56.434Z","eventName":"ObjectCreated:Copy","userIdentity":{"principalId":"AWS:AROAQYEI4T5UL65LBHCUV:arch-copilot-onboard-docs"},"requestParameters":{"sourceIPAddress":"44.213.132.198"},"responseElements":{"x-amz-request-id":"5PK7DBF3889KGFJ6","x-amz-id-2":"sdMbbvAfM36wSJhpcNgjgk998CMkgVUNdKk53TQYqx/CgpwSI56eikEjzIyB6d/UgyNK/8EcEGnEq3/YXdb5LOb3HAj/htOt"},"s3":{"s3SchemaVersion":"1.0","configurationId":"sqs-send-rag-white","bucket":{"name":"arch-copilot-rag-input-white","ownerIdentity":{"principalId":"A699FYZ6X0IHG"},"arn":"arn:aws:s3:::arch-copilot-rag-input-white"},"object":{"key":"current/kafka/confluent/confluent-lineage/confluent-lineage.pdf","size":2153578,"eTag":"f1782cb3b718fe4b7b5fc1a0b8164cc6","sequencer":"00674760B047BD3051"}}}]}', 'attributes': {'ApproximateReceiveCount': '1', 'AWSTraceHeader': 'Root=1-674760a7-452ce73b257186277647a255;Parent=3d8cad48083da8cc;Sampled=0;Lineage=1:8f5c72a1:0', 'SentTimestamp': '1732731057254', 'SenderId': 'AROA4R74ZO52XAB5OD7T4:S3-PROD-END', 'ApproximateFirstReceiveTimestamp': '1732731057257'}, 'messageAttributes': {}, 'md5OfBody': '1cb68d7a1da2fc06062a17dd4357b034', 'eventSource': 'aws:sqs', 'eventSourceARN': 'arn:aws:sqs:us-east-1:051826696040:sqs-arch-copilot-rag-ingestion', 'awsRegion': 'us-east-1'}]}
    
lambda_handler(event, 'context')