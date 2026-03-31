import { mockSnapshotCloudFunction } from "../mock/snapshotMock";
import { SnapshotRow } from "./snapshotTypes";

export async function getSnapshotMetric(
  orgId: string,
  metric: string
): Promise<SnapshotRow[]> {
  const rows = await mockSnapshotCloudFunction(orgId, metric);

  console.log("SNAPSHOT RESPONSE:", rows);
  //Replace this with actual API call to your cloud function
  // const response = await fetch("/cloud-function-url")
  // return response.json()

  return rows;
}
