export default defineEventHandler(async (event) => {
  const clientId = event.context.params?.clientId

  if (!clientId) {
    return {
      status: 400,
      body: {
        error: 'clientId is required',
      },
    }
  }

  try {
    const response = await $fetch(`http://localhost:3001/api/status/${clientId}`, {
      method: 'GET',
    })

    console.log(response)
    return response
  }
  catch (error) {
    console.error(error)
  }
})
