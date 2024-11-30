# Extreme weather event notifier
Documentation plan for microservices.
## API Microservice
This includes two endpoints:
 - GET `/` - return a static website.
 - POST `/notificationSubscribe` - subscribes users to revieve notifications.
 - GET `/events` - fetches past events based on specified parameters.
### Static website
This microservice will also provide a static website on `\` or `\index.html` endpoint. This will be a progressive web application (PWA) that will includes two subpages.
**Notifications**
Frontend will call the `notificationSubscribe` endpoint and provide user's location and Firebase client ID. Website is build as PWA to provide push notification functionality. Notifications will then be pushed to user's device via Firebase Cloud Messaging (FCM).
**View history**
Calls the `events` endpoint. Set parameters to specify what events the user wants. Displays the returned events in a nice UI.

Website lives in the folder `web`. Build with VueJS.

The API itself lives in folder `api`. Build with Node and ExpressJS.

## Weather event fetch