/**
 * AlertHistorySection.test.tsx
 *
 * Tests for the AlertHistorySection component (embedded inside page.tsx).
 * Since it's not exported directly, we render the full EmailAlertsPage
 * and scroll past the chart to reach the history table.
 *
 * Covers: loading spinner, table columns, row data, search filter,
 * My/All filter toggle, sort by each column, Export CSV button.
 */

import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";

// ─── Mock child components ────────────────────────────────────────────────────

jest.mock("@/components/AlertGraph", () => ({
  __esModule: true,
  default: () => <div data-testid="alert-graph" />,
}));

jest.mock("@/components/skeleton/AreaChartSkeleton", () => ({
  __esModule: true,
  default: ({ title }: { title: string }) => (
    <div data-testid="area-chart-skeleton">{title}</div>
  ),
}));

jest.mock("@/lib/homePage", () => ({
  generateMockData: (n: number) => ({
    userConnections: Array.from({ length: n }, () => ({})),
  }),
  DAY_COUNTS: { "7d": 7, "30d": 30, "60d": 60, "90d": 90, all: 120 },
  tickInterval: () => 0,
  isValidEmail: (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e),
}));

global.fetch = jest
  .fn()
  .mockResolvedValue({ ok: true, json: async () => ({}) });

// ─── Import after mocks ───────────────────────────────────────────────────────

import EmailAlertsPage from "@/components/analytics/email/page";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function renderPage() {
  return render(<EmailAlertsPage />);
}

async function waitForTableLoad() {
  // AlertHistorySection has a 2000ms loading delay
  await act(async () => {
    jest.advanceTimersByTime(2100);
  });
}

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(async () => {
  await act(async () => {
    jest.runAllTimers();
  });
  jest.useRealTimers();
  jest.clearAllMocks();
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("AlertHistorySection — loading state", () => {
  it("shows a loading spinner while data loads", () => {
    renderPage();
    // The LoadingSpinner SVG has class animate-spin
    const spinners = document.querySelectorAll(".animate-spin");
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  it("hides spinner and shows rows after 2 seconds", async () => {
    renderPage();
    await waitForTableLoad();
    expect(screen.getByText("Board Room")).toBeInTheDocument();
  });
});

describe("AlertHistorySection — table structure", () => {
  it("renders all 5 column headers", async () => {
    renderPage();
    await waitForTableLoad();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Recipients")).toBeInTheDocument();
  });

  it("renders all 4 mock rows", async () => {
    renderPage();
    await waitForTableLoad();
    expect(screen.getByText("Board Room")).toBeInTheDocument();
    expect(screen.getByText("Corner Conference")).toBeInTheDocument();
    expect(screen.getByText("Hallway")).toBeInTheDocument();
    expect(screen.getByText("John's Office")).toBeInTheDocument();
  });

  it("renders device ID in each row", async () => {
    renderPage();
    await waitForTableLoad();
    expect(screen.getByText("PD0104A0001")).toBeInTheDocument();
    expect(screen.getByText("PD0104A0002")).toBeInTheDocument();
    expect(screen.getByText("PD0104A0003")).toBeInTheDocument();
    expect(screen.getByText("PD0104A0004")).toBeInTheDocument();
  });

  it("renders description text for each row", async () => {
    renderPage();
    await waitForTableLoad();
    expect(screen.getByText("Device rebooted")).toBeInTheDocument();
    expect(
      screen.getByText(/Device unreachable for 10 minutes/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Device firmware update from 15.0 to 15.1 failed/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Device firmware update from 15.0 to 15.0.3 completed/i)
    ).toBeInTheDocument();
  });

  it("renders the date + timeAgo for a row", async () => {
    renderPage();
    await waitForTableLoad();
    expect(
      screen.getByText(/December 16th 2025, 8:45AM – 6 days ago/i)
    ).toBeInTheDocument();
  });
});

describe("AlertHistorySection — search filter", () => {
  it("filters rows by device name", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "Hallway" } });
    expect(screen.getByText("Hallway")).toBeInTheDocument();
    expect(screen.queryByText("Board Room")).not.toBeInTheDocument();
    expect(screen.queryByText("Corner Conference")).not.toBeInTheDocument();
  });

  it("filters rows by ID", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "PD0104A0003" } });
    expect(screen.getByText("Hallway")).toBeInTheDocument();
    expect(screen.queryByText("Board Room")).not.toBeInTheDocument();
  });

  it("filters rows by description text", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "rebooted" } });

    // "Device rebooted" belongs to Board Room, not Hallway
    expect(screen.getByText("Device rebooted")).toBeInTheDocument();
    expect(screen.getByText("Board Room")).toBeInTheDocument();

    // Other rows without "rebooted" in description should not be visible
    expect(screen.queryByText("Hallway")).not.toBeInTheDocument();
    expect(screen.queryByText("Corner Conference")).not.toBeInTheDocument();
    expect(screen.queryByText("John's Office")).not.toBeInTheDocument();
  });

  it("filters rows by recipient email", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "itsupport@mersive.com" } });
    // Corner Conference and Hallway have itsupport
    expect(screen.getByText("Corner Conference")).toBeInTheDocument();
    expect(screen.getByText("Hallway")).toBeInTheDocument();
    expect(screen.queryByText("Board Room")).not.toBeInTheDocument();
  });

  it("shows 'No alerts found' when search has no matches", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "xyznotexist" } });
    expect(screen.getByText("No alerts found")).toBeInTheDocument();
  });

  it("search is case-insensitive", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "BOARD ROOM" } });
    expect(screen.getByText("Board Room")).toBeInTheDocument();
  });

  it("clearing search restores all rows", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "Hallway" } });
    fireEvent.change(search, { target: { value: "" } });
    expect(screen.getByText("Board Room")).toBeInTheDocument();
    expect(screen.getByText("Corner Conference")).toBeInTheDocument();
    expect(screen.getByText("John's Office")).toBeInTheDocument();
  });
});

