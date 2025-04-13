# dva-Project

# Location Matchmaking Platform: Complete Setup and API Guide

This comprehensive guide will help you set up, deploy, and test the Location Matchmaking Platform API using Docker.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup and Deployment](#setup-and-deployment)
- [Testing the API](#testing-the-api)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Python 3.9+ (for local development)

## Project Structure

Ensure your project is structured as follows:

```
project-root/
│
├── docker-compose.yml
├── dockerfile
├── requirements.txt
│
└── data/
    ├── api.py
    ├── final_data_and_ranking_algorithm.py
    ├── merged_data.xlsx
    └── cost_of_living_data.xlsx
```

## Setup and Deployment

### 1. Create Dockerfile

If you don't already have a Dockerfile, create one in your project root with the following content:

```dockerfile
FROM python:3.9-slim

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

# The command will be provided by docker-compose.yml
```

### 2. Prepare docker-compose.yml

Ensure your docker-compose.yml file looks like this:

```yaml
services:
  app:
    build:
      context: .
      dockerfile: dockerfile
    ports:
      - "8080:8080"  # Expose the web app port
    volumes:
      - ./data:/app/data  # Mount data directory for live updates
    environment:
      - PYTHONUNBUFFERED=1
    command: python data/api.py
```

### 3. Update API File for Relative Paths

Modify your `api.py` file to use relative paths instead of absolute paths:

```python
import flask
import requests
import pandas as pd
import os
from flask import request, jsonify
from final_data_and_ranking_algorithm import compute_ranking

app = flask.Flask(__name__)
app.config["DEBUG"] = True

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Load data files relative to the script location
static_merged_data = pd.read_excel(os.path.join(script_dir, "merged_data.xlsx"))
cost_of_living_data = pd.read_excel(os.path.join(script_dir, "cost_of_living_data.xlsx"))

@app.route("/api/ranking", methods=["POST"])
def get_ranking():
    user_input = request.get_json()
    
    if not user_input:
        return jsonify({"error": "No data provided"}), 400

    try:
        result = compute_ranking(static_merged_data, cost_of_living_data, user_input)
        
        result_json = result.to_dict(orient='records')
        return jsonify({"results": result_json})
        
    except Exception as e:
        import traceback
        return jsonify({
            "error": str(e),
            "traceback": traceback.format_exc()
        }), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
```

### 4. Fix Ranking Algorithm Module

Update your `final_data_and_ranking_algorithm.py` to have test code inside an `if __name__ == "__main__":` block:

```python
# Make sure all your core functionality is in functions
def compute_ranking(static_merged_data, cost_of_living_data, user_input):
    # Your algorithm code here
    # ...

# Only run this code when executed directly, not when imported
if __name__ == "__main__":
    # Test code here
    # Example:
    import pandas as pd
    static_merged_data = pd.read_excel("merged_data.xlsx")
    cost_of_living_data = pd.read_excel("cost_of_living_data.xlsx")
    # ...
```

### 5. Build and Start the Container

From your project root directory, run:

```bash
docker-compose up --build
```

This command will:
- Build the Docker image using your Dockerfile
- Start a container based on that image
- Mount your data directory
- Start the Flask API on port 8080

## Testing the API

### Basic Connection Test

Once the container is running, verify the API is accessible:

```bash
curl http://localhost:8080
```

You may get a 404 error since we don't have a root endpoint, but that confirms the server is running.

### Simple Ranking Request

Test the API by sending a POST request with minimal user preferences:

```bash
curl -X POST http://localhost:8080/api/ranking \
  -H "Content-Type: application/json" \
  -d '{
    "state": "",
    "num_adults": 2,
    "num_children": 0,
    "Average Temperature F": 70
  }'
```

### Testing with Sample Files

Create a sample input file (e.g., `test_input.json`) with more parameters:

```json
{
  "state": "CALIFORNIA",
  "num_adults": 2,
  "num_children": 1,
  "Air Pollution: Particulate Matter": 8.5,
  "Life Expectancy": 80,
  "Unemployment_Rate": 4.5,
  "crime_rate_per_100000": 350
}
```

Then test using the file:

```bash
curl -X POST http://localhost:8080/api/ranking \
  -H "Content-Type: application/json" \
  -d @test_input.json
```

## API Documentation

### Endpoint

- **URL**: `/api/ranking`
- **Method**: POST
- **Content-Type**: application/json

### Request Format

The API expects a JSON object with user preferences. Parameters generally fall into these categories:

### Required Parameters:
- `num_adults`: Number of adults in the household
- `num_children`: Number of children (can be blank if none)

### Optional Filter Parameter:
- `state`: Filter results to a specific state (leave blank for nationwide search)

### Optional Ranking Parameters:
- **Risk & Resilience Metrics**:
  - `RISK_VALUE`, `RISK_SCORE`, `RISK_SPCTL`, `RISK_RATNG`
  - `RESL_VALUE`, `RESL_SCORE`, `RESL_SPCTL`, `RESL_RATNG`

- **Cost of Living Metrics**:
  - `Monthly_Childcare`, `Monthly_Food`, `Monthly_Healthcare`
  - `Monthly_Housing`, `Monthly_Other Necessities`, `Monthly_Taxes`
  - `Monthly_Total`, `Monthly_Transportation`

- **Health & Wellbeing Metrics**:
  - `Access to Exercise Opportunities`, `Food Environment Index`
  - `Primary Care Physicians`, `Air Pollution: Particulate Matter`
  - `Broadband Access`, `Life Expectancy`, `Traffic Volume`
  - `Homeownership`, `Access to Parks`

- **Weather Metrics**:
  - `Average Temperature F`, `Maximum Temperature F`
  - `Minimum Temperature F`, `Precipitation_inches`

- **Housing Market Metrics**:
  - `median_sale_price`, `median_list_price`, `median_ppsf`
  - `homes_sold`, `new_listings`, `inventory`
  - `months_of_supply`, `median_dom_months`

- **Economic Metrics**:
  - `Unemployment_Rate`, `crime_rate_per_100000`

### Example Use Cases

#### Finding Family-Friendly Locations

```json
{
  "num_adults": 2,
  "num_children": 2,
  "state": "TEXAS",
  "Access to Parks": 80,
  "Food Environment Index": 8,
  "Primary Care Physicians": 80,
  "Air Pollution: Particulate Matter": 7,
  "crime_rate_per_100000": 300
}
```

#### Finding Affordable Locations

```json
{
  "num_adults": 1,
  "num_children": 0,
  "Monthly_Housing": 1000,
  "Monthly_Total": 3000,
  "median_sale_price": 350000
}
```

#### Finding Locations with Good Weather

```json
{
  "num_adults": 2,
  "num_children": 0,
  "Average Temperature F": 70,
  "Precipitation_inches": 30,
  "Maximum Temperature F": 85
}
```

### Response Format

The API returns JSON with county rankings:

```json
{
  "results": [
    {
      "STATE": "CALIFORNIA",
      "COUNTY": "SANMATEO",
      "rank": 1
    },
    {
      "STATE": "CALIFORNIA",
      "COUNTY": "SANTACRUZ",
      "rank": 1
    }
  ]
}
```

Counties with the same rank represent equally matched results.

## Troubleshooting

### Common Issues

#### 1. Port Conflicts
If port 8080 is already in use on your machine, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "8081:8080"  # Change 8081 to any available port
```

#### 2. Data File Access Issues
If the API can't find the data files:
- Ensure your Excel files are in the correct location in the `data/` directory
- Check file permissions: `chmod 644 data/*.xlsx`
- Verify the container can access the files:
  ```bash
  docker exec -it <container_id> ls -la /app/data
  ```

### Making Changes

- **Code Changes**: Any changes to Python files in the `data/` directory will take effect immediately due to volume mounting.
- **Dependency Changes**: If you update `requirements.txt`, rebuild the container:
  ```bash
  docker-compose up --build
  ```
- **Data Changes**: If you update the Excel files, the changes will be available immediately.

---

This guide should help you successfully set up, deploy, and test your Location Matchmaking Platform API. If you encounter issues not covered here, check Docker and Flask documentation for additional troubleshooting steps.
