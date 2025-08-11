# Multi-stage build for the Restaurant Booking App
FROM node:18-alpine AS frontend-builder

# Build the React frontend
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci --only=production

COPY web/ ./
RUN npm run build

# Python backend stage
FROM python:3.11-slim AS backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8080

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the backend application
COPY app/ ./app/
COPY .env ./

# Copy the built frontend from the previous stage
COPY --from=frontend-builder /app/web/dist ./static

# Create necessary directories and initialize database
RUN mkdir -p /app/data
RUN python -m app.init_db

# Create a startup script
RUN echo '#!/bin/bash\n\
python -m app.init_db\n\
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT' > /app/start.sh \
    && chmod +x /app/start.sh

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/docs || exit 1

# Run the application
CMD ["/app/start.sh"]
