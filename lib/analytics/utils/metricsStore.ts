// eslint-disable-next-line @typescript-eslint/no-explicit-any
const metricsStore: Record<string, any[]> = {}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setMetric(metric: string, data: any[]) {

  console.log("Cache SET:", metric)

  metricsStore[metric] = data
}

export function getMetric(metric: string) {

  const data = metricsStore[metric]

  if (data) {
    console.log("Cache HIT:", metric)
  } else {
    console.log("Cache MISS:", metric)
  }

  return data
}

export function hasMetric(metric: string) {
  return metric in metricsStore
}

export function getAllMetrics() {
  return metricsStore
}

export function clearMetrics() {
  Object.keys(metricsStore).forEach((key) => delete metricsStore[key])
}