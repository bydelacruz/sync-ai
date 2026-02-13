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

## Prerequisites

- **Docker** (for the PostgreSQL + pgvector database)
- **Python 3.10+** & **Poetry** (for the backend)
- **Node.js 18+** & **npm** (for the frontend)

---

## Setup & Installation

### 1. Start the Database

We use a specialized Docker image that includes the `pgvector` extension for AI math operations.

```bash
# Run the database container
docker run --name task_db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=task_db \
  -p 5432:5432 \
  -d pgvector/pgvector:pg15
```

### 2. Backend Setup

Navigate to the root directory (or `/backend` if you structured it that way).

```bash
# Install Python dependencies
poetry install

# Create .env file
touch .env
```

**Add the following to your `.env` file:**

```ini
DATABASE_URL=postgresql://postgres:password@localhost/task_db
SECRET_KEY=your_super_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Keys
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_google_gemini_key
```

### 3. Frontend Setup

Navigate to the `frontend` directory.

```bash
cd frontend

# Install Node dependencies
npm install
```

---

## Running the Application

You will need three terminal windows running simultaneously:

**Terminal 1: Database**

```bash
docker start task_db
```

**Terminal 2: Backend API**

```bash
poetry run uvicorn app.main:app --reload
```

_API will run at: http://127.0.0.1:8000_

**Terminal 3: Frontend UI**

```bash
cd frontend
npm run dev
```

_UI will run at: http://localhost:5173_

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
> To test authentication:
>
> 1.  Use **HTTPie**, **Postman**, or **cURL** to hit the login endpoint:
>     ```bash
>     http POST [http://127.0.0.1:8000/users/login](http://127.0.0.1:8000/users/login) username=benny password=password123
>     ```
> 2.  Copy the `access_token` from the response.
> 3.  Click the **Authorize** button in Swagger UI and paste the token (Value: `Bearer <your_token>`) to unlock the protected endpoints.