describe("AlertHistorySection — My/All filter toggle", () => {
  // Helpers: target the history filter buttons by exact text (not the Alert Settings tab)
  function getMyAlertsFilter() {
    return screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "My alerts")!;
  }
  function getAllAlertsFilter() {
    return screen
      .getAllByRole("button")
      .find((b) => b.textContent?.trim() === "All alerts")!;
  }

  it("renders 'My alerts' and 'All alerts' buttons", async () => {
    renderPage();
    await waitForTableLoad();
    expect(getMyAlertsFilter()).toBeInTheDocument();
    expect(getAllAlertsFilter()).toBeInTheDocument();
  });

  it("'My alerts' is active by default", async () => {
    renderPage();
    await waitForTableLoad();
    expect(getMyAlertsFilter().className).toMatch(/bg-\[#5E54C5\]/);
  });

  it("switches to 'All alerts' active state", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(getAllAlertsFilter());
    expect(getAllAlertsFilter().className).toMatch(/bg-\[#5E54C5\]/);
  });

  it("switching back to 'My alerts' restores its active state", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(getAllAlertsFilter());
    fireEvent.click(getMyAlertsFilter());
    expect(getMyAlertsFilter().className).toMatch(/bg-\[#5E54C5\]/);
  });
});

describe("AlertHistorySection — sorting", () => {
  it("clicking 'Name' column header sorts rows", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(screen.getByText("Name"));
    // After asc sort, Board Room should be first
    const cells = document.querySelectorAll("td:nth-child(2)");
    const names = Array.from(cells).map((c) => c.textContent?.trim());
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  it("clicking 'Name' twice reverses sort order", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(screen.getByText("Name"));
    fireEvent.click(screen.getByText("Name"));
    const cells = document.querySelectorAll("td:nth-child(2)");
    const names = Array.from(cells).map((c) => c.textContent?.trim());
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  it("clicking 'ID' column header sorts by ID", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(screen.getByText("ID"));
    const cells = document.querySelectorAll("td:nth-child(3)");
    const ids = Array.from(cells).map((c) => c.textContent?.trim());
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });

  it("clicking a new column resets to ascending order", async () => {
    renderPage();
    await waitForTableLoad();
    // Sort by Name desc first
    fireEvent.click(screen.getByText("Name"));
    fireEvent.click(screen.getByText("Name"));
    // Now click ID — should reset to ascending
    fireEvent.click(screen.getByText("ID"));
    const cells = document.querySelectorAll("td:nth-child(3)");
    const ids = Array.from(cells).map((c) => c.textContent?.trim());
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });

  it("SortArrows renders for each column header", async () => {
    renderPage();
    await waitForTableLoad();
    // Each Th renders 2 SVG arrows
    const sortSvgs = document.querySelectorAll("th svg");
    expect(sortSvgs.length).toBe(10); // 5 columns × 2 arrows
  });
});

describe("AlertHistorySection — Export CSV button", () => {
  it("renders Export to CSV button in history section", async () => {
    renderPage();
    await waitForTableLoad();
    // There are two: one in the top nav and one in the history section
    const btns = screen.getAllByRole("button", { name: /export to csv/i });
    expect(btns.length).toBeGreaterThanOrEqual(1);
  });
});
