import type { WeatherEvent } from '~/src/types'

export default defineEventHandler(async (_event) => {
  try {
    const result = await GqlWeatherEvents()
    return result.weatherEvents as WeatherEvent[]
  }
  catch (error) {
    console.error(error)
    return []
  }
})
