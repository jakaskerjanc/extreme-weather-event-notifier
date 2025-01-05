import openapi from './openapi.json'

export default defineEventHandler(async (_event) => {
  return openapi
})
