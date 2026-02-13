# Sync AI

## Description

**Sync AI** is a full-stack, intelligent task management application designed to bridge the gap between "lazy user input" and "accurate retrieval."

Unlike standard To-Do lists that rely on exact keyword matches, Sync AI utilizes **Vector Embeddings** and **Semantic Search** to understand the _context_ of your tasks.

- **Example:** If you create a task "Buy Groceries" with the description "Get milk and eggs," searching for **"food"** or **"breakfast"** will find it—even though those words appear nowhere in the text.

## Key Features

- ** AI-Powered Semantic Search:** Uses Google Gemini Embeddings (`embedding-001`) to rank tasks by meaning, not just keywords.
- ** Auto-Summarization:** Automatically generates concise summaries for long task descriptions using Generative AI (Groq/Llama 3).
- ** Modern UI:** A responsive, dark-mode interface built with React & Tailwind CSS.
- ** Instant Feedback:** Features Skeleton Loaders and Optimistic UI updates for a "zero-latency" feel.
- ** Tuned Precision:** Vector search algorithm tuned with a **0.30 cosine similarity threshold** to distinguish between closely related concepts (e.g., "Groceries" vs. "Dinner") and noise.

## Tech Stack

### Frontend

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State Management:** React Context API

### Backend

- **Framework:** FastAPI
- **Database:** PostgreSQL with `pgvector` extension
- **ORM:** SQLAlchemy
- **Testing:** Pytest

### Artificial Intelligence

- **Embeddings:** Google Gemini (`models/gemini-embedding-001`)
- **Summarization:** Groq (Llama 3) / Google Gemini

---

## Quick Start (Docker)

The easiest way to run the application is using Docker Compose. This spins up the Database, Backend, and Frontend in a single command.

### Prerequisites

- **Docker Desktop** installed and running.
- An `.env` file with your API keys (see below).

### 1. Configure Environment

Create a `.env` file in the root directory:

```ini
DATABASE_URL=postgresql://user:password@db/sync_ai_db
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Keys (Required for Summarization & Search)
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Run the App

Run this command in the root directory:

```bash
docker compose up --build
```

Access the application:

- **Frontend App:** http://localhost:5173
- **Backend API Docs:** http://localhost:8000/docs

---

## Local Development (Manual Setup)

If you want to run the services individually for development purposes:

### 1. Start the Database

```bash
docker run --name sync_ai_db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_USER=user \
  -e POSTGRES_DB=sync_ai_db \
  -p 5432:5432 \
  -d pgvector/pgvector:pg15
```

### 2. Backend Setup

```bash
# Install dependencies
poetry install

# Run Server
poetry run uvicorn app.main:app --reload
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Usage Guide

1.  **Sign Up/Login:** Create an account to get your private JWT token.
2.  **Create a Task:** Click "New Task." The AI will automatically generate a summary.
3.  **Search:** Type into the top search bar.
    - Try concepts, not just words!
    - _Query:_ "Workout" -> _Finds:_ "Gym leg day"
    - _Query:_ "Coding" -> _Finds:_ "Fix React bug"
4.  **Manage:** Click any card to view the full description in a modal.

## Running Tests

To run the backend test suite (including mocked AI responses):

```bash
poetry run pytest
```

## API Documentation

Once the server is running, access the interactive Swagger UI:
http://127.0.0.1:8000/docs

> **⚠️ Note on Authentication:**
> The `/users/login` endpoint expects a **JSON body**, whereas the default Swagger UI "Authorize" button sends **Form Data**.
>
> To test authentication via API:
>
> 1.  POST to `/users/login` with JSON body: `{"username": "...", "password": "..."}`
> 2.  Copy the `access_token` from the response.
> 3.  Click **Authorize** in Swagger UI and paste the token (Value: `Bearer <your_token>`).
