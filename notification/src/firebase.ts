import { initializeApp, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'
import * as dotenv from 'dotenv'

dotenv.config()

const serviceAccount = {
  type: 'service_account',
  project_id: 'extreme-weather-event-notifier',
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: 'googleapis.com'
}

function initFirebase() {
  console.log(serviceAccount)

  initializeApp({
    // @ts-expect-error - The types are incorrect
    credential: cert(serviceAccount)
  })
}

function sendNotification(notification: { title: string; body: string }, token: string) {
  const message = {
    notification,
    token
  }

  getMessaging()
    .send(message)
    .then((response) => {
      // Response is a message ID string.
      console.log('Successfully sent message:', response)
    })
    .catch((error) => {
      console.log('Error sending message:', error)
    })
}

export { initFirebase, sendNotification }
