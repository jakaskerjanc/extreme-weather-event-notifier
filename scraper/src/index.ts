import { runArsoScrapper } from './scraper'
import type { ArsoSevereEvent } from './scraper'
import { openChannel, sendMessage } from './rabbitmq'
import express from 'express'

let isReady = false

async function main() {
  const { connection, channel } = await openChannel()

  runArsoScrapper(async (events: ArsoSevereEvent[]) => {
    await sendMessage(channel, 'new_weather_events', events)
  })

  const app = express()

  app.get('/healthz', (_req, res) => {
    if (!isReady) {
      res.status(500).send('Not ready')
    } else {
      res.status(200).send('I am alive!')
    }
  })

  app.listen(3001)

  process.on('SIGTERM', () => {
    connection.close()
    process.exit(0)
  })

  isReady = true
}

main()
