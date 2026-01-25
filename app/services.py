import os
from dotenv import load_dotenv
from groq import AsyncGroq

# load environment variables from .env file
load_dotenv()

# create the Async Groq client
client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))


async def get_ai_summary(text: str):
    res = await client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": "Summarize the following task description in 5 words or less",
            },
            {"role": "user", "content": text},
        ],
        model="llama-3.1-8b-instant",
    )

    return res.choices[0].message.content
