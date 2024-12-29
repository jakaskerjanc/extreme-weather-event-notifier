export default defineEventHandler(async (event) => {
  const incomingBody = await readBody(event)
  const clientId = incomingBody?.clientId

  const requestBody = JSON.stringify({ clientId, isRegistered: true })

  console.log(requestBody)

  try {
    const response = await $fetch('http://localhost:3001/api/register', {
      method: 'POST',
      body: requestBody,
    })

    console.log(response)
    return response
  }
  catch (error) {
    console.error(error)
  }
})
