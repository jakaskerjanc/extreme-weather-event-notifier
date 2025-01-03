import { CAP_1_2 } from '@dec112/cap-ts'

export type ArsoSevereEvent = {
  datetime: string
  title: string
  severity: number
  description: string
  instruction: string
  region: string
  source: string
}

const sloveniaArsoLinks = {
  southEast: 'https://meteo.arso.gov.si/uploads/probase/www/warning/text/sl/warning_SLOVENIA_SOUTH-EAST_latest_CAP.xml',
  southWest: 'https://meteo.arso.gov.si/uploads/probase/www/warning/text/sl/warning_SLOVENIA_SOUTH-WEST_latest_CAP.xml',
  middle: 'https://meteo.arso.gov.si/uploads/probase/www/warning/text/sl/warning_SLOVENIA_MIDDLE_latest_CAP.xml',
  northEast: 'https://meteo.arso.gov.si/uploads/probase/www/warning/text/sl/warning_SLOVENIA_NORTH-EAST_latest_CAP.xml',
  northWest: 'https://meteo.arso.gov.si/uploads/probase/www/warning/text/sl/warning_SLOVENIA_NORTH-WEST_latest_CAP.xml'
}

async function fetchCAPData(url: string) {
  try {
    const response = await fetch(url)
    const xml = await response.text()
    const cap = await CAP_1_2.Alert.fromXML(xml)
    return cap
  } catch (error) {
    console.error('Error fetching or parsing data:', error)
  }
}

async function fetchAllArsoData() {
  const data = await Promise.all(Object.values(sloveniaArsoLinks).map(fetchCAPData))
  return data
}

async function getSevereEvents(): Promise<ArsoSevereEvent[]> {
  const data = await fetchAllArsoData()
  const alerts = data.filter((alert) => alert !== undefined)
  const severeEvents = alerts.flatMap((a) => a.info_list).filter((i) => i.severity >= 2 && i.language == 'en-GB')
  return severeEvents.map((e) => ({
    datetime: e.effective || '',
    title: e.event || '',
    severity: e.severity,
    headline: e.headline || '',
    description: e.description || '',
    instruction: e.instruction || '',
    region: e.area_list[0].areaDesc || '',
    source: 'ARSO'
  }))
}

export function runArsoScrapper(callback: (events: ArsoSevereEvent[]) => void) {
  const scrapeFunction = async () => {
    const severeEvents = await getSevereEvents()
    if (severeEvents.length > 0) {
      console.log('Severe events found:', severeEvents)
      callback(severeEvents)
    }
  }

  scrapeFunction()

  const minuteDelay = 5

  setInterval(scrapeFunction, minuteDelay * 60 * 1000)
}
