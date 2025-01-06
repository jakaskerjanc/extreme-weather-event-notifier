import express from 'express'
import { createHandler } from 'graphql-http/lib/use/express'
import { buildSchema } from 'graphql'
import amqp from 'amqplib'
import mongoose from 'mongoose'

const mongoDB = 'mongodb://storage-mongodb:27018/weatherEvents'
const rabbitmq = 'amqp://rabbitmq'
let isReady = false

type ArsoSevereEvent = {
  datetime: string
  title: string
  severity: number
  description: string
  instruction: string
  region: string
  source: string
}

mongoose.set('strictQuery', false)
const weatherEventSchema = new mongoose.Schema(
  {
    datetime: { type: Date, required: true },
    title: { type: String, required: true },
    severity: { type: Number, required: true },
    description: { type: String, required: true },
    instruction: { type: String, required: false },
    region: { type: String, required: true },
    source: { type: String, required: true }
  },
  { strict: false }
)
const weatherEvent = mongoose.model('WeatherEvent', weatherEventSchema)

const schema = buildSchema(`
    type WeatherEvent {
        id: String
        datetime: String
        title: String
        severity: Int
        description: String
        instruction: String
        region: String
        source: WeatherEventSource
        type: WeatherEventType
    }

    enum WeatherEventType {
        RAIN
        SNOW
        WIND
        OTHER
    }

    enum WeatherEventSource {
        ARSO
    }

    type Query {
        weatherEvents: [WeatherEvent]
        weatherEvent(id: String!): WeatherEvent
    }
`)

const root = {
  weatherEvents() {
    return weatherEvent.find().sort({ datetime: -1 }).limit(50)
  },
  //@ts-expect-error - any type
  weatherEvent({ id }) {
    return weatherEvent.findOne({ id })
  }
}

const app = express()

app.all(
  '/graphql',
  createHandler({
    schema: schema,
    rootValue: root
  })
)

app.get('/healthz', (_req, res) => {
  if (!isReady) {
    res.status(500).send('Not ready')
  } else {
    res.status(200).send('I am alive!')
  }
})

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

  try {
    const parsedWeatherEvent = JSON.parse(content) as ArsoSevereEvent[]

    try {
      parsedWeatherEvent.forEach(async (event) => {
        const newWeatherEvent = new weatherEvent(event)

        await newWeatherEvent.save()
        console.log('Saved to MongoDB:', newWeatherEvent)
      })
    } catch (error) {
      console.error('Error while saving to MongoDB: ', error)
    }
  } catch (error) {
    console.error('Error while parsing: ', error)
  }
}

async function main() {
  console.log('Connecting to MongoDB...')
  await mongoose.connect(mongoDB)
  console.log('Connected to MongoDB!')

  console.log('Connecting to RabbitMQ...')
  const channel = await openChannel(rabbitmq)
  console.log('Connected to RabbitMQ!')

  app.listen(4000)
  console.log('Running a GraphQL API server at http://localhost:4000/graphql')

  isReady = true

  receiveMessages(channel, 'new_weather_events', onMessage)
}

main().catch((err) => console.log(err))
