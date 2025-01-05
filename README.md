# Extreme Weather Event Notifier

This README includes information about the project and how to run it.

## Project Description

This service was built for the Cloud Computing class at the Faculty of Computer and Information Science, University of Ljubljana.

The service is a web application, built on microservice principles, that notifies users about extreme weather events. It allows users to subscribe to notifications about such events in Slovenia. The weather event information is provided by the Slovenian Environment Agency. The service notifies users via push notifications, stores all previous weather events, and allows users to view them.

The website is available at [http://extreme-weather-event-notifier.com](http://extreme-weather-event-notifier.com).

## Technical Information

### Repository Structure

Each service has its respective folder in the repository. The services are:
- `web` - Frontend service
- `notification` - Notification service
- `scraper` - Scraper service
- `storage` - Storage service

Continuous Integration and testing configuration files are stored in the `.github` folder.

Common Kubernetes configuration files for ingress and certificates are stored in the root `k8s` folder.

Kubernetes configuration files for each service are stored in the respective service folder.

### CI/CD

The project uses GitHub Actions for CI/CD. The pipeline is defined in the `.github/workflows/ci.yaml` file.

The `main` branch is protected, preventing direct pushes. Developers are required to create a pull request, which triggers tests. The pipeline runs tests and linters. If the tests pass, the pull request can be merged.

The deployment pipeline is triggered upon merging with the `main` branch. It builds the Docker images, pushes them to the DigitalOcean Container Registry, and deploys the images to the Kubernetes cluster.

## Web Microservice

The web microservice is a frontend service built with Nuxt.js. It allows users to subscribe to extreme weather event notifications in Slovenia. The service notifies users via push notifications and also enables them to view all previous weather events.

The service is available at [http://extreme-weather-event-notifier.com](http://extreme-weather-event-notifier.com).

It uses Firebase Cloud Messaging for push notifications. After a user enables notifications and a Firebase client ID is acquired, it forwards this ID to the notification service via a REST API endpoint. Data about historical weather events is fetched from the storage service via a GraphQL endpoint.

The service is implemented in Nuxt.js, a Vue.js framework, and uses Vuetify for styling. A guide and installation information are provided in the `web/README.md` file.

## Notification Microservice

The notification service stores the Firebase client IDs of users who enable notifications. It sends push notifications to users when a new weather event is detected. It obtains information about new weather events from the scraper service via the RabbitMQ protocol.

The service uses MongoDB as a database, RabbitMQ for communication with the scraper service, Firebase Cloud Messaging for sending push notifications, and Express.js for the REST API. A guide and installation information are provided in the `notification/README.md` file.

## Scraper Microservice

The scraper service fetches information about extreme weather events from the Slovenian Environment Agency website. It processes the Common Alerting Protocol (CAP) messages and sends the information to the notification and storage services via the RabbitMQ protocol.

The service uses RabbitMQ for communication with the notification and storage services and is implemented in Node.js. A guide and installation information are provided in the `scraper/README.md` file.

## Storage Microservice

The storage service stores information about extreme weather events. It provides a GraphQL API for fetching the data.

The service is implemented in Node.js and uses MongoDB as a database. A guide and installation information are provided in the `storage/README.md` file.
