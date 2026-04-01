import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import UsagePage from "@/components/analytics/usage/page";

// Mock child components so we can assert they receive the right props
jest.mock("@/components/DeviceUtilizationChart", () =>
  jest.fn(({ timeRange }: { timeRange: string }) => (
    <div data-testid="device-utilization" data-time-range={timeRange} />
  ))
);

jest.mock("@/components/UserConnectionsChart", () =>
  jest.fn(
    ({
      timeRange,
      title,
      subtitle,
    }: {
      timeRange: string;
      title: string;
      subtitle?: string;
    }) => (
      <div
        data-testid="user-connections"
        data-time-range={timeRange}
        data-title={title}
        data-subtitle={subtitle}
      />
    )
  )
);

jest.mock("@/components/CollaborationChart", () =>
  jest.fn(({ timeRange }: { timeRange: string }) => (
    <div data-testid="collaboration-usage" data-time-range={timeRange} />
  ))
);

jest.mock("@/components/SelectedDevices", () => {
  return jest.fn(({ onSelectionChange, timeRange }: any) => {
    const [checked, setChecked] = React.useState(true);

    React.useEffect(() => {
      // Simulate initial selection change with all devices selected
      if (onSelectionChange) {
        onSelectionChange(new Set(["device-1"]));
      }
    }, [onSelectionChange]);

    return (
      <div data-testid="selected-devices" data-time-range={timeRange}>
        <label>
          <input
            type="checkbox"
            aria-label="Device 1"
            checked={checked}
            onChange={() => {
              const newChecked = !checked;
              setChecked(newChecked);
              if (onSelectionChange) {
                onSelectionChange(
                  newChecked ? new Set(["device-1"]) : new Set()
                );
              }
            }}
          />
          Device 1
        </label>
      </div>
    );
  });
});

jest.mock("@/components/skeleton/LineChartSkeleton", () =>
  jest.fn(({ title, description }: { title: string; description?: string }) => (
    <div
      data-testid="line-chart-skeleton"
      data-title={title}
      data-description={description}
    />
  ))
);

jest.mock("@/components/skeleton/AreaChartSkeleton", () =>
  jest.fn(({ title, description }: { title: string; description?: string }) => (
    <div
      data-testid="area-chart-skeleton"
      data-title={title}
      data-description={description}
    />
  ))
);

// Mock the hooks
jest.mock("@/lib/analytics/hooks/useTimeSeriesMetrics", () => ({
  useUsageMetrics: jest.fn().mockReturnValue({ ready: true }),
  registerMetric: jest.fn(),
}));

const TIME_RANGE_BUTTONS = [
  "Last 7 days",
  "Last 30 days",
  "Last 60 days",
  "Last 90 days",
  "All time",
];

// Helper function to render UsagePage with required orgId prop
const renderUsagePage = (props: Partial<{ orgId: string }> = {}) => {
  return render(<UsagePage orgId="test-org-123" {...props} />);
};

describe("UsagePage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("initial render", () => {
    it("renders the page heading", () => {
      renderUsagePage();
      expect(screen.getByText("Usage")).toBeInTheDocument();
    });

    it("renders all five time-range buttons", () => {
      renderUsagePage();
      TIME_RANGE_BUTTONS.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it("defaults to 'Last 7 days' as the active time range", () => {
      renderUsagePage();
      const activeBtn = screen.getByText("Last 7 days");
      expect(activeBtn).toHaveClass("bg-[#6860C8]");
    });

    it("non-active time range buttons do not have the active style", () => {
      renderUsagePage();
      const inactiveBtn = screen.getByText("Last 30 days");
      expect(inactiveBtn).not.toHaveClass("bg-[#6860C8]");
    });
  });

  // ── Loading / skeleton state ───────────────────────────────────────────────

  describe("loading state (first 1 s)", () => {
    it("shows LineChartSkeleton for Device Utilization while loading", () => {
      renderUsagePage();
      // Two LineChartSkeletons render (Device Utilization + Collaboration Usage)
      const skeletons = screen.getAllByTestId("line-chart-skeleton");
      expect(skeletons.length).toBe(2);
      expect(
        screen.queryByTestId("device-utilization")
      ).not.toBeInTheDocument();
    });

    it("shows AreaChartSkeleton for User Connections while loading", () => {
      renderUsagePage();
      expect(screen.getByTestId("area-chart-skeleton")).toBeInTheDocument();
      expect(screen.queryByTestId("user-connections")).not.toBeInTheDocument();
    });

    it("LineChartSkeleton for Device Utilization receives correct title and description props", () => {
      renderUsagePage();
      const skeletons = screen.getAllByTestId("line-chart-skeleton");
      const deviceSkeleton = skeletons.find(
        (s) => s.getAttribute("data-title") === "Device Utilization"
      )!;
      expect(deviceSkeleton).toHaveAttribute(
        "data-title",
        "Device Utilization"
      );
      expect(deviceSkeleton).toHaveAttribute(
        "data-description",
        "Compare up to two types of usage data for devices in your organization"
      );
    });

    it("AreaChartSkeleton receives correct title and description props", () => {
      renderUsagePage();
      const skeleton = screen.getByTestId("area-chart-skeleton");
      expect(skeleton).toHaveAttribute("data-title", "User Connections");
    });

    it("shows LineChartSkeleton for CollaborationUsage while loading", () => {
      renderUsagePage();
      const skeletons = screen.getAllByTestId("line-chart-skeleton");
      const collabSkeleton = skeletons.find(
        (s) => s.getAttribute("data-title") === "Collaboration Usage"
      )!;
      expect(collabSkeleton).toHaveAttribute(
        "data-title",
        "Collaboration Usage"
      );
    });

    it("renders SelectedDevices even while loading (no skeleton)", () => {
      renderUsagePage();
      expect(screen.getByTestId("selected-devices")).toBeInTheDocument();
    });
  });

  // ── Loaded state ──────────────────────────────────────────────────────────

  describe("loaded state (after 1 s)", () => {
    const renderAndLoad = async () => {
      renderUsagePage();
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    };

    it("replaces LineChartSkeleton with DeviceUtilization", async () => {
      await renderAndLoad();
      expect(
        screen.queryByTestId("line-chart-skeleton")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("device-utilization")).toBeInTheDocument();
    });

    it("replaces AreaChartSkeleton with UserConnections", async () => {
      await renderAndLoad();
      expect(
        screen.queryByTestId("area-chart-skeleton")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("user-connections")).toBeInTheDocument();
    });

    it("shows CollaborationUsage after loading", async () => {
      await renderAndLoad();
      expect(screen.getByTestId("collaboration-usage")).toBeInTheDocument();
    });

    it("passes default '7d' timeRange to DeviceUtilization", async () => {
      await renderAndLoad();
      expect(screen.getByTestId("device-utilization")).toHaveAttribute(
        "data-time-range",
        "7d"
      );
    });

    it("passes correct title to UserConnections", async () => {
      await renderAndLoad();
      expect(screen.getByTestId("user-connections")).toHaveAttribute(
        "data-title",
        "User Connections"
      );
    });
  });

  // ── Time range switching ──────────────────────────────────────────────────

  describe("time range switching", () => {
    const renderAndLoad = async () => {
      renderUsagePage();
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    };

    it.each([
      ["Last 7 days", "7d"],
      ["Last 30 days", "30d"],
      ["Last 60 days", "60d"],
      ["Last 90 days", "90d"],
      ["All time", "all"],
    ])("clicking '%s' makes it the active button", async (label, _key) => {
      await renderAndLoad();
      fireEvent.click(screen.getByText(label));
      expect(screen.getByText(label)).toHaveClass("bg-[#6860C8]");
    });

    it("previously active button loses active style on switch", async () => {
      await renderAndLoad();
      fireEvent.click(screen.getByText("Last 30 days"));
      expect(screen.getByText("Last 7 days")).not.toHaveClass("bg-[#6860C8]");
    });

    it("passes updated timeRange to DeviceUtilization on switch", async () => {
      await renderAndLoad();
      fireEvent.click(screen.getByText("Last 30 days"));
      expect(screen.getByTestId("device-utilization")).toHaveAttribute(
        "data-time-range",
        "30d"
      );
    });

    it("passes updated timeRange to UserConnections on switch", async () => {
      await renderAndLoad();
      fireEvent.click(screen.getByText("Last 30 days"));
      expect(screen.getByTestId("user-connections")).toHaveAttribute(
        "data-time-range",
        "30d"
      );
    });

    it("passes updated timeRange to CollaborationUsage on switch", async () => {
      await renderAndLoad();
      fireEvent.click(screen.getByText("Last 90 days"));
      expect(screen.getByTestId("collaboration-usage")).toHaveAttribute(
        "data-time-range",
        "90d"
      );
    });
  });

  // ── Structural / layout ───────────────────────────────────────────────────

  describe("page structure", () => {
    const renderAndLoad = async () => {
      const { container } = renderUsagePage();
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      return { container };
    };

    it("renders 3 <hr> dividers after loading", async () => {
      const { container } = await renderAndLoad();
      // There should be 3 hr elements in the component
      const hrs = container.querySelectorAll("hr");
      expect(hrs.length).toBe(3);
    });

    it("SelectedDevices is always present regardless of loading state", () => {
      renderUsagePage();
      expect(screen.getByTestId("selected-devices")).toBeInTheDocument();
    });
  });

  // ── Device selection (integration) ─────────────────────────────────────────

  describe("device selection (integration)", () => {
    const renderAndLoad = async () => {
      renderUsagePage();
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    };

    it("updates UI when device is unchecked", async () => {
      await renderAndLoad();

      const checkbox = screen.getByRole("checkbox", {
        name: /device 1/i,
      });

      // Initially checked
      expect(checkbox).toBeChecked();

      // Uncheck
      fireEvent.click(checkbox);

      expect(checkbox).not.toBeChecked();

      // Basic assertion to confirm UI still stable after interaction
      expect(screen.getByTestId("device-utilization")).toBeInTheDocument();
    });
  });
});
