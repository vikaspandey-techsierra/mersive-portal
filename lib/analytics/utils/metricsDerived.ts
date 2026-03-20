export const METRIC_FORMULAS: Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (metrics: Record<string, any[]>) => any[]
> = {

//Avg meeting duration in hours
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

  //Avg connections per meeting
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

  //Avg posts per meeting
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
};
