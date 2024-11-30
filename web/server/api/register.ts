export default defineEventHandler(async (_event) => {
  try {
    const response = await $fetch('http://notification-service:3000/api/register')

    console.log(response)

    return response
  }
  catch (error) {
    console.error(error)
  }
})
