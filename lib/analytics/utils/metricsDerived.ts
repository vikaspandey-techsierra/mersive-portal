export const METRIC_FORMULAS: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (metrics: Record<string, any[]>) => any[]
> = {
  // Avg meeting duration in hours
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

  // Avg connections per meeting
  ts_meetings_connection_avg: (metrics) => {
    const meetings = metrics["ts_meetings_num"];
    const connections = metrics["ts_connections_num"];

    if (!meetings || !connections) return [];

    return meetings.map((m, i) => {
      const meetingCount = m.value ?? 0;
      const totalConnections = connections[i]?.value ?? 0;

      return {
        date: m.date,
        value: meetingCount ? totalConnections / meetingCount : 0,
      };
    });
  },

  // Avg posts per meeting
  ts_meetings_post_avg: (metrics) => {
    const meetings = metrics["ts_meetings_num"];
    const posts = metrics["ts_posts_num"];

    if (!meetings || !posts) return [];

    return meetings.map((m, i) => {
      const meetingCount = m.value ?? 0;
      const totalPosts = posts[i]?.value ?? 0;

      return {
        date: m.date,
        value: meetingCount ? totalPosts / meetingCount : 0,
      };
    });
  },

  // Downtime devices (derived)
  ts_downtime_devices_num_tot: (metrics) => {
    const duration = metrics["ts_downtime_duration_tot"];
    if (!duration) return [];

    const devicesPerDay: Record<string, Set<string>> = {};

    duration.forEach((row) => {
      const date = row.date;
      const device = row.device_name;

      if (!devicesPerDay[date]) {
        devicesPerDay[date] = new Set();
      }

      if (device) {
        devicesPerDay[date].add(device);
      }
    });

    return Object.keys(devicesPerDay).map((date) => ({
      date,
      value: devicesPerDay[date].size,
    }));
  },
};
