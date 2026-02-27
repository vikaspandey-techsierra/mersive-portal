import { DeviceTypeApiResponse } from "@/components/DeviceTypeDonut";

export const deviceTypeMock: DeviceTypeApiResponse = {
  asOf: "2025-12-23T15:40:00Z",
  totalDevices: 390,
  deviceTypes: [
    { name: "Gen4 Pod", value: 250 },
    { name: "Gen4 Mini", value: 40 },
    { name: "Gen4 Smart", value: 100 },
  ],
};

export const deviceTypeEmptyMock: DeviceTypeApiResponse = {
  asOf: "2025-12-23T15:40:00Z",
  totalDevices: 0,
  deviceTypes: [],
};