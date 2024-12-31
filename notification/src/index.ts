import express from 'express'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import amqp from 'amqplib'

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

const NotificationRegister = mongoose.model('NotificationRegister', notificationRegisterSchema)

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

  console.log('Connecting to RabbitMQ...')
  const channel = await openChannel('amqp://rabbitmq')
  console.log('Connected to RabbitMQ!')

  isReady = true

  receiveMessages(channel, 'new_weather_events', onMessage)
}

const openChannel = async (url: string): Promise<amqp.Channel> => {
  try {
    const connection = await amqp.connect(url)
    const channel = await connection.createChannel()
    return channel
  } catch (error) {
    console.error('Error opening channel:', error)
    throw error
  }
}

const receiveMessages = async (
  channel: amqp.Channel,
  queue: string,
  onMessage: (msg: amqp.ConsumeMessage | null) => void
) => {
  try {
    // Ensure the queue exists
    await channel.assertQueue(queue, {
      durable: true // Make queue persistent
    })

    // Consume messages from the queue
    channel.consume(
      queue,
      (msg) => {
        if (msg !== null) {
          onMessage(msg)
          channel.ack(msg) // Acknowledge the message
        }
      },
      {
        noAck: false // Ensure messages are acknowledged
      }
    )

    console.log(`Waiting for messages in queue: ${queue}`)
  } catch (error) {
    console.error('Error receiving messages:', error)
    throw error
  }
}

function onMessage(msg: amqp.ConsumeMessage | null) {
  if (msg === null) {
    console.error('Received null message')
    return
  }

  const content = msg.content.toString()
  console.log(`${new Date()} - Received message: ${content}`)
}
