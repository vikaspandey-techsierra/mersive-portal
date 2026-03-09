import { getSnapshotMetric } from "./snapshot/snapshotManager";
import { parseSnapshot } from "./snapshot/snapshotParser";
// import { getTimeSeriesMetric } from "./snapshot/snapshotManager";
// import { parseTimeSeries } from "./snapshot/snapshotParser";
import { setMetricData } from "./metricsStore";

const registeredMetrics = new Set<string>();

export function registerMetric(metric: string) {
  registeredMetrics.add(metric);
}

export async function loadRegisteredMetrics() {

  const metrics = Array.from(registeredMetrics);

  for (const metric of metrics) {

    const rows = await getSnapshotMetric(metric);
    //     const rows = await (metric);


    const parsed = parseSnapshot(rows);
     //   const parsed = parseTimeSeries(rows);


    setMetricData(metric, parsed);

  }
}