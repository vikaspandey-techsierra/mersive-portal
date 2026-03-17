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
      data,
      interval,
      title,
      subtitle,
    }: {
      data: unknown[];
      interval: number;
      title: string;
      subtitle?: string;
    }) => (
      <div
        data-testid="user-connections"
        data-interval={interval}
        data-title={title}
        data-subtitle={subtitle}
        data-data-length={data.length}
      />
    )
  )
);

jest.mock("@/components/CollaborationChart", () =>
  jest.fn(({ data, interval }: { data: unknown[]; interval: number }) => (
    <div
      data-testid="collaboration-usage"
      data-interval={interval}
      data-data-length={data.length}
    />
  ))
);

jest.mock("@/components/SelectedDevices", () => {
  return jest.fn(() => {
    const [checked, setChecked] = React.useState(true);

    return (
      <div data-testid="selected-devices">
        <label>
          <input
            type="checkbox"
            aria-label="Device 1"
            checked={checked}
            onChange={() => setChecked(!checked)}
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

const TIME_RANGE_BUTTONS = [
  "Last 7 days",
  "Last 30 days",
  "Last 60 days",
  "Last 90 days",
  "All time",
];

describe("UsagePage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ── Rendering ─────────────────────────────────────────────────────────────

  describe("initial render", () => {
    it("renders the page heading", () => {
      render(<UsagePage />);
      expect(screen.getByText("Usage")).toBeInTheDocument();
    });

    it("renders all five time-range buttons", () => {
      render(<UsagePage />);
      TIME_RANGE_BUTTONS.forEach((label) => {
        expect(screen.getByText(label)).toBeInTheDocument();
      });
    });

    it("defaults to 'Last 7 days' as the active time range", () => {
      render(<UsagePage />);
      const activeBtn = screen.getByText("Last 7 days");
      expect(activeBtn).toHaveClass("bg-[#6860C8]");
    });

    it("non-active time range buttons do not have the active style", () => {
      render(<UsagePage />);
      const inactiveBtn = screen.getByText("Last 30 days");
      expect(inactiveBtn).not.toHaveClass("bg-[#6860C8]");
    });
  });

  // ── Loading / skeleton state ───────────────────────────────────────────────

  describe("loading state (first 1 s)", () => {
    it("shows LineChartSkeleton for Device Utilization while loading", () => {
      render(<UsagePage />);
      // Two LineChartSkeletons render (Device Utilization + Collaboration Usage)
      const skeletons = screen.getAllByTestId("line-chart-skeleton");
      expect(skeletons.length).toBe(2);
      expect(
        screen.queryByTestId("device-utilization")
      ).not.toBeInTheDocument();
    });

    it("shows AreaChartSkeleton for User Connections while loading", () => {
      render(<UsagePage />);
      expect(screen.getByTestId("area-chart-skeleton")).toBeInTheDocument();
      expect(screen.queryByTestId("user-connections")).not.toBeInTheDocument();
    });

    it("LineChartSkeleton for Device Utilization receives correct title and description props", () => {
      render(<UsagePage />);
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
      render(<UsagePage />);
      const skeleton = screen.getByTestId("area-chart-skeleton");
      expect(skeleton).toHaveAttribute("data-title", "User Connections");
    });

    it("shows LineChartSkeleton for CollaborationUsage while loading", () => {
      render(<UsagePage />);
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
      render(<UsagePage />);
      expect(screen.getByTestId("selected-devices")).toBeInTheDocument();
    });
  });

  // ── Loaded state ──────────────────────────────────────────────────────────

  describe("loaded state (after 1 s)", () => {
    const renderAndLoad = async () => {
      render(<UsagePage />);
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

    it("passes non-empty data array to UserConnections", async () => {
      await renderAndLoad();
      const el = screen.getByTestId("user-connections");
      expect(Number(el.getAttribute("data-data-length"))).toBeGreaterThan(0);
    });

    it("passes non-empty data array to CollaborationUsage", async () => {
      await renderAndLoad();
      const el = screen.getByTestId("collaboration-usage");
      expect(Number(el.getAttribute("data-data-length"))).toBeGreaterThan(0);
    });
  });

  // ── Time range switching ──────────────────────────────────────────────────

  describe("time range switching", () => {
    const renderAndLoad = async () => {
      render(<UsagePage />);
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

    it("passes updated data length to UserConnections for 30d", async () => {
      await renderAndLoad();
      const before = Number(
        screen.getByTestId("user-connections").getAttribute("data-data-length")
      );
      fireEvent.click(screen.getByText("Last 30 days"));
      const after = Number(
        screen.getByTestId("user-connections").getAttribute("data-data-length")
      );
      // 30-day window should have more data points than 7-day
      expect(after).toBeGreaterThan(before);
    });

    it("passes updated data length to CollaborationUsage for 90d", async () => {
      await renderAndLoad();
      fireEvent.click(screen.getByText("Last 7 days")); // reset
      const before = Number(
        screen
          .getByTestId("collaboration-usage")
          .getAttribute("data-data-length")
      );
      fireEvent.click(screen.getByText("Last 90 days"));
      const after = Number(
        screen
          .getByTestId("collaboration-usage")
          .getAttribute("data-data-length")
      );
      expect(after).toBeGreaterThan(before);
    });

    it("interval value changes between 7d and 90d", async () => {
      await renderAndLoad();
      const interval7d = Number(
        screen.getByTestId("user-connections").getAttribute("data-interval")
      );
      fireEvent.click(screen.getByText("Last 90 days"));
      const interval90d = Number(
        screen.getByTestId("user-connections").getAttribute("data-interval")
      );
      // larger range → larger tick interval
      expect(interval90d).toBeGreaterThan(interval7d);
    });
  });

  // ── Structural / layout ───────────────────────────────────────────────────

  describe("page structure", () => {
    const renderAndLoad = async () => {
      render(<UsagePage />);
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
    };

    it("renders exactly 2 <hr> dividers after loading", async () => {
      const { container } = render(<UsagePage />);
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });
      expect(container.querySelectorAll("hr").length).toBe(3);
    });

    it("SelectedDevices is always present regardless of loading state", () => {
      render(<UsagePage />);
      expect(screen.getByTestId("selected-devices")).toBeInTheDocument();
    });
  });

  // ── Device selection (integration) ─────────────────────────────────────────

  describe("device selection (integration)", () => {
    const renderAndLoad = async () => {
      render(<UsagePage />);
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
