import { fetchTimeseriesMetrics } from "../timeseries/timeseriesManager"

const registeredMetrics = new Set<string>()

let fetchScheduled = false

export function registerMetric(metric: string) {
  registeredMetrics.add(metric)

  console.log("Registered Metrics:", Array.from(registeredMetrics));

  scheduleFetch()
}

function scheduleFetch() {
  if (fetchScheduled) return
  fetchScheduled = true
  setTimeout(async () => {

    const metricsToFetch = Array.from(registeredMetrics)

    if (metricsToFetch.length > 0) {
      await fetchTimeseriesMetrics(metricsToFetch)
    }
    fetchScheduled = false
  }, 50)
}

export function getRegisteredMetrics() {
  return Array.from(registeredMetrics)
}

export function clearRegisteredMetrics() {
  registeredMetrics.clear()
}