import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'

// Set `strictQuery: false` to globally opt into filtering by properties that aren't in the schema
// Included because it removes preparatory warnings for Mongoose 7.
// See: https://mongoosejs.com/docs/migrating_to_6.html#strictquery-is-removed-and-replaced-by-strict
mongoose.set('strictQuery', false)

const Schema = mongoose.Schema

const notificationRegisterSchema = new Schema({
  clientId: String,
  isRegistered: Boolean,
  createDate: Date
})

const NotificationRegister = mongoose.model('SomeModel', notificationRegisterSchema)

const mongoDB = 'mongodb://mongo:27017/notification'

const port = 3001
const app = express()

let isReady = false

app.use(bodyParser.json())

app.get('/healthz', (_req, res) => {
  if (!isReady) {
    res.status(500).send('Not ready')
  } else {
    res.status(200).send('I am alive!')
  }
})

app.post('/api/register', async (req, res) => {
  const { clientId, isRegistered } = req.body

  if (typeof clientId !== 'string' || typeof isRegistered !== 'boolean') {
    res.status(400).send('Invalid input')
    return
  }

  const existing = await NotificationRegister.findOne({ clientId })

  if (existing) {
    await NotificationRegister.updateOne({ clientId }, { isRegistered })
    res.status(200).json(`Updated ${clientId} notifications to ${isRegistered}`)
    return
  }

  await NotificationRegister.create({ clientId, isRegistered, createDate: new Date() })
  res.status(200).json(`Created ${clientId} with notifications ${isRegistered}`)
})

app.get('/api/status/:clientId', async (req, res) => {
  const clientId = req.params.clientId

  const result = await NotificationRegister.findOne({ clientId })

  if (!result) {
    res.status(200).json({ clientId, isRegistered: false })
    return
  }

  res.status(200).json({ clientId: result.clientId, isRegistered: result.isRegistered, createDate: result.createDate })
})

app.listen(port, () => {
  console.log(`Server is listening at port ${port}`)
})

main().catch((err) => console.log(err))
async function main() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(mongoDB)
  console.log('Connected to MongoDB!')
  isReady = true
}
