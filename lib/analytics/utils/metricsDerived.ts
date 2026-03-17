// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const METRIC_FORMULAS: Record<
  string,
  (metrics: Record<string, any[]>) => any[]
> = {
  ts_meetings_duration_avg: (metrics) => {
    const meetings = metrics["ts_meetings_num"];
    const hours = metrics["ts_meetings_duration_tot"];
    if (!meetings || !hours) return [];
    return meetings.map((m, i) => {
      const meetingCount = m.value ?? 0;
      const totalHours = hours[i]?.value ?? 0;
      return {
        date: m.date,
        value: meetingCount ? totalHours / meetingCount : 0,
      };
    });
  },

  ts_meetings_connection_avg: (metrics) => {
    const meetings = metrics["ts_meetings_num"];
    const connections = metrics["ts_connections_num"];
    if (!meetings || !connections) return [];
    return meetings.map((m, i) => ({
      date: m.date,
      value: m.value ? (connections[i]?.value ?? 0) / m.value : 0,
    }));
  },

  ts_meetings_post_avg: (metrics) => {
    const meetings = metrics["ts_meetings_num"];
    const posts = metrics["ts_posts_num"];
    if (!meetings || !posts) return [];
    return meetings.map((m, i) => ({
      date: m.date,
      value: m.value ? (posts[i]?.value ?? 0) / m.value : 0,
    }));
  },

  ts_downtime_devices_num_tot: (metrics) => {
    const rows = metrics["ts_downtime_devices_num"];
    if (!rows || !rows.length) return [];
    const grouped: Record<string, number> = {};
    rows.forEach((r: { date: string; value: number }) => {
      grouped[r.date] = (grouped[r.date] ?? 0) + r.value;
    });
    return Object.entries(grouped).map(([date, value]) => ({ date, value }));
  },
};
