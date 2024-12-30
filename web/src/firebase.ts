import type { FirebaseApp } from 'firebase/app'
import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

let firebaseApp: FirebaseApp

export function initFirebase() {
  // This is not a secret https://firebase.google.com/docs/web/learn-more#config-object
  firebaseApp = initializeApp({
    apiKey: 'AIzaSyAYeICPEx7jF0zYFYTTpBMCAx3htwsOlag',
    authDomain: 'extreme-weather-event-notifier.firebaseapp.com',
    projectId: 'extreme-weather-event-notifier',
    storageBucket: 'extreme-weather-event-notifier.firebasestorage.app',
    messagingSenderId: '1042282896762',
    appId: '1:1042282896762:web:f82beb9a0e17132bcf4ac3',
  })
}

export async function initMessagingAndRequestNotificationPermission() {
  const serviceWorkerRegistration = await navigator.serviceWorker.register(`firebase-messaging-sw.js`)

  const messaging = getMessaging(firebaseApp)
  try {
    // Vapid is a public key, it's not a secret
    const token = await getToken(messaging, { vapidKey: 'BB7KnU6hhvhCtdWkG5MStRdgq3qztg3K6OBQIWkyh5lvS3rEzz0M--nmn8QLQizCLIWBuh-N5pGlEpod0bl8TMw', serviceWorkerRegistration })
    console.log(token)

    onMessage(messaging, (payload) => {
      console.log('Message received: ', payload)
    })
    return token
  }
  catch (e) {
    console.error(e)
    return null
  }
}
