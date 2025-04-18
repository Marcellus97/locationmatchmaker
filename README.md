# DVA Project

## Overview

This project is a Python-based web application that uses `gunicorn` as the WSGI HTTP server and `gevent` for asynchronous workers. The application is containerized using Docker, making it easy to deploy and run in any environment. The app listens on port `8080` and is defined in the `api:app` module.

## Prerequisites

Before running the project, ensure you have Docker and Docker Compose installed on your system. You can find installation instructions for your operating system below:

- [Install Docker on Windows](https://docs.docker.com/desktop/install/windows/)
- [Install Docker Compose on Windows](https://docs.docker.com/compose/install/)
- [Install Docker on Mac](https://docs.docker.com/desktop/install/mac/)
- [Install Docker Compose on Mac](https://docs.docker.com/compose/install/)
- [Install Docker on Linux](https://docs.docker.com/engine/install/)
- [Install Docker Compose on Linux](https://docs.docker.com/compose/install/)

## Running the Project

Follow the steps below to build and run the project using Docker Compose.

### Windows

1. Open a terminal (e.g., Command Prompt, PowerShell, or Windows Terminal).
2. Navigate to the project directory:
   ```cmd
   cd path\to\dva-Project
   ```
3. Run the following command to build and start the containers:
   ```cmd
   docker compose up --build
   ```
4. Access the application in your browser at `http://localhost:8080`.

### Mac

1. Open a terminal.
2. Navigate to the project directory:
   ```bash
   cd /path/to/dva-Project
   ```
3. Run the following command to build and start the containers:
   ```bash
   docker compose up --build
   ```
4. Access the application in your browser at `http://localhost:8080`.

### Linux

1. Open a terminal.
2. Navigate to the project directory:
   ```bash
   cd /path/to/dva-Project
   ```
3. Run the following command to build and start the containers:
   ```bash
   docker compose up --build
   ```
4. Access the application in your browser at `http://localhost:8080`.

## Project Structure

- **`dockerfile`**: Defines the Docker image for the application.
- **`docker-compose.yml`**: Configures the services, ports, and environment variables for the application.
- **`requirements.txt`**: Lists the Python dependencies for the project.
- **Application Code**: The Python application code is located in the project directory.

## Notes

- The application uses live updates by mounting the project directory as a volume in the container. Any changes to the code will reflect immediately without restarting the container.
- If you want to run the container interactively for debugging, uncomment the `tty: true` and `stdin_open: true` lines in the `docker-compose.yml` file.

## Troubleshooting

- If you encounter permission issues on Linux, try running the commands with `sudo`.
- Ensure that port `8080` is not being used by another application on your system.

