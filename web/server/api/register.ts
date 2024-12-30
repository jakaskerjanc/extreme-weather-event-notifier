export default defineEventHandler(async (event) => {
  const incomingBody = await readBody(event)
  const clientId = incomingBody?.clientId
  const isRegistered = incomingBody?.isRegistered

  const requestBody = JSON.stringify({ clientId, isRegistered })

  console.log(requestBody)

  try {
    const response = await $fetch('http://notification:3001/api/register', {
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
