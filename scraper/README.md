## Scraper microservice Installation and Running Guide

### Prerequisites

- Ensure you have Docker and Docker Compose installed on your machine.

### Development

For development purposes, you can use the development Docker setup:

1. Build and start the development Docker containers:

   ```sh
   docker-compose -f docker-compose-dev.yaml up --build
   ```

2. The service should now be running with hot-reload enabled at `http://localhost:4000/graphql`.

### Running the Microservice

1. Build and start the Docker containers:

   ```sh
   docker-compose up --build
   ```

2. The service should now be running and accessible at `http://localhost:4000/graphql`.
