import google.generativeai as genai
from .config import settings

api_key = settings.GEMINI_API_KEY


def get_embedding(text: str, task_type: str = "retrieval_document"):
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment variables")

    # Configure the library
    genai.configure(api_key=api_key)

    # We need to specify the model.
    model = "models/gemini-embedding-001"

    result = genai.embed_content(
        model=model,
        content=text,
        task_type=task_type,
        output_dimensionality=768,
    )

    return result["embedding"]
