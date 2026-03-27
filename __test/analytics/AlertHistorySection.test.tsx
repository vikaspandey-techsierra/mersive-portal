/**
 * AlertHistorySection.test.tsx
 * Tests for the AlertHistorySection component (embedded inside page.tsx).
 * Note: These tests are skipped because SHOW_ALERT_HISTORY is false in the component.
 * To run these tests, set SHOW_ALERT_HISTORY = true in components/analytics/email/page.tsx
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

// ─── Tests - All skipped because SHOW_ALERT_HISTORY is false in the component ───

describe("AlertHistorySection — loading state", () => {
  it.skip("shows a loading spinner while data loads", () => {
    renderPage();
    const spinners = document.querySelectorAll(".animate-spin");
    expect(spinners.length).toBeGreaterThanOrEqual(1);
  });

  it.skip("hides spinner and shows rows after 2 seconds", async () => {
    renderPage();
    await waitForTableLoad();
    expect(screen.getByText("Board Room")).toBeInTheDocument();
  });
});

describe("AlertHistorySection — table structure", () => {
  it.skip("renders all 5 column headers", async () => {
    renderPage();
    await waitForTableLoad();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("ID")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Recipients")).toBeInTheDocument();
  });

  it.skip("renders all 4 mock rows", async () => {
    renderPage();
    await waitForTableLoad();
    expect(screen.getByText("Board Room")).toBeInTheDocument();
    expect(screen.getByText("Corner Conference")).toBeInTheDocument();
    expect(screen.getByText("Hallway")).toBeInTheDocument();
    expect(screen.getByText("John's Office")).toBeInTheDocument();
  });

  it.skip("renders device ID in each row", async () => {
    renderPage();
    await waitForTableLoad();
    expect(screen.getByText("PD0104A0001")).toBeInTheDocument();
    expect(screen.getByText("PD0104A0002")).toBeInTheDocument();
    expect(screen.getByText("PD0104A0003")).toBeInTheDocument();
    expect(screen.getByText("PD0104A0004")).toBeInTheDocument();
  });

  it.skip("renders description text for each row", async () => {
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

  it.skip("renders the date + timeAgo for a row", async () => {
    renderPage();
    await waitForTableLoad();
    expect(
      screen.getByText(/December 16th 2025, 8:45AM – 6 days ago/i)
    ).toBeInTheDocument();
  });
});

describe("AlertHistorySection — search filter", () => {
  it.skip("filters rows by device name", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "Hallway" } });
    expect(screen.getByText("Hallway")).toBeInTheDocument();
    expect(screen.queryByText("Board Room")).not.toBeInTheDocument();
    expect(screen.queryByText("Corner Conference")).not.toBeInTheDocument();
  });

  it.skip("filters rows by ID", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "PD0104A0003" } });
    expect(screen.getByText("Hallway")).toBeInTheDocument();
    expect(screen.queryByText("Board Room")).not.toBeInTheDocument();
  });

  it.skip("filters rows by description text", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "rebooted" } });
    expect(screen.getByText("Device rebooted")).toBeInTheDocument();
    expect(screen.getByText("Board Room")).toBeInTheDocument();
    expect(screen.queryByText("Hallway")).not.toBeInTheDocument();
    expect(screen.queryByText("Corner Conference")).not.toBeInTheDocument();
    expect(screen.queryByText("John's Office")).not.toBeInTheDocument();
  });

  it.skip("filters rows by recipient email", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "itsupport@mersive.com" } });
    expect(screen.getByText("Corner Conference")).toBeInTheDocument();
    expect(screen.getByText("Hallway")).toBeInTheDocument();
    expect(screen.queryByText("Board Room")).not.toBeInTheDocument();
  });

  it.skip("shows 'No alerts found' when search has no matches", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "xyznotexist" } });
    expect(screen.getByText("No alerts found")).toBeInTheDocument();
  });

  it.skip("search is case-insensitive", async () => {
    renderPage();
    await waitForTableLoad();
    const search = screen.getByPlaceholderText("Search");
    fireEvent.change(search, { target: { value: "BOARD ROOM" } });
    expect(screen.getByText("Board Room")).toBeInTheDocument();
  });

  it.skip("clearing search restores all rows", async () => {
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

  it.skip("renders 'My alerts' and 'All alerts' buttons", async () => {
    renderPage();
    await waitForTableLoad();
    expect(getMyAlertsFilter()).toBeInTheDocument();
    expect(getAllAlertsFilter()).toBeInTheDocument();
  });

  it.skip("'My alerts' is active by default", async () => {
    renderPage();
    await waitForTableLoad();
    expect(getMyAlertsFilter().className).toMatch(/bg-\[#5E54C5\]/);
  });

  it.skip("switches to 'All alerts' active state", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(getAllAlertsFilter());
    expect(getAllAlertsFilter().className).toMatch(/bg-\[#5E54C5\]/);
  });

  it.skip("switching back to 'My alerts' restores its active state", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(getAllAlertsFilter());
    fireEvent.click(getMyAlertsFilter());
    expect(getMyAlertsFilter().className).toMatch(/bg-\[#5E54C5\]/);
  });
});

describe("AlertHistorySection — sorting", () => {
  it.skip("clicking 'Name' column header sorts rows", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(screen.getByText("Name"));
    const cells = document.querySelectorAll("td:nth-child(2)");
    const names = Array.from(cells).map((c) => c.textContent?.trim());
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });

  it.skip("clicking 'Name' twice reverses sort order", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(screen.getByText("Name"));
    fireEvent.click(screen.getByText("Name"));
    const cells = document.querySelectorAll("td:nth-child(2)");
    const names = Array.from(cells).map((c) => c.textContent?.trim());
    const sorted = [...names].sort().reverse();
    expect(names).toEqual(sorted);
  });

  it.skip("clicking 'ID' column header sorts by ID", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(screen.getByText("ID"));
    const cells = document.querySelectorAll("td:nth-child(3)");
    const ids = Array.from(cells).map((c) => c.textContent?.trim());
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });

  it.skip("clicking a new column resets to ascending order", async () => {
    renderPage();
    await waitForTableLoad();
    fireEvent.click(screen.getByText("Name"));
    fireEvent.click(screen.getByText("Name"));
    fireEvent.click(screen.getByText("ID"));
    const cells = document.querySelectorAll("td:nth-child(3)");
    const ids = Array.from(cells).map((c) => c.textContent?.trim());
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });

  it.skip("SortArrows renders for each column header", async () => {
    renderPage();
    await waitForTableLoad();
    const sortSvgs = document.querySelectorAll("th svg");
    expect(sortSvgs.length).toBe(10);
  });
});

describe("AlertHistorySection — Export CSV button", () => {
  it.skip("renders Export to CSV button in history section", async () => {
    renderPage();
    await waitForTableLoad();
    const btns = screen.getAllByRole("button", { name: /export to csv/i });
    expect(btns.length).toBeGreaterThanOrEqual(1);
  });
});
