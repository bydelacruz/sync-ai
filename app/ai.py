import google.generativeai as genai
from dotenv import load_dotenv
import os

# get the API key from the environment
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")


def get_embedding(text: str):
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")

    # Configure the library
    genai.configure(api_key=api_key)

    # We need to specify the model.
    model = "models/gemini-embedding-001"

    result = genai.embed_content(
        model=model,
        content=text,
        task_type="retrieval_document",
        output_dimensionality=768,
    )

    return result["embedding"]
