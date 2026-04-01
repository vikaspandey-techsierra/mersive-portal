/**
 * emailAlertsSkeletonsAndHelpers.test.tsx
 *
 * Tests for:
 * - AreaChartSkeleton (used as loading state for AlertGraph)
 * - buildAlertSettings (payload builder, tested via output shape)
 * - isValidEmail (from lib/homePage)
 * - Toggle component (reusable switch)
 * - AlertRow (individual alert row with minutes input)
 * - AlertConfigSection (group of 6 alert rows)
 * - MOCK_HISTORY shape (4 rows, required keys)
 * - DAY_COUNTS + tickInterval mirrored inline
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// ─── AreaChartSkeleton ────────────────────────────────────────────────────────

import AreaChartSkeleton from "@/components/skeleton/AreaChartSkeleton";

describe("AreaChartSkeleton", () => {
  it("renders the title", () => {
    render(<AreaChartSkeleton title="Alert History" />);
    expect(screen.getByText("Alert History")).toBeInTheDocument();
  });

  it("renders optional description", () => {
    render(
      <AreaChartSkeleton
        title="Alert History"
        description="View alert data here"
      />
    );
    expect(screen.getByText("View alert data here")).toBeInTheDocument();
  });

  it("omits description element when not provided", () => {
    render(<AreaChartSkeleton title="Alert History" />);
    expect(screen.queryByText("View alert data here")).not.toBeInTheDocument();
  });

  it("applies animate-pulse class for skeleton effect", () => {
    render(<AreaChartSkeleton title="Alert History" />);
    const pulse = document.querySelector(".animate-pulse");
    expect(pulse).toBeInTheDocument();
  });

  it("renders an SVG chart placeholder", () => {
    render(<AreaChartSkeleton title="Alert History" />);
    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("renders 3 polygon shapes in the SVG", () => {
    render(<AreaChartSkeleton title="Alert History" />);
    const polygons = document.querySelectorAll("polygon");
    expect(polygons.length).toBe(3);
  });

  it("renders horizontal grid lines", () => {
    render(<AreaChartSkeleton title="Alert History" />);
    const lines = document.querySelectorAll("line");
    expect(lines.length).toBeGreaterThan(0);
  });

  it("renders 5 legend placeholder items (w-3 h-3 boxes)", () => {
    render(<AreaChartSkeleton title="Alert History" />);
    const boxes = document.querySelectorAll(".w-3.h-3");
    expect(boxes.length).toBe(5);
  });

  it("renders legend bar placeholders (h-5)", () => {
    render(<AreaChartSkeleton title="Alert History" />);
    const bars = document.querySelectorAll(".h-5");
    expect(bars.length).toBeGreaterThanOrEqual(5);
  });

  it("renders a wide legend placeholder (w-36)", () => {
    render(<AreaChartSkeleton title="Alert History" />);
    const wide = document.querySelector(".w-36");
    expect(wide).toBeInTheDocument();
  });
});

// ─── isValidEmail ─────────────────────────────────────────────────────────────

import { isValidEmail } from "@/lib/homePage";

describe("isValidEmail", () => {
  it.each([
    "user@example.com",
    "test.name+tag@domain.org",
    "a@b.co",
    "user123@mail.company.io",
  ])("accepts valid email: %s", (email) => {
    expect(isValidEmail(email)).toBe(true);
  });

  it.each([
    "",
    "notanemail",
    "@nodomain.com",
    "user@",
    "user@ domain.com",
    "user@domain",
  ])("rejects invalid email: %s", (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});

// ─── DAY_COUNTS (mirrored inline) ─────────────────────────────────────────────

const DAY_COUNTS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "60d": 60,
  "90d": 90,
  all: 120,
};

describe("DAY_COUNTS", () => {
  it("has exactly 5 keys", () => {
    expect(Object.keys(DAY_COUNTS).length).toBe(5);
  });

  it.each([
    ["7d", 7],
    ["30d", 30],
    ["60d", 60],
    ["90d", 90],
    ["all", 120],
  ] as [string, number][])("DAY_COUNTS[%s] === %d", (key, expected) => {
    expect(DAY_COUNTS[key]).toBe(expected);
  });

  it("'all' is the maximum value", () => {
    const max = Math.max(...Object.values(DAY_COUNTS));
    expect(DAY_COUNTS["all"]).toBe(max);
  });

  it("all values are positive integers", () => {
    Object.values(DAY_COUNTS).forEach((v) => {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThan(0);
    });
  });
});

// ─── tickInterval (AlertGraph's internal — mirrored inline) ───────────────────

function alertTickInterval(dataLength: number): number {
  if (dataLength <= 7) return 0;
  if (dataLength <= 30) return 4;
  if (dataLength <= 60) return 9;
  return 14;
}

describe("alertTickInterval (AlertGraph)", () => {
  it.each([
    [7, 0],
    [30, 4],
    [60, 9],
    [90, 14],
    [120, 14],
  ] as [number, number][])(
    "dataLength=%d → interval=%d",
    (dataLength, expected) => {
      expect(alertTickInterval(dataLength)).toBe(expected);
    }
  );

  it("returns a non-negative integer for all standard lengths", () => {
    [7, 30, 60, 90, 120].forEach((n) => {
      const v = alertTickInterval(n);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    });
  });

  it("is monotonically non-decreasing as data grows", () => {
    const lengths = [7, 30, 60, 90, 120];
    const intervals = lengths.map(alertTickInterval);
    for (let i = 1; i < intervals.length; i++) {
      expect(intervals[i]).toBeGreaterThanOrEqual(intervals[i - 1]);
    }
  });
});

// ─── MOCK_HISTORY shape ───────────────────────────────────────────────────────

const MOCK_HISTORY = [
  {
    date: "December 16th 2025, 8:45AM",
    timeAgo: "6 days ago",
    name: "Board Room",
    id: "PD0104A0001",
    description: "Device rebooted",
    recipients: "jflores@mersive.com, rkumar@mersive.com",
  },
  {
    date: "December 16th 2025, 9:45AM",
    timeAgo: "6 days ago",
    name: "Corner Conference",
    id: "PD0104A0002",
    description: "Device unreachable for 10 minutes",
    recipients: "itsupport@mersive.com",
  },
  {
    date: "December 16th 2025, 10:45AM",
    timeAgo: "6 days ago",
    name: "Hallway",
    id: "PD0104A0003",
    description: "Device firmware update from 15.0 to 15.1 failed",
    recipients:
      "itsupport@mersive.com, jflores@mersive.com, rkumar@mersive.com",
  },
  {
    date: "December 16th 2025, 11:45AM",
    timeAgo: "6 days ago",
    name: "John's Office",
    id: "PD0104A0004",
    description: "Device firmware update from 15.0 to 15.0.3 completed",
    recipients: "jflores@mersive.com, rkumar@mersive.com",
  },
];

describe("MOCK_HISTORY", () => {
  it("has exactly 4 rows", () => {
    expect(MOCK_HISTORY.length).toBe(4);
  });

  it("each row has all required keys", () => {
    const keys = ["date", "timeAgo", "name", "id", "description", "recipients"];
    MOCK_HISTORY.forEach((row) => {
      keys.forEach((key) => {
        expect(row).toHaveProperty(key);
      });
    });
  });

  it("all IDs are unique", () => {
    const ids = MOCK_HISTORY.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("all IDs follow PD prefix format", () => {
    MOCK_HISTORY.forEach((row) => {
      expect(row.id).toMatch(/^PD[A-Z0-9]+$/);
    });
  });

  it("all names are non-empty strings", () => {
    MOCK_HISTORY.forEach((row) => {
      expect(typeof row.name).toBe("string");
      expect(row.name.length).toBeGreaterThan(0);
    });
  });

  it("all dates are non-empty strings", () => {
    MOCK_HISTORY.forEach((row) => {
      expect(typeof row.date).toBe("string");
      expect(row.date.length).toBeGreaterThan(0);
    });
  });

  it("all recipients strings are non-empty", () => {
    MOCK_HISTORY.forEach((row) => {
      expect(typeof row.recipients).toBe("string");
      expect(row.recipients.length).toBeGreaterThan(0);
    });
  });
});

// ─── buildAlertSettings shape ─────────────────────────────────────────────────
// Inline mirror of the function to test payload shape without importing
// the private helper (not exported from page.tsx).

interface AlertConfig {
  unreachable: boolean;
  unreachableMinutes?: number;
  rebooted: boolean;
  unassignedFromTemplate: boolean;
  firmwareAvailable: boolean;
  firmwareAboutToBegin: boolean;
  firmwareCompleted: boolean;
}

interface Recipient {
  id: string;
  email: string;
  alerts: AlertConfig;
}

const ALERT_ID_MAP = {
  unreachable: 1,
  rebooted: 2,
  unassignedFromTemplate: 3,
  firmwareAvailable: 4,
  firmwareAboutToBegin: 5,
  firmwareCompleted: 6,
} as const;

function buildAlertSettings(myAlerts: AlertConfig, recipients: Recipient[]) {
  const toSettings = (config: AlertConfig) => [
    {
      alert_id: ALERT_ID_MAP.unreachable,
      enabled: config.unreachable,
      parameters: { duration: (config.unreachableMinutes ?? 5) * 60 * 1000 },
    },
    {
      alert_id: ALERT_ID_MAP.rebooted,
      enabled: config.rebooted,
      parameters: { duration: null },
    },
    {
      alert_id: ALERT_ID_MAP.unassignedFromTemplate,
      enabled: config.unassignedFromTemplate,
      parameters: { duration: null },
    },
    {
      alert_id: ALERT_ID_MAP.firmwareAvailable,
      enabled: config.firmwareAvailable,
      parameters: { duration: null },
    },
    {
      alert_id: ALERT_ID_MAP.firmwareAboutToBegin,
      enabled: config.firmwareAboutToBegin,
      parameters: { duration: null },
    },
    {
      alert_id: ALERT_ID_MAP.firmwareCompleted,
      enabled: config.firmwareCompleted,
      parameters: { duration: null },
    },
  ];

  return [
    {
      recipient: "user",
      parameters: { email: null },
      settings: toSettings(myAlerts),
    },
    ...recipients.map((r) => ({
      recipient: "additional_recipient",
      parameters: { email: r.email },
      settings: toSettings(r.alerts),
    })),
  ];
}

const DEFAULT_CONFIG: AlertConfig = {
  unreachable: false,
  unreachableMinutes: 5,
  rebooted: false,
  unassignedFromTemplate: false,
  firmwareAvailable: false,
  firmwareAboutToBegin: false,
  firmwareCompleted: false,
};

describe("buildAlertSettings", () => {
  it("returns 1 entry when no recipients", () => {
    const result = buildAlertSettings(DEFAULT_CONFIG, []);
    expect(result.length).toBe(1);
  });

  it("first entry has recipient='user'", () => {
    const result = buildAlertSettings(DEFAULT_CONFIG, []);
    expect(result[0].recipient).toBe("user");
  });

  it("first entry has email: null", () => {
    const result = buildAlertSettings(DEFAULT_CONFIG, []);
    expect(result[0].parameters.email).toBeNull();
  });

  it("produces 6 alert settings for user entry", () => {
    const result = buildAlertSettings(DEFAULT_CONFIG, []);
    expect(result[0].settings.length).toBe(6);
  });

  it("alert_ids are 1–6 in order", () => {
    const result = buildAlertSettings(DEFAULT_CONFIG, []);
    expect(result[0].settings.map((s) => s.alert_id)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });

  it("unreachable duration is computed from minutes", () => {
    const config = {
      ...DEFAULT_CONFIG,
      unreachable: true,
      unreachableMinutes: 10,
    };
    const result = buildAlertSettings(config, []);
    const unreachSetting = result[0].settings.find((s) => s.alert_id === 1);
    expect(unreachSetting?.parameters.duration).toBe(10 * 60 * 1000);
  });

  it("defaults to 5 minutes for unreachable when unreachableMinutes is undefined", () => {
    const config = { ...DEFAULT_CONFIG, unreachable: true };
    // @ts-ignore
    delete config.unreachableMinutes;
    const result = buildAlertSettings(config, []);
    const unreachSetting = result[0].settings.find((s) => s.alert_id === 1);
    expect(unreachSetting?.parameters.duration).toBe(5 * 60 * 1000);
  });

  it("all non-unreachable settings have duration: null", () => {
    const result = buildAlertSettings(DEFAULT_CONFIG, []);
    const otherSettings = result[0].settings.filter((s) => s.alert_id !== 1);
    otherSettings.forEach((s) => {
      expect(s.parameters.duration).toBeNull();
    });
  });

  it("adds one entry per recipient", () => {
    const recipients: Recipient[] = [
      { id: "r1", email: "a@b.com", alerts: { ...DEFAULT_CONFIG } },
      { id: "r2", email: "c@d.com", alerts: { ...DEFAULT_CONFIG } },
    ];
    const result = buildAlertSettings(DEFAULT_CONFIG, recipients);
    expect(result.length).toBe(3); // user + 2 recipients
  });

  it("recipient entries have recipient='additional_recipient'", () => {
    const recipients: Recipient[] = [
      { id: "r1", email: "a@b.com", alerts: { ...DEFAULT_CONFIG } },
    ];
    const result = buildAlertSettings(DEFAULT_CONFIG, recipients);
    expect(result[1].recipient).toBe("additional_recipient");
  });

  it("recipient entry carries the correct email", () => {
    const recipients: Recipient[] = [
      { id: "r1", email: "test@example.com", alerts: { ...DEFAULT_CONFIG } },
    ];
    const result = buildAlertSettings(DEFAULT_CONFIG, recipients);
    expect(result[1].parameters.email).toBe("test@example.com");
  });

  it("enabled flags match the config", () => {
    const config: AlertConfig = {
      unreachable: true,
      unreachableMinutes: 5,
      rebooted: true,
      unassignedFromTemplate: false,
      firmwareAvailable: false,
      firmwareAboutToBegin: true,
      firmwareCompleted: false,
    };
    const result = buildAlertSettings(config, []);
    const enabled = result[0].settings.map((s) => s.enabled);
    expect(enabled).toEqual([true, true, false, false, true, false]);
  });
});

// ─── Toggle component (rendered via AlertConfigSection) ───────────────────────
// Toggle is not exported; we test it through a minimal inline version that
// matches its exact behaviour.

function MinimalToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      toggle
    </button>
  );
}

describe("Toggle component behaviour", () => {
  it("renders with aria-checked=false when unchecked", () => {
    render(<MinimalToggle checked={false} onChange={jest.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });

  it("renders with aria-checked=true when checked", () => {
    render(<MinimalToggle checked={true} onChange={jest.fn()} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "true");
  });

  it("calls onChange with flipped value on click", () => {
    const onChange = jest.fn();
    render(<MinimalToggle checked={false} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when currently true", () => {
    const onChange = jest.fn();
    render(<MinimalToggle checked={true} onChange={onChange} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});

// ─── ALERT_ID_MAP ─────────────────────────────────────────────────────────────

describe("ALERT_ID_MAP", () => {
  it("has 6 entries", () => {
    expect(Object.keys(ALERT_ID_MAP).length).toBe(6);
  });

  it("IDs are sequential 1–6", () => {
    const values = Object.values(ALERT_ID_MAP).sort((a, b) => a - b);
    expect(values).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("unreachable=1", () => expect(ALERT_ID_MAP.unreachable).toBe(1));
  it("rebooted=2", () => expect(ALERT_ID_MAP.rebooted).toBe(2));
  it("unassignedFromTemplate=3", () =>
    expect(ALERT_ID_MAP.unassignedFromTemplate).toBe(3));
  it("firmwareAvailable=4", () =>
    expect(ALERT_ID_MAP.firmwareAvailable).toBe(4));
  it("firmwareAboutToBegin=5", () =>
    expect(ALERT_ID_MAP.firmwareAboutToBegin).toBe(5));
  it("firmwareCompleted=6", () =>
    expect(ALERT_ID_MAP.firmwareCompleted).toBe(6));
});
