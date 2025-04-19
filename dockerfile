FROM python:3.11-slim

# Upgrade pip so we get the latest wheel resolver
RUN pip install --upgrade pip

WORKDIR /app

# Copy only requirements, then install
COPY requirements.txt ./
RUN pip install --no-cache-dir --prefer-binary -r requirements.txt

# Copy your app code
COPY . .

ENV PYTHONUNBUFFERED=1
EXPOSE 8080

CMD ["gunicorn", "-k", "gevent", "-w", "4", "-b", "0.0.0.0:8080", "api:app"]

