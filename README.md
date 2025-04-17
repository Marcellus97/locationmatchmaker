# dva-Project


## Project Dir



## Running the D3 Visualization

This guide explains how to clone the repository and run the **d3-viz** application on both **Windows** and **Linux** (or **WSL**). After following these steps, you’ll have a local development server running your D3-based visualizations in the browser.

---

### Prerequisites

- **Git**: to clone the repository.
- **Node.js** (includes `npm`): to install and manage dependencies.

You can verify if you have these tools by running:
```_bash_
git --version
node -v
npm -v
```

### Step-By-Step Guide (Windows/Linux)

#### 1. Clone the Repository
Open your terminal (PowerShell/Command Prompt in Windows; _bash_ in Linux/WSL) and clone the repo:


``` _bash_
git clone https://github.gatech.edu/snima3/dva-Project.git
```

Then navigate into the newly cloned directory. If your project structure has the d3-viz folder, for example:

``` _bash_
cd dva-Project/d3-viz
```

#### 2. Install Dependencies
Inside the `d3-viz` folder, install all Node.js dependencies:

``` _bash_
npm install
```
This command looks at the `package.json` file and downloads everything needed into a `node_modules` folder.

#### 3. Start the Local Server
Once installation is complete, start the development server with:

``` _bash_
npm start
```
This launches a lightweight HTTP server (via `http-server`) serving the current directory on a default port (often `8080`).

#### 4. View the Visualization
Open your browser and navigate to:

http://localhost:8080

If your `index.html` is in the root of `d3-viz`, you should see your D3 visualization. If you’re using additional HTML files, be sure to point your browser to the correct path (e.g., http://localhost:8080/anotherPage.html).

#### 5. Editing the Code
The main entry point is typically `index.html` within the `d3-viz` folder.

`main.js` contains your D3 JavaScript code.

`styles.css` (or any other CSS file) handles your custom styling.

You can also take advantage of _Bootstrap_ or _Tailwind_ for a more polished layout.

As you save changes, just refresh your browser to see them. If you want live-reloading, consider using live-server or another dev tool.


### Windows vs. Linux/WSL
#### Windows:

Open PowerShell or Command Prompt in the d3-viz folder and run:

``` _bash_
npm install
npm start
```
Navigate to http://localhost:8080 in your browser.

#### Linux / WSL:

In your __bash__ (Ubuntu, etc.), run the same commands inside the project folder:

``` _bash_
npm install
npm start
```
Then open http://localhost:8080 in a browser. You can use a Windows browser even when running Node in WSL.

In most cases, there’s no difference in how you run this app on different platforms—just make sure you’re in the right directory when installing or starting.

##### Troubleshooting
- Port Already in Use
    - If http-server errors out with “Address already in use,” specify a different port:

``` _bash_
npx http-server . -p 3000
```
Then visit http://localhost:3000.

- Permission Errors (Linux/WSL)

    - If you get permission denied errors, you might need to adjust the file ownership with chown or temporarily use sudo (though this is rarely necessary if your permissions are correct).
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

### 3. Build and Start the Container

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
