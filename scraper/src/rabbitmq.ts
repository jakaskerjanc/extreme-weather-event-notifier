import amqp from 'amqplib'

const openChannel = async () => {
  try {
    console.log('Connecting to RabbitMQ server...')
    const connection = await amqp.connect('amqp://rabbitmq')
    const channel = await connection.createChannel()
    console.log('Channel opened')
    return { connection, channel }
  } catch (error) {
    console.error('Error opening channel:', error)
    throw error
  }
}

const sendMessage = async (channel: amqp.Channel, queue: string, message: object) => {
  try {
    // Ensure the queue exists
    await channel.assertQueue(queue, {
      durable: true // Make queue persistent
    })

    const messageBuffer = Buffer.from(JSON.stringify(message))

    // Send the message to the queue
    channel.sendToQueue(queue, messageBuffer, {
      persistent: true // Make message persistent
    })

    console.log(`Sent: ${JSON.stringify(message)}`)
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

export { openChannel, sendMessage }
