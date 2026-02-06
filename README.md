# Sync AI 🧠

## Description

Sync AI is an intelligent task management API that goes beyond standard To-Do lists. It utilizes Generative AI to automatically summarize task descriptions and implements Semantic Search, allowing users to find tasks based on meaning (e.g., searching "hungry" finds "Buy Groceries") rather than just keyword matching.

## Tech Stack 🛠️

- **Framework:** FastAPI
- **Database:** PostgreSQL with `pgvector` extension
- **AI/LLM:** Groq (Llama 3) for summarization
- **Embeddings:** Google Gemini for vectorization
- **Testing:** Pytest with mocking
- **CI/CD:** GitHub Actions

## Prerequisites

- Docker (for the database)
- Poetry (for Python dependency management)

## Setup & Installation ⚙️

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    poetry install
    ```
3.  **Environment Variables:**
    Create a `.env` file in the root directory with the following secrets:
    ```ini
    DATABASE_URL=postgresql://postgres:password@localhost/task_db
    SECRET_KEY=your_secret_key_here
    ALGORITHM=HS256
    ACCESS_TOKEN_EXPIRE_MINUTES=30
    GROQ_API_KEY=your_groq_api_key
    GEMINI_API_KEY=your_gemini_api_key
    ```

## Running the Application 🚀

### 1. Start the Database (Important!)

We utilize **pgvector** for semantic search. You must use a Docker image that supports this extension.

```bash
# Run a new container with pgvector support
docker run --name task_db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=task_db -p 5432:5432 -d pgvector/pgvector:pg15

# If the container is already created and stopped:
docker start task_db
```

### 2. Start the Server

```bash
poetry run uvicorn app.main:app --reload
```

## Running Tests 🧪

To run the test suite (which includes mocked AI responses):

```bash
poetry run pytest
```

## API Documentation 📖

Once the server is running, access the interactive Swagger UI:
http://127.0.0.1:8000/docs

> **⚠️ Note on Authentication:**
> The `/users/login` endpoint expects a **JSON body**, whereas the default Swagger UI "Authorize" button sends **Form Data**.
>
> To test authentication:
>
> 1.  Use **HTTPie**, **Postman**, or **cURL** to hit the login endpoint:
>     ```bash
>     http POST [http://127.0.0.1:8000/users/login](http://127.0.0.1:8000/users/login) username=benny password=password123
>     ```
> 2.  Copy the `access_token` from the response.
> 3.  Click the **Authorize** button in Swagger UI and paste the token (Value: `Bearer <your_token>`) to unlock the protected endpoints.
