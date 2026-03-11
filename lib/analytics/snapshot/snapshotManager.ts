import { mockSnapshotCloudFunction } from "../mock/snapshotMock";
import { SnapshotRow } from "./snapshotTypes";

export async function getSnapshotMetric(
  metric: string
): Promise<SnapshotRow[]> {

  //Replace this with actual API call to your cloud function
  // const response = await fetch("/cloud-function-url")
  // return response.json()  
  const rows = await mockSnapshotCloudFunction(metric);

  return rows;
}