# Sync AI

## Description

This is an app that helps you manage tasks while using integrated AI to generate short summaries of your task descriptions.

## Prerequisites 🛠️

- Docker
- Poetry

## Setup & Installation ⚙️

1.  **Clone the repository**
2.  **Install dependencies:**
    ```bash
    poetry install
    ```
3.  **Environment Variables:**
    - Create a `.env` file with `GROQ_API_KEY`

## Running the Application 🚀

**1. Start the Database:**

```bash
docker start task_db
# OR (if creating for the first time):
# docker run --name task_db -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

**2. Start the Server:**

```bash
poetry run uvicorn main:app --reload
```

## API Documentation 📖

Once running, go to: http://127.0.0.1:8000/docs
