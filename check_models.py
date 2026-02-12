import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("❌ Error: GEMINI_API_KEY not found in .env")
    exit()

genai.configure(api_key=api_key)

print("🔍 Listing available embedding models...")
try:
    count = 0
    for m in genai.list_models():
        if "embedContent" in m.supported_generation_methods:
            print(f"✅ FOUND: {m.name}")
            count += 1

    if count == 0:
        print("⚠️ No embedding models found. Check your API Key permissions.")

except Exception as e:
    print(f"❌ Error: {e}")
