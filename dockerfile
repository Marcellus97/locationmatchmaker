FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy necessary files
# Note: Your actual data files will be mounted as a volume
# as specified in docker-compose.yml

# Set environment variables
ENV PYTHONUNBUFFERED=1

# Expose the port used by the application
EXPOSE 8080
