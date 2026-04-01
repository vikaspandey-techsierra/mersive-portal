import { SnapshotRow, ChartData } from "./snapshotTypes";

export function parseSnapshot(rows: SnapshotRow[]): ChartData[] {

  return rows.map((row) => ({
    name: row.segment_1_value ?? "",
    value: Number(row.metric_value)
  }));

}