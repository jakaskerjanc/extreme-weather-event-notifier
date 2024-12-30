/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js')

// This is not a secret https://firebase.google.com/docs/web/learn-more#config-object
firebase.initializeApp({
    apiKey: "AIzaSyAYeICPEx7jF0zYFYTTpBMCAx3htwsOlag",
    authDomain: "extreme-weather-event-notifier.firebaseapp.com",
    projectId: "extreme-weather-event-notifier",
    storageBucket: "extreme-weather-event-notifier.firebasestorage.app",
    messagingSenderId: "1042282896762",
    appId: "1:1042282896762:web:f82beb9a0e17132bcf4ac3"
})

const messaging = firebase.messaging()
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload)

    const notificationTitle = payload?.notification?.title
    const notificationOptions = {
        body: payload?.notification?.body
    }
    self.registration.showNotification(notificationTitle, notificationOptions)
})