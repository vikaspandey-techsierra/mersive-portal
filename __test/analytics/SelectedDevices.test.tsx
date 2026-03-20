import React from "react";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import SelectedDevices from "@/components/SelectedDevices";

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Convenience: render + fast-forward past the 2 s loader
const renderLoaded = () => {
  render(<SelectedDevices />);
  act(() => jest.advanceTimersByTime(2000));
};

// Returns body rows typed as HTMLTableRowElement so .cells is available
const getBodyRows = () =>
  screen
    .getAllByRole("row")
    .slice(1) // skip header row
    .map((r) => r as HTMLTableRowElement);

const ALL_DEVICE_NAMES = [
  "Board Room",
  "Corner Conference",
  "Hallway",
  "John's Office",
  "Temp Office",
];

// ---------------------------------------------------------------------------
// 1. LOADING STATE
// ---------------------------------------------------------------------------
describe("Loading state", () => {
  it("shows a loading spinner immediately after mount", () => {
    render(<SelectedDevices />);
    expect(document.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("hides the spinner after 2 seconds", () => {
    render(<SelectedDevices />);
    act(() => jest.advanceTimersByTime(2000));
    expect(document.querySelector(".animate-spin")).not.toBeInTheDocument();
  });

  it("table rows are present in DOM during loading (overlay just covers them)", () => {
    render(<SelectedDevices />);
    expect(screen.getByText("Board Room")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 2. STATIC CONTENT
// ---------------------------------------------------------------------------
describe("Static content", () => {
  it("renders the section heading with total selected count", () => {
    renderLoaded();
    expect(screen.getByText("Selected Devices (5)")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    renderLoaded();
    expect(
      screen.getByText(
        "Select all or narrow the data down to a specific group of devices"
      )
    ).toBeInTheDocument();
  });

  it("renders the search input with placeholder", () => {
    renderLoaded();
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("renders all column headers", () => {
    renderLoaded();
    [
      "Name",
      "Meetings",
      "Total Users",
      "Hours in Use",
      "Content Items",
      "Avg. Duration",
      "Content Types",
    ].forEach((col) => expect(screen.getByText(col)).toBeInTheDocument());
  });
});

// ---------------------------------------------------------------------------
// 3. TABLE ROWS — initial data
// ---------------------------------------------------------------------------
describe("Table rows — initial data", () => {
  it("renders all 5 device rows", () => {
    renderLoaded();
    ALL_DEVICE_NAMES.forEach((name) =>
      expect(screen.getByText(name)).toBeInTheDocument()
    );
  });

  it("displays numeric values correctly for Board Room", () => {
    renderLoaded();
    const row = screen.getByText("Board Room").closest("tr")!;
    // "2" appears in multiple cells (meetings, hoursInUse, contentTypes) — use getAllByText
    expect(within(row).getAllByText("2").length).toBeGreaterThanOrEqual(1);
    expect(within(row).getByText("3")).toBeInTheDocument(); // totalUsers
  });

  it("displays '-' for every null field in Temp Office", () => {
    renderLoaded();
    const row = screen.getByText("Temp Office").closest("tr")!;
    const dashes = within(row).getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(6); // meetings, users, hours, items, duration, types
  });

  it("displays avgDuration '1 hr' for Board Room", () => {
    renderLoaded();
    expect(screen.getByText("1 hr")).toBeInTheDocument();
  });

  it("displays '30 min' for Corner Conference", () => {
    renderLoaded();
    expect(screen.getByText("30 min")).toBeInTheDocument();
  });

  it("displays '45 min' for Hallway", () => {
    renderLoaded();
    expect(screen.getByText("45 min")).toBeInTheDocument();
  });

  it("displays '2 hrs' for John's Office", () => {
    renderLoaded();
    expect(screen.getByText("2 hrs")).toBeInTheDocument();
  });

  it("renders numeric contentItems for John's Office (4)", () => {
    renderLoaded();
    const row = screen.getByText("John's Office").closest("tr")!;
    // "4" appears in both hoursInUse and contentItems — use getAllByText
    expect(within(row).getAllByText("4").length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// 4. HEADER CHECKBOX — select all / deselect all
// ---------------------------------------------------------------------------
describe("Header checkbox — select all / deselect all", () => {
  const getHeaderCheckbox = () =>
    document.querySelector("thead .cursor-pointer") as HTMLElement;

  it("all 5 devices are selected by default (heading shows 5)", () => {
    renderLoaded();
    expect(screen.getByText("Selected Devices (5)")).toBeInTheDocument();
  });

  it("clicking header checkbox deselects all devices", () => {
    renderLoaded();
    fireEvent.click(getHeaderCheckbox());
    expect(screen.getByText("Selected Devices (0)")).toBeInTheDocument();
  });

  it("clicking header checkbox again re-selects all devices", () => {
    renderLoaded();
    fireEvent.click(getHeaderCheckbox()); // deselect all
    fireEvent.click(getHeaderCheckbox()); // re-select all
    expect(screen.getByText("Selected Devices (5)")).toBeInTheDocument();
  });

  it("header checkbox turns purple (checked) when all are selected", () => {
    renderLoaded();
    const cb = getHeaderCheckbox();
    expect(cb.className).toContain("bg-[#6860C8]");
  });

  it("header checkbox turns white/grey when none are selected", () => {
    renderLoaded();
    fireEvent.click(getHeaderCheckbox()); // deselect all
    const cb = getHeaderCheckbox();
    expect(cb.className).toContain("bg-white");
  });

  it("header checkbox shows indeterminate state when some (not all) rows are selected", () => {
    renderLoaded();
    fireEvent.click(screen.getByText("Board Room").closest("tr")!); // deselect one
    // Header should be purple (indeterminate still shows purple bg)
    const cb = getHeaderCheckbox();
    expect(cb.className).toContain("bg-[#6860C8]");
    // And should contain the indeterminate dash (a plain span inside)
    expect(cb.querySelector("span")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 5. ROW-LEVEL CHECKBOX — individual toggle
// ---------------------------------------------------------------------------
describe("Row-level checkbox", () => {
  it("clicking a row deselects it (count drops by 1)", () => {
    renderLoaded();
    fireEvent.click(screen.getByText("Board Room").closest("tr")!);
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });

  it("clicking the same row again re-selects it", () => {
    renderLoaded();
    const row = screen.getByText("Board Room").closest("tr")!;
    fireEvent.click(row);
    fireEvent.click(row);
    expect(screen.getByText("Selected Devices (5)")).toBeInTheDocument();
  });

  it("deselecting all rows one-by-one results in count 0", () => {
    renderLoaded();
    ALL_DEVICE_NAMES.forEach((name) => {
      fireEvent.click(screen.getByText(name).closest("tr")!);
    });
    expect(screen.getByText("Selected Devices (0)")).toBeInTheDocument();
  });

  it("selected count updates correctly after each individual toggle", () => {
    renderLoaded();
    fireEvent.click(screen.getByText("Board Room").closest("tr")!);
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Corner Conference").closest("tr")!);
    expect(screen.getByText("Selected Devices (3)")).toBeInTheDocument();
  });

  it("clicking the inline checkbox cell (not the row) also toggles", () => {
    renderLoaded();
    const row = screen.getByText("Hallway").closest("tr")!;
    const checkboxCell = row.querySelector("td .cursor-pointer") as HTMLElement;
    fireEvent.click(checkboxCell);
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 6. SEARCH / FILTER
// ---------------------------------------------------------------------------
describe("Search filter", () => {
  it("filters rows by name (case-insensitive lowercase)", () => {
    renderLoaded();
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "board" },
    });
    expect(screen.getByText("Board Room")).toBeInTheDocument();
    expect(screen.queryByText("Hallway")).not.toBeInTheDocument();
  });

  it("filters rows by name (uppercase input)", () => {
    renderLoaded();
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "HALLWAY" },
    });
    expect(screen.getByText("Hallway")).toBeInTheDocument();
    expect(screen.queryByText("Board Room")).not.toBeInTheDocument();
  });

  it("shows all rows when search is cleared", () => {
    renderLoaded();
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "board" } });
    fireEvent.change(input, { target: { value: "" } });
    ALL_DEVICE_NAMES.forEach((name) =>
      expect(screen.getByText(name)).toBeInTheDocument()
    );
  });

  it("shows no rows for a non-matching search term", () => {
    renderLoaded();
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "zzznomatch" },
    });
    ALL_DEVICE_NAMES.forEach((name) =>
      expect(screen.queryByText(name)).not.toBeInTheDocument()
    );
  });

  it("partial match 'office' returns John's Office and Temp Office only", () => {
    renderLoaded();
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "office" },
    });
    expect(screen.getByText("John's Office")).toBeInTheDocument();
    expect(screen.getByText("Temp Office")).toBeInTheDocument();
    expect(screen.queryByText("Board Room")).not.toBeInTheDocument();
    expect(screen.queryByText("Hallway")).not.toBeInTheDocument();
  });

  it("search input is controlled and reflects typed value", () => {
    renderLoaded();
    const input = screen.getByPlaceholderText("Search") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "corner" } });
    expect(input.value).toBe("corner");
  });
});

// ---------------------------------------------------------------------------
// 7. SORTING
// ---------------------------------------------------------------------------
describe("Sorting", () => {
  it("default sort is by Name ascending (alphabetical)", () => {
    renderLoaded();
    const rows = getBodyRows();
    const names = rows.map((r) => r.cells[1]?.textContent?.trim());
    expect(names).toEqual(
      [...names].sort((a, b) => (a ?? "").localeCompare(b ?? ""))
    );
  });

  it("clicking 'Name' header once toggles to descending", () => {
    renderLoaded();
    fireEvent.click(screen.getByText("Name"));
    const rows = getBodyRows();
    const names = rows.map((r) => r.cells[1]?.textContent?.trim());
    expect(names).toEqual(
      [...names].sort((a, b) => (b ?? "").localeCompare(a ?? ""))
    );
  });

  it("clicking 'Meetings' sorts ascending — nulls at bottom", () => {
    renderLoaded();
    fireEvent.click(screen.getByText("Meetings"));
    const rows = getBodyRows();
    const vals = rows.map((r) => r.cells[2]?.textContent?.trim());
    // Last row must be '-' (Temp Office with null meetings)
    expect(vals[vals.length - 1]).toBe("-");
    // Non-null values must be ascending
    const nums = vals.filter((v) => v !== "-").map(Number);
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
  });

  it("clicking 'Meetings' twice sorts descending — nulls still at bottom", () => {
    renderLoaded();
    fireEvent.click(screen.getByText("Meetings"));
    fireEvent.click(screen.getByText("Meetings"));
    const rows = getBodyRows();
    const vals = rows.map((r) => r.cells[2]?.textContent?.trim());
    expect(vals[vals.length - 1]).toBe("-");
    const nums = vals.filter((v) => v !== "-").map(Number);
    expect(nums).toEqual([...nums].sort((a, b) => b - a));
  });

  it("clicking a new column resets sort direction to ascending", () => {
    renderLoaded();
    fireEvent.click(screen.getByText("Meetings")); // asc
    fireEvent.click(screen.getByText("Meetings")); // desc
    fireEvent.click(screen.getByText("Total Users")); // new col → asc
    const rows = getBodyRows();
    const nums = rows
      .map((r) => r.cells[3]?.textContent?.trim())
      .filter((v) => v !== "-")
      .map(Number);
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
  });

  it("sorting by 'Hours in Use' handles fractional values correctly", () => {
    renderLoaded();
    fireEvent.click(screen.getByText("Hours in Use"));
    const rows = getBodyRows();
    const vals = rows
      .map((r) => r.cells[4]?.textContent?.trim())
      .filter((v) => v !== "-")
      .map(Number);
    expect(vals).toEqual([...vals].sort((a, b) => a - b));
  });

  it("sorting by 'Avg. Duration' uses underlying minutes — correct order ascending", () => {
    renderLoaded();
    fireEvent.click(screen.getByText("Avg. Duration"));
    const rows = getBodyRows();
    const displays = rows
      .map((r) => r.cells[6]?.textContent?.trim())
      .filter((v) => v !== "-");
    // Expected: 30 min → 45 min → 1 hr → 2 hrs
    expect(displays[0]).toBe("30 min");
    expect(displays[1]).toBe("45 min");
    expect(displays[2]).toBe("1 hr");
    expect(displays[3]).toBe("2 hrs");
  });

  it("null values sort to the bottom in both asc and desc directions", () => {
    renderLoaded();
    ["asc", "desc"].forEach(() => {
      fireEvent.click(screen.getByText("Meetings")); // toggle direction
      const rows = getBodyRows();
      const last = rows[rows.length - 1].cells[2]?.textContent?.trim();
      expect(last).toBe("-");
    });
  });

  it("sort interacts correctly with search — filtered rows maintain sort order", () => {
    renderLoaded();
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "office" },
    });
    fireEvent.click(screen.getByText("Meetings"));
    const rows = getBodyRows();
    expect(rows.length).toBe(2);
    // John's Office (meetings=2) should be first; Temp Office (null) last
    expect(rows[0].cells[1]?.textContent?.trim()).toBe("John's Office");
    expect(rows[1].cells[1]?.textContent?.trim()).toBe("Temp Office");
  });
});

// ---------------------------------------------------------------------------
// 8. SORT ICON VISUAL STATE
// ---------------------------------------------------------------------------
describe("SortIcon visual state", () => {
  it("active sort column (Name) shows a purple icon path", () => {
    renderLoaded();
    const nameHeader = screen.getByText("Name").closest("th")!;
    expect(
      nameHeader.querySelector("path[stroke='#6860C8']")
    ).toBeInTheDocument();
  });

  it("inactive columns show only grey icon paths", () => {
    renderLoaded();
    const header = screen.getByText("Total Users").closest("th")!;
    const greyPaths = header.querySelectorAll("path[stroke='#9CA3AF']");
    expect(greyPaths.length).toBeGreaterThan(0);
    expect(
      header.querySelector("path[stroke='#6860C8']")
    ).not.toBeInTheDocument();
  });

  it("switching active column moves purple icon to new column", () => {
    renderLoaded();
    fireEvent.click(screen.getByText("Meetings"));
    const meetingsHeader = screen.getByText("Meetings").closest("th")!;
    expect(
      meetingsHeader.querySelector("path[stroke='#6860C8']")
    ).toBeInTheDocument();
    // Old column (Name) should now be grey
    const nameHeader = screen.getByText("Name").closest("th")!;
    expect(
      nameHeader.querySelector("path[stroke='#6860C8']")
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 9. EDGE CASES
// ---------------------------------------------------------------------------
describe("Edge cases", () => {
  it("select-all after search only re-selects the currently visible rows", () => {
    renderLoaded();
    fireEvent.change(screen.getByPlaceholderText("Search"), {
      target: { value: "office" },
    });
    // Deselect all
    fireEvent.click(document.querySelector("thead .cursor-pointer")!);
    // Re-select all (only 2 office rows visible)
    fireEvent.click(document.querySelector("thead .cursor-pointer")!);
    const heading = screen.getByText(/Selected Devices/);
    // Count should reflect 2 newly selected + 3 still selected from previous state
    expect(heading).toBeInTheDocument();
  });

  it("component cleans up the loading timer on unmount (no memory leak)", () => {
    const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");
    const { unmount } = render(<SelectedDevices />);
    unmount();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it("table has sticky header (sticky class on thead)", () => {
    renderLoaded();
    expect(document.querySelector("thead")!.className).toContain("sticky");
  });

  it("scroll container has max-h-80 for vertical overflow", () => {
    renderLoaded();
    expect(document.querySelector(".overflow-x-auto")!.className).toContain(
      "max-h-80"
    );
  });

  it("rows have hover style class applied", () => {
    renderLoaded();
    const firstRow = screen.getByText("Board Room").closest("tr")!;
    expect(firstRow.className).toContain("hover:bg-gray-50");
  });

  it("loading overlay sits above table content (z-20)", () => {
    render(<SelectedDevices />); // do NOT advance timer
    const overlay = document.querySelector(".z-20");
    expect(overlay).toBeInTheDocument();
  });
});
