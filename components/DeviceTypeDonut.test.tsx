import { render, screen } from "@testing-library/react";
import DeviceTypeDonut from "./DeviceTypeDonut";
import {
  deviceTypeMock,
  deviceTypeEmptyMock,
} from "./lib/mockData/deviceType.mock";


jest.mock("recharts", () => {
  const Original = jest.requireActual("recharts");

  return {
    ...Original,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ResponsiveContainer: ({ children }: any) => (
      <div style={{ width: 400, height: 400 }}>{children}</div>
    ),
  };
});

describe("DeviceTypeDonut", () => {
  it("renders total correctly", () => {
    render(<DeviceTypeDonut data={deviceTypeMock} />);

    expect(screen.getByText("Total Devices")).toBeInTheDocument();
    expect(screen.getByText("390")).toBeInTheDocument();
  });

  it("renders device labels", () => {
    render(<DeviceTypeDonut data={deviceTypeMock} />);

    expect(screen.getByText("Gen4 Pod")).toBeInTheDocument();
    expect(screen.getByText("Gen4 Mini")).toBeInTheDocument();
    expect(screen.getByText("Gen4 Smart")).toBeInTheDocument();
  });

  it("renders device values", () => {
    render(<DeviceTypeDonut data={deviceTypeMock} />);

    expect(screen.getByText("250")).toBeInTheDocument();
    expect(screen.getByText("40")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders empty state correctly", () => {
    render(<DeviceTypeDonut data={deviceTypeEmptyMock} />);

    expect(
      screen.getByText("No device data available")
    ).toBeInTheDocument();
  });
});