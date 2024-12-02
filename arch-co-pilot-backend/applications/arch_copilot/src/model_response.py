import asyncio
import boto3
import json
import pandas as pd

class AsyncBedrockLLMHandler:
    def __init__(self, config):
        """
        Initialize the class with configuration.
        :param config: Dictionary containing models and other configurations.
        """
        self.config = config
        self.bedrock_client = boto3.client("bedrock-runtime")  # Synchronous boto3 client

    async def invoke_bedrock_stream(self, model_id, body):
        """
        Asynchronously invoke the Bedrock model in streaming mode.
        :param model_id: ID of the model to invoke.
        :param body: Payload to send to the Bedrock API.
        :return: Async generator yielding responses.
        """
        def sync_invoke_model_stream():
            return self.bedrock_client.invoke_model_with_response_stream(
                modelId=model_id,
                contentType="application/json",
                body=body
            )

        response = await asyncio.to_thread(sync_invoke_model_stream)
        stream = response.get("body")

        # Return an async generator for the streaming response
        async for line in stream.iter_lines():
            if line:
                yield json.loads(line.decode("utf-8"))

    async def process_doc_question_stream(self, accumulated_text_chunks, accumulated_image_chunks, model_id, question_type):
        """
        Process document questions and return results in streaming mode.
        :param accumulated_text_chunks: Text chunks for context.
        :param accumulated_image_chunks: Image chunks associated with the text.
        :param model_id: Bedrock model ID.
        :param question_type: Type of question.
        :return: Async generator for streaming responses.
        """
        max_tokens = self.config['models']['max_tokens']

        for indx, accumulated_text in enumerate(accumulated_text_chunks):
            if indx == 0:
                continue  # Skip the first chunk

            context = accumulated_text['accumulated_text']
            chunk_number = accumulated_text['chunk_number']

            # Process images for the chunk
            if accumulated_image_chunks:
                accumulated_images_for_chunk = next(
                    item['accumulated_images']
                    for item in accumulated_image_chunks
                    if item['chunk_number'] == chunk_number
                )
                images_df = pd.DataFrame(accumulated_images_for_chunk)
                doc_images = images_df.to_dict(orient="records")
            else:
                doc_images = []

            # Construct the input for the LLM
            input_text = f"""
                Answer the question from the user {question_type} using the following context: {context}.
                If the context contains images, provide the image details as a JSON list.
            """

            message = {
                "role": "user",
                "content": [
                    *doc_images,
                    {"type": "text", "text": input_text}
                ]
            }

            body = json.dumps({
                "messages": [message],
                "maxTokens": max_tokens,
                "temperature": self.config['models']['temperature']
            })

            # Stream the responses
            async for response_part in self.invoke_bedrock_stream(model_id, body):
                yield response_part


