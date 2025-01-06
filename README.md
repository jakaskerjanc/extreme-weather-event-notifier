# Extreme Weather Event Notifier

This README includes information about the project and how to run it.

### Project Description

This service was built for the Cloud Computing class at the Faculty of Computer and Information Science, University of Ljubljana.

The service is a web application, built on microservice principles, that notifies users about extreme weather events. It allows users to subscribe to notifications about such events in Slovenia. The weather event information is provided by the Slovenian Environment Agency. The service notifies users via push notifications, stores all previous weather events, and allows users to view them.

The website is available at [http://extreme-weather-event-notifier.com](http://extreme-weather-event-notifier.com).

# Technical Information

### Repository Structure

Each service has its respective folder in the repository. The services are:
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

This uses DigitalOcean's `digitalocean/action-doctl` action to install `doctl` CLI that allows us to login and interact with the DigitalOcean platform.

For each service, the pipeline then build the Docker image, tags it with the current commit SHA, and pushes it to the DigitalOcean Container Registry. It then edits the deployment configuration file to use the new image tag and applies the changes to the Kubernetes cluster. This ensures that the Kubernetes pull the latest image from the registry.

It then applies the Ingress and Certificate configuration files to the cluster, ensuring that the services are accessible via the domain.

Last step is to verify the deployment status.

DigitalOcean access token and Firebase credentials, used when building Notification service image, are stored in the GitHub repository secrets section and not exposed in the repository or pipeline configuration files.

### Testing

The project has four test suites, one for each service. The tests are run in the CI pipeline. The tests are automaticaly run when a pull request is created and when the code is merged to the `main` branch. Passing tests are required for merging.
When pushing to a development branch, the tests for each service will only run if the respective service has been modified.


## Web Microservice

The web microservice is a frontend service built with Nuxt.js. It allows users to subscribe to extreme weather event notifications in Slovenia. The service notifies users via push notifications and also enables them to view all previous weather events.

The service is available at [http://extreme-weather-event-notifier.com](http://extreme-weather-event-notifier.com).

It uses Firebase Cloud Messaging for push notifications. After a user enables notifications and a Firebase client ID is acquired, it forwards this ID to the notification service via a REST API endpoint. Data about historical weather events is fetched from the storage service via a GraphQL endpoint.

The service is implemented in Nuxt.js, a Vue.js framework, and uses Vuetify for styling. A guide and installation information are provided in the `web/README.md` file.

### Details

The web service has three pages: index, notifications, and events. We utulize Nuxt's layout and page system. Layout called `main.vue` houses the application's banner title and notification dialog popup. It then has a slot where other three pages are inserted. The index page has some basic information about the application and links to other subpages. Events page displays all the historical weather events saved in the system. Notification subpage allows users to register to recieve notifications. It also displays FCM client id for debugging purposes. 

There is also an API Documentation at `/docs` build with [Scalar](https://scalar.com/) and OpenAPI standard.

The backend exposed three endpoints, fetched from the frontend side. The endpoints just proxy to other microservices as they are not accesible from the outside of Kubernetes network.
- `/api/weatherEvents`: uses GraphQL to fetch weather events from Storage microservice at `http://storage:4000/graphql` endpoint. GraphQL scheme is stored in `src/queries/weatherEvents.gql`.
- `/api/register`: sends a POST request to `http://notification:3001/api/register` with client id and boolean value whether user is enabling or disabling notifications.
- `/api/status/[cliendId]`: forwards a request to `http://notification:3001/api/status/${clientId}`. It uses a path parameter `cliendId` to get the information if client has enabled notifications.
- `/healthz`: endpoint for Kubernetes' healthchecking.

We are using Firebase Cloud Messaging to handle push notifications. We have to register a service worker `firebase-messaging-sw.js` to recieve notification in the background. After registering a service worker, users is prompted to enable notifications. Firebase will then return an unique client id that is used to send notification to this specific client. Code for handling FCM authentication is stored in `/src/firebase.ts`.

## Notification Microservice

The notification service stores the Firebase client IDs of users who enable notifications. It sends push notifications to users when a new weather event is detected. It obtains information about new weather events from the scraper service via the RabbitMQ protocol.

The service uses MongoDB as a database, RabbitMQ for communication with the scraper service, Firebase Cloud Messaging for sending push notifications, and Express.js for the REST API. A guide and installation information are provided in the `notification/README.md` file.

### Details

we are using `mongoose` library to interface with MongoDB. It's a schema-based solution to model application data easily. 

This service exposed 4 endpoints:
- `/api/weatherEvents`, `/api/register`, `/healthz` and `/test/triggerNotifications`. The first three are already explained in the Web Microservice details. `triggerNotifications` is used to send a test notification to all clients that have them enabled. This is used for testing and demonstrational purposes.

To recieve new weather events, the service connects to Scraper's service RabbitMQ server at: `amqp://rabbitmq`. It listents for new messages at `new_weather_events` queue. Upon recieving a message it uses `getMessaging().send(message)` from `firebase-admin` library to send notifications. `message` has to include client id. 

Firebase requres to authenticate with a private keys. They are stored as enviroment variables `private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID`. For development they are stored in `.env.local` file, which get loaded with `dotenv` library. When building for production we use a Docker build step `RUN --mount=type=secret,id=FIREBASE_PRIVATE_KEY_ID` where the private key is provided by GitHub action and its secrets store.

## Scraper Microservice

The scraper service fetches information about extreme weather events from the Slovenian Environment Agency website. It processes the Common Alerting Protocol (CAP) messages and sends the information to the notification and storage services via the RabbitMQ protocol.

The service uses RabbitMQ for communication with the notification and storage services and is implemented in Node.js. A guide and installation information are provided in the `scraper/README.md` file.

### Details

This exposes a RabbitMQ server at `amqp://rabbitmq` and opens a new queue `new_weather_events` where it then emits messages about new events.

To get information about weather we are fetching 5 ARSO endpoints, each for different region in Slovenia. Data is provided in Common Alert Protocol XML standard and we use `@dec112/cap-ts` library to parse the data into Typescript objects. The data is fetched every 5 minutes.

## Storage Microservice

The storage service stores information about extreme weather events. It provides a GraphQL API for fetching the data.

The service is implemented in Node.js and uses MongoDB as a database. A guide and installation information are provided in the `storage/README.md` file.

### Details

The service opens a RabbitMQ queue `new_weather_events` and listents for new events. It then stores it to MongoDB using `mongoose` library.
To retrieve weather events data, a GraphQL server is exposed at `/graphql`.