// Raw API rows
// grouped by metric
// grouped by date
// convert metric_value to number

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseTimeseries(data: any[]) {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Record<string, any[]> = {}
  data.forEach((row) => {
    const metric = row.metric_name

    if (!result[metric]) {
      result[metric] = []
    }

    result[metric].push({
      date: row.date,
      value: Number(row.metric_value),
      segment: row.segment_1_value,
      device: row.device_name
    })
  })
  return result
}