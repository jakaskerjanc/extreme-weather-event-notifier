import { runArsoScrapper } from './scraper'
import type { ArsoSevereEvent } from './scraper'

import { openChannel, sendMessage } from './rabbitmq'

async function main() {
  const { connection, channel } = await openChannel()

  runArsoScrapper(async (events: ArsoSevereEvent[]) => {
    await sendMessage(channel, 'new_weather_events', events)
  })

  process.on('SIGTERM', () => {
    connection.close()
    process.exit(0)
  })
}

main()
