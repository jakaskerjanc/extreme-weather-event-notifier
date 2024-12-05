export default defineEventHandler(async (_event) => {
  const clientId = 'test-client-id'
  try {
    const response = await $fetch('http://notification:3001/api/register', {
      method: 'POST',
      body: JSON.stringify({ clientId }),
    })

    console.log(response)
    return response
  }
  catch (error) {
    console.error(error)
  }
})
