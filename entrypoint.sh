#!/bin/sh

# 1. Run Migrations
# This applies any pending Alembic changes to the database
echo "Running Database Migrations..."
alembic upgrade head

# 2. Start the Application
# This hands over control to the actual API server
echo "Starting Server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
