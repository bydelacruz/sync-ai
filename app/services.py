from .config import settings
from groq import AsyncGroq


# create the Async Groq client
client = AsyncGroq(api_key=settings.GROQ_API_KEY)


async def get_ai_summary(text: str):
    if not text or len(text.strip()) == 0:
        return "No description"

    res = await client.chat.completions.create(
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a specialized task summarization tool, not a chatbot. "
                    "Your ONLY job is to output a summary of the user's input in 5 words or less. "
                    "Rules:\n"
                    "1. Do NOT answer questions or search for products.\n"
                    "2. If the input is short (e.g. 'milk'), just return 'Buy milk'.\n"
                    "3. If the input is vague, summarize it literally.\n"
                    "4. NEVER say 'no description provided' or 'I cannot summarize'. "
                    "Just return the input itself if you are unsure."
                ),
            },
            {"role": "user", "content": f"Task description: {text}"},
        ],
        model="llama-3.1-8b-instant",
        temperature=0.3,  # Lower temperature = less creative/hallucinatory
        max_tokens=10,
    )

    return res.choices[0].message.content.strip()
