FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
COPY requirements-optional.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Try to install optional dependencies (won't fail if they don't install)
RUN pip install --no-cache-dir -r requirements-optional.txt || true

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
