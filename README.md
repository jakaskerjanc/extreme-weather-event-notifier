# Extreme Weather Event Notifier

This README includes information about the project and how to run it.

### Project Description

This service was built for the Cloud Computing class at the Faculty of Computer and Information Science, University of Ljubljana.

The service is a web application, built on microservice principles, that notifies users about extreme weather events. It allows users to subscribe to notifications about such events in Slovenia. The weather event information is provided by the Slovenian Environment Agency. The service notifies users via push notifications, stores all previous weather events, and allows users to view them.

The website is available at [http://extreme-weather-event-notifier.com](http://extreme-weather-event-notifier.com).

# Technical Information

### Repository Structure

Each service has its own folder in the repository. The services are:
- `web` - Frontend service
- `notification` - Notification service
- `scraper` - Scraper service
- `storage` - Storage service

Continuous Integration and testing configuration files are stored in the `.github` folder.

Common Kubernetes configuration files for ingress and certificates are stored in the root `k8s` folder.

Kubernetes configuration files for each service are stored in the respective service folder.

## CI/CD

The project uses GitHub Actions for CI/CD. The pipeline is defined in the `.github/workflows/ci.yaml` file.

The `main` branch is protected, preventing direct pushes. Developers are required to create a pull request, which triggers tests. The pipeline runs tests and linters. If the tests pass, the pull request can be merged.

The deployment pipeline is triggered upon merging with the `main` branch. It builds the Docker images, pushes them to the DigitalOcean Container Registry, and deploys the images to the Kubernetes cluster.

### Deployment CI

This uses DigitalOcean's `digitalocean/action-doctl` action to install the `doctl` CLI, which allows us to log in and interact with the DigitalOcean platform.

For each service, the pipeline then builds the Docker image, tags it with the current commit SHA, and pushes it to the DigitalOcean Container Registry. It then edits the deployment configuration file to use the new image tag and applies the changes to the Kubernetes cluster. This ensures that the Kubernetes cluster pulls the latest image from the registry.

It then applies the Ingress and Certificate configuration files to the cluster, ensuring that the services are accessible via the domain.

The last step is to verify the deployment status.

The DigitalOcean access token and Firebase credentials, used when building the Notification service image, are stored in the GitHub repository secrets section and are not exposed in the repository or pipeline configuration files.

### Testing

The project has four test suites, one for each service. The tests are run in the CI pipeline. The tests are automatically run when a pull request is created and when the code is merged to the `main` branch. Passing tests are required for merging. When pushing to a development branch, the tests for each service will only run if the respective service has been modified.

## Web Microservice

The web microservice is a frontend service built with Nuxt.js. It allows users to subscribe to extreme weather event notifications in Slovenia. The service notifies users via push notifications and also enables them to view all previous weather events.

The service is available at [http://extreme-weather-event-notifier.com](http://extreme-weather-event-notifier.com).

It uses Firebase Cloud Messaging for push notifications. After a user enables notifications and a Firebase client ID is acquired, it forwards this ID to the notification service via a REST API endpoint. Data about historical weather events is fetched from the storage service via a GraphQL endpoint.

The service is implemented in Nuxt.js, a Vue.js framework, and uses Vuetify for styling. A guide and installation information are provided in the `web/README.md` file.

### Details

The web service has three pages: index, notifications, and events. We utilize Nuxt's layout and page system. A layout called `main.vue` houses the application's banner title and notification dialog popup, then includes a slot where the three pages are inserted. The index page has some basic information about the application and links to other subpages. The events page displays all the historical weather events saved in the system. The notification subpage allows users to register for notifications and displays the FCM client ID for debugging purposes.

There is also an API documentation at `/docs`, built with [Scalar](https://scalar.com/) and the OpenAPI standard.

The backend exposes three endpoints, fetched from the frontend side. The endpoints just proxy to other microservices, as they are not accessible from outside the Kubernetes network:
- `/api/weatherEvents`: uses GraphQL to fetch weather events from the Storage microservice at `http://storage:4000/graphql`. The GraphQL schema is stored in `src/queries/weatherEvents.gql`.
- `/api/register`: sends a POST request to `http://notification:3001/api/register` with the client ID and a boolean value indicating whether the user is enabling or disabling notifications.
- `/api/status/[clientId]`: forwards a request to `http://notification:3001/api/status/${clientId}`, using the path parameter `clientId` to determine if the client has enabled notifications.
- `/healthz`: endpoint for Kubernetes health checks.

We use Firebase Cloud Messaging to handle push notifications. We register a service worker `firebase-messaging-sw.js` to receive notifications in the background. After registering the service worker, the user is prompted to enable notifications, and Firebase returns a unique client ID used to send notifications to this specific client. Code for handling FCM authentication is stored in `/src/firebase.ts`.

## Notification Microservice

The notification service stores the Firebase client IDs of users who enable notifications. It sends push notifications to users when a new weather event is detected. It obtains information about new weather events from the scraper service via RabbitMQ.

The service uses MongoDB as a database, RabbitMQ for communication with the scraper service, Firebase Cloud Messaging for sending push notifications, and Express.js for the REST API. A guide and installation information are provided in the `notification/README.md` file.

### Details

We use the `mongoose` library to interface with MongoDB. It is a schema-based solution to model application data easily.

This service exposes four endpoints:
- `/api/weatherEvents`, `/api/register`, `/healthz`, and `/test/triggerNotifications`. The first three are explained in the Web Microservice details. The `triggerNotifications` endpoint is used to send a test notification to all clients who have notifications enabled, for testing and demonstration purposes.

To receive new weather events, the service connects to the Scraper's RabbitMQ server at `amqp://rabbitmq`. It listens for new messages on the `new_weather_events` queue. Upon receiving a message, it uses `getMessaging().send(message)` from the `firebase-admin` library to send notifications. The `message` must include the client ID.

Firebase requires authentication with private keys. These are stored as environment variables (e.g., `FIREBASE_PRIVATE_KEY_ID`). For development, they are stored in a `.env.local` file, which is loaded with the `dotenv` library. When building for production, we use a Docker build step: Here, the private key is provided by GitHub Actions and stored in its secrets.

## Scraper Microservice

The scraper service fetches information about extreme weather events from the Slovenian Environment Agency website. It processes the Common Alerting Protocol (CAP) messages and sends the information to the notification and storage services via RabbitMQ.

The service uses RabbitMQ for communication with the notification and storage services and is implemented in Node.js. A guide and installation information are provided in the `scraper/README.md` file.

### Details

This service exposes a RabbitMQ server at `amqp://rabbitmq` and opens a new queue, `new_weather_events`, where it emits messages about new weather events.

To get information about the weather, we fetch five ARSO endpoints, each for a different region in Slovenia. Data is provided in the Common Alert Protocol XML standard, and we use the `@dec112/cap-ts` library to parse the data into TypeScript objects. The data is fetched every five minutes.

## Storage Microservice

The storage service stores information about extreme weather events. It provides a GraphQL API for fetching the data.

The service is implemented in Node.js and uses MongoDB as a database. A guide and installation information are provided in the `storage/README.md` file.

### Details

The service opens a RabbitMQ queue, `new_weather_events`, and listens for new events. It then stores them in MongoDB using the `mongoose` library. To retrieve weather event data, a GraphQL server is exposed at `/graphql`.