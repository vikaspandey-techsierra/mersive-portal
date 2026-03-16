// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const METRIC_FORMULAS: Record<string, (metrics: Record<string, any[]>) => any[]> = {

  ts_meetings_duration_avg: (metrics) => {

    const meetings = metrics["ts_meetings_num"]
    const hours = metrics["ts_meetings_duration_tot"]

    if (!meetings || !hours) return []

    return meetings.map((m, i) => {

      const meetingCount = m.value ?? 0
      const totalHours = hours[i]?.value ?? 0

      return {
        date: m.date,
        value: meetingCount ? totalHours / meetingCount : 0
      }

    })
  }

}