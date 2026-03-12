import { timeseriesMock } from "../mock/timeseriesMock";
import { parseTimeseries } from "./timeseriesParser";
import { setMetric, hasMetric } from "../utils/metricsStore";
import { TimeseriesRow } from "./timeseriesTypes";

export async function fetchTimeseriesMetrics(metrics: string[]) {
  if (!metrics.length) return;

  // Only fetch metrics that are NOT already cached
  const missingMetrics = metrics.filter((metric) => !hasMetric(metric));

  console.log("Metrics requested from manager:", metrics);
  console.log(
    " Missing metrics (API will fetch only these):",
    missingMetrics
  );

  if (!missingMetrics.length) {
    console.log(" All metrics already cached. No API call needed.");
    return;
  }

  // simulate API latency
  await new Promise((resolve) => setTimeout(resolve, 300));

  // In a real implementation, this would be an API call to your backend/cloud function
  //   const rows = await fetch("/cloud-function", {
  //   method: "POST",
  //   body: JSON.stringify({
  //     org_id,
  //     aggregation_level: "Day",
  //     metrics
  //   })
  // })
  const rows: TimeseriesRow[] = timeseriesMock.filter((row) =>
    missingMetrics.includes(row.metric_name)
  );

  console.log(" Rows returned from mock/API:", rows);

  const parsed = parseTimeseries(rows);

  console.log("Parsed metrics data:", parsed);

  // store every requested metric even if empty
missingMetrics.forEach((metric) => {

  const data = parsed[metric]

  // only store if API returned data
  if (data && data.length) {

    console.log("Storing metric in metricsStore:", metric)

    setMetric(metric, data)

  }

})
}
