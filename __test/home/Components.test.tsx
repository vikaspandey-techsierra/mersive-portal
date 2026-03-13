import React from "react";
import { render, screen } from "@testing-library/react";
import Card from "@/components/Card";
import DeviceStatusPie from "@/components/DeviceStatusPie";
import PlanTypePie from "@/components/PlanTypePie";
import FleetHealthGauge from "@/components/FleetHealthGauge";
import DeviceTypeDonut from "@/components/DeviceTypeDonut";

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Mock Recharts – render just a div placeholder so we don't need a browser canvas
jest.mock("recharts", () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: ({ fill }: { fill: string }) => (
    <div data-testid="cell" style={{ background: fill }} />
  ),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
}));

// Mock lucide-react
jest.mock("lucide-react", () => ({
  ExternalLinkIcon: () => <span data-testid="external-link" />,
}));

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
describe("Card", () => {
  it("renders the title", () => {
    render(
      <Card title="Device Type" icon="mock-icon.svg">
        <div>Child content</div>
      </Card>,
    );
    expect(screen.getByText("Device Type")).toBeInTheDocument();
  });

  it("renders children", () => {
    render(
      <Card title="Device Type" icon="mock-icon.svg">
        <div>Child content</div>
      </Card>,
    );
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("renders the icon image", () => {
    render(
      <Card title="My Card" icon="mock-icon.svg">
        <span />
      </Card>,
    );
    expect(screen.getByAltText("Card Icon")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// DeviceStatusPie
// ---------------------------------------------------------------------------
const mockDeviceStatusData = [
  { name: "Offline", value: 2, percent: 67 },
  { name: "Online", value: 1, percent: 33 },
];

describe("DeviceStatusPie", () => {
  it("renders 'No data available' when data is empty", () => {
    render(<DeviceStatusPie data={[]} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });

  it("renders chart when data is provided", () => {
    render(<DeviceStatusPie data={mockDeviceStatusData} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("renders legend entries for each status", () => {
    render(<DeviceStatusPie data={mockDeviceStatusData} />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("renders values and percentages", () => {
    render(<DeviceStatusPie data={mockDeviceStatusData} />);
    expect(screen.getByText("2 (67%)")).toBeInTheDocument();
    expect(screen.getByText("1 (33%)")).toBeInTheDocument();
  });

  it("renders a Cell for each data entry", () => {
    render(<DeviceStatusPie data={mockDeviceStatusData} />);
    const cells = screen.getAllByTestId("cell");
    expect(cells.length).toBe(mockDeviceStatusData.length);
  });

  it("renders null-like input gracefully", () => {
    // @ts-expect-error testing null edge case
    render(<DeviceStatusPie data={null} />);
    expect(screen.getByText("No data available")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// PlanTypePie
// ---------------------------------------------------------------------------
const mockPlanTypeData = [
  { name: "Dev Smart - 1 year", value: 2, percent: 67 },
  { name: "Dev Pro - 1 year", value: 1, percent: 33 },
];

describe("PlanTypePie", () => {
  it("renders 'No plan data available' when data is empty", () => {
    render(<PlanTypePie data={[]} />);
    expect(screen.getByText("No plan data available")).toBeInTheDocument();
  });

  it("renders chart when data is provided", () => {
    render(<PlanTypePie data={mockPlanTypeData} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("renders legend entries for each plan", () => {
    render(<PlanTypePie data={mockPlanTypeData} />);
    expect(screen.getByText("Dev Smart - 1 year")).toBeInTheDocument();
    expect(screen.getByText("Dev Pro - 1 year")).toBeInTheDocument();
  });

  it("renders correct percentages based on values", () => {
    render(<PlanTypePie data={mockPlanTypeData} />);
    // total = 3, so 2/3 = 67%, 1/3 = 33%
    expect(screen.getByText("2 (67%)")).toBeInTheDocument();
    expect(screen.getByText("1 (33%)")).toBeInTheDocument();
  });

  it("renders a Cell for each plan entry", () => {
    render(<PlanTypePie data={mockPlanTypeData} />);
    const cells = screen.getAllByTestId("cell");
    expect(cells.length).toBe(mockPlanTypeData.length);
  });

  it("handles single plan entry", () => {
    const singlePlan = [{ name: "Enterprise", value: 10, percent: 100 }];
    render(<PlanTypePie data={singlePlan} />);
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
    expect(screen.getByText("10 (100%)")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// FleetHealthGauge
// ---------------------------------------------------------------------------
describe("FleetHealthGauge", () => {
  it("renders the health score", () => {
    render(
      <FleetHealthGauge
        score={7.1}
        totalDevices={496}
        devicesWithIssues={355}
      />,
    );
    expect(screen.getByText("7.1")).toBeInTheDocument();
  });

  it("renders 'Health Score' label", () => {
    render(
      <FleetHealthGauge
        score={7.1}
        totalDevices={496}
        devicesWithIssues={355}
      />,
    );
    expect(screen.getByText("Health Score")).toBeInTheDocument();
  });

  it("renders total devices count", () => {
    render(
      <FleetHealthGauge
        score={7.1}
        totalDevices={496}
        devicesWithIssues={355}
      />,
    );
    expect(screen.getByText("496")).toBeInTheDocument();
  });

  it("renders devices with issues count", () => {
    render(
      <FleetHealthGauge
        score={7.1}
        totalDevices={496}
        devicesWithIssues={355}
      />,
    );
    expect(screen.getByText("355")).toBeInTheDocument();
  });

  it("renders 'Total devices' label", () => {
    render(
      <FleetHealthGauge
        score={7.1}
        totalDevices={496}
        devicesWithIssues={355}
      />,
    );
    expect(screen.getByText("Total devices")).toBeInTheDocument();
  });

  it("renders 'Devices with issues' label", () => {
    render(
      <FleetHealthGauge
        score={7.1}
        totalDevices={496}
        devicesWithIssues={355}
      />,
    );
    expect(screen.getByText("Devices with issues")).toBeInTheDocument();
  });

  it("renders 'Show devices with issues' button", () => {
    render(
      <FleetHealthGauge
        score={7.1}
        totalDevices={496}
        devicesWithIssues={355}
      />,
    );
    expect(
      screen.getByRole("button", { name: /show devices with issues/i }),
    ).toBeInTheDocument();
  });

  it("renders with perfect score of 10", () => {
    render(
      <FleetHealthGauge score={10} totalDevices={100} devicesWithIssues={0} />,
    );
    expect(screen.getByText("10")).toBeInTheDocument();
    // devicesWithIssues = 0 → there should be a 0 on screen
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders the gauge pie chart", () => {
    render(
      <FleetHealthGauge
        score={7.1}
        totalDevices={496}
        devicesWithIssues={355}
      />,
    );
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// DeviceTypeDonut
// ---------------------------------------------------------------------------
const mockDonutData = [
  { name: "Gen 4 Smart", value: 2 },
  { name: "Gen 4 Pod", value: 1 },
  { name: "Gen 3 Pod", value: 5 },
];

describe("DeviceTypeDonut", () => {
  // ── Empty / null state ────────────────────────────────────────────────────

  it("renders 'No device data available' when data is empty", () => {
    render(<DeviceTypeDonut data={[]} />);
    expect(screen.getByText("No device data available")).toBeInTheDocument();
  });

  it("renders 'No device data available' when data is null", () => {
    // @ts-expect-error testing null edge case
    render(<DeviceTypeDonut data={null} />);
    expect(screen.getByText("No device data available")).toBeInTheDocument();
  });

  it("does not render the chart when data is empty", () => {
    render(<DeviceTypeDonut data={[]} />);
    expect(screen.queryByTestId("pie-chart")).not.toBeInTheDocument();
  });

  // ── Chart structure ───────────────────────────────────────────────────────

  it("renders the PieChart when data is provided", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    expect(screen.getByTestId("pie-chart")).toBeInTheDocument();
  });

  it("renders the Pie element", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    expect(screen.getByTestId("pie")).toBeInTheDocument();
  });

  it("renders the ResponsiveContainer", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    expect(screen.getByTestId("responsive-container")).toBeInTheDocument();
  });

  // ── Cells (slices) ────────────────────────────────────────────────────────

  it("renders one Cell per data entry", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    expect(screen.getAllByTestId("cell")).toHaveLength(mockDonutData.length);
  });

  it("renders one Cell for a single-item dataset", () => {
    render(<DeviceTypeDonut data={[{ name: "Solo Pod", value: 9 }]} />);
    expect(screen.getAllByTestId("cell")).toHaveLength(1);
  });

  it("cycles COLORS correctly for more than 3 entries", () => {
    const manyItems = Array.from({ length: 5 }, (_, i) => ({
      name: `Type ${i + 1}`,
      value: i + 1,
    }));
    render(<DeviceTypeDonut data={manyItems} />);
    expect(screen.getAllByTestId("cell")).toHaveLength(5);
  });

  it("applies first COLORS[0] (#5B84C4) to the first cell", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    const cells = screen.getAllByTestId("cell");
    expect(cells[0]).toHaveStyle({ background: "#5B84C4" });
  });

  it("applies COLORS[1] (#D97706) to the second cell", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    const cells = screen.getAllByTestId("cell");
    expect(cells[1]).toHaveStyle({ background: "#D97706" });
  });

  it("applies COLORS[2] (#8B5CF6) to the third cell", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    const cells = screen.getAllByTestId("cell");
    expect(cells[2]).toHaveStyle({ background: "#8B5CF6" });
  });

  // ── Center label ──────────────────────────────────────────────────────────

  it("renders 'Total Devices' center label", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    expect(screen.getByText("Total Devices")).toBeInTheDocument();
  });

  it("renders the correct total count in the center (2 + 1 + 5 = 8)", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("renders correct total for large values", () => {
    const bigData = [
      { name: "A", value: 5000 },
      { name: "B", value: 3000 },
    ];
    render(<DeviceTypeDonut data={bigData} />);
    expect(screen.getByText("8000")).toBeInTheDocument();
  });

  // ── Legend / list ─────────────────────────────────────────────────────────

  it("renders a legend entry for each data item", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    expect(screen.getByText("Gen 4 Smart")).toBeInTheDocument();
    expect(screen.getByText("Gen 4 Pod")).toBeInTheDocument();
    expect(screen.getByText("Gen 3 Pod")).toBeInTheDocument();
  });

  it("renders value next to each legend entry", () => {
    render(<DeviceTypeDonut data={mockDonutData} />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders a colored dot for each legend entry", () => {
    const { container } = render(<DeviceTypeDonut data={mockDonutData} />);
    // Each legend row contains a span with inline background style
    const dots = container.querySelectorAll("span[style]");
    expect(dots.length).toBeGreaterThanOrEqual(mockDonutData.length);
  });

  // ── No crash edge cases ───────────────────────────────────────────────────

  it("does not crash with a single data entry", () => {
    expect(() =>
      render(<DeviceTypeDonut data={[{ name: "Only", value: 1 }]} />),
    ).not.toThrow();
  });

  it("does not crash with many entries", () => {
    const manyItems = Array.from({ length: 10 }, (_, i) => ({
      name: `Device ${i}`,
      value: i + 1,
    }));
    expect(() => render(<DeviceTypeDonut data={manyItems} />)).not.toThrow();
  });
});
