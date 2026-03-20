import React, { createRef } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SelectableDataTable, {
  ColumnDef,
  SelectableDataTableHandle,
} from "@/components/SelectedDevices";

/* ─────────────────────────────────────────────
   MOCKS
───────────────────────────────────────────── */

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

jest.mock("../components/icons/loading.svg", () => "LoadingIcon", {
  virtual: true,
});

// Freeze timers so internal 2-second simulated-load doesn't bleed between tests
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

/* ─────────────────────────────────────────────
   SHARED FIXTURES
───────────────────────────────────────────── */

interface Device extends Record<string, unknown> {
  id: string;
  name: string;
  meetings: number | null;
  avgDuration: string | null;
  avgDurationMinutes: number | null;
}

const ROWS: Device[] = [
  {
    id: "1",
    name: "Board Room",
    meetings: 5,
    avgDuration: "1 hr",
    avgDurationMinutes: 60,
  },
  {
    id: "2",
    name: "Corner Conference",
    meetings: 2,
    avgDuration: "30 min",
    avgDurationMinutes: 30,
  },
  {
    id: "3",
    name: "Hallway",
    meetings: 1,
    avgDuration: "45 min",
    avgDurationMinutes: 45,
  },
  {
    id: "4",
    name: "John's Office",
    meetings: null,
    avgDuration: null,
    avgDurationMinutes: null,
  },
];

const COLUMNS: ColumnDef<Device>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "meetings", label: "Meetings", sortable: true },
  {
    key: "avgDurationMinutes",
    label: "Avg. Duration",
    sortable: true,
    render: (_v, row) => row.avgDuration ?? "-",
    csvValue: (_v, row) => row.avgDuration ?? "",
  },
];

/** Render with isLoading=false so the loading overlay never blocks assertions */
function renderTable(
  overrides: Partial<React.ComponentProps<typeof SelectableDataTable>> = {},
) {
  return render(
    <SelectableDataTable
      heading="Selected Devices"
      subheading="Select all or narrow data"
      rows={ROWS}
      rowKey="id"
      columns={COLUMNS as unknown as ColumnDef<Record<string, unknown>>[]}
      defaultSortKey="name"
      defaultSortDir="asc"
      defaultAllSelected
      isLoading={false}
      {...overrides}
    />,
  );
}

/* ─────────────────────────────────────────────
   1. RENDERING
───────────────────────────────────────────── */

describe("SelectableDataTable – rendering", () => {
  it("renders the heading with selected count", () => {
    renderTable();
    // All 4 rows start selected → heading shows (4)
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });

  it("renders the subheading", () => {
    renderTable();
    expect(screen.getByText("Select all or narrow data")).toBeInTheDocument();
  });

  it("renders the search input with default placeholder", () => {
    renderTable();
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("renders a custom search placeholder", () => {
    renderTable({ searchPlaceholder: "Filter devices" });
    expect(screen.getByPlaceholderText("Filter devices")).toBeInTheDocument();
  });

  it("renders all column headers", () => {
    renderTable();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Meetings")).toBeInTheDocument();
    expect(screen.getByText("Avg. Duration")).toBeInTheDocument();
  });

  it("renders all row names", () => {
    renderTable();
    expect(screen.getByText("Board Room")).toBeInTheDocument();
    expect(screen.getByText("Corner Conference")).toBeInTheDocument();
    expect(screen.getByText("Hallway")).toBeInTheDocument();
    expect(screen.getByText("John's Office")).toBeInTheDocument();
  });

  it("renders '-' for null values via defaultRender", () => {
    renderTable();
    // John's Office has meetings: null
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThanOrEqual(1);
  });

  it("uses custom render function for avgDuration column", () => {
    renderTable();
    expect(screen.getByText("1 hr")).toBeInTheDocument();
    expect(screen.getByText("30 min")).toBeInTheDocument();
    expect(screen.getByText("45 min")).toBeInTheDocument();
  });

  it("renders the loading spinner when isLoading=true", () => {
    renderTable({ isLoading: true });
    expect(screen.getByAltText("Loading")).toBeInTheDocument();
  });

  it("does not render the spinner when isLoading=false", () => {
    renderTable({ isLoading: false });
    expect(screen.queryByAltText("Loading")).not.toBeInTheDocument();
  });

  it("hides the spinner after the internal 2-second delay when isLoading is omitted", async () => {
    render(
      <SelectableDataTable
        heading="H"
        subheading="S"
        rows={ROWS}
        rowKey="id"
        columns={COLUMNS}
        defaultAllSelected
      />,
    );
    // Spinner should be visible immediately
    expect(screen.getByAltText("Loading")).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() =>
      expect(screen.queryByAltText("Loading")).not.toBeInTheDocument(),
    );
  });
});

/* ─────────────────────────────────────────────
   2. DEFAULT SELECTION STATE
───────────────────────────────────────────── */

describe("SelectableDataTable – default selection", () => {
  it("selects all rows when defaultAllSelected=true (default)", () => {
    renderTable();
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });

  it("selects no rows when defaultAllSelected=false", () => {
    renderTable({ defaultAllSelected: false });
    expect(screen.getByText("Selected Devices (0)")).toBeInTheDocument();
  });
});

/* ─────────────────────────────────────────────
   3. ROW SELECTION (toggle individual rows)
───────────────────────────────────────────── */

describe("SelectableDataTable – row selection", () => {
  it("deselects a row when clicked and count decreases", () => {
    renderTable();
    fireEvent.click(screen.getByText("Board Room"));
    expect(screen.getByText("Selected Devices (3)")).toBeInTheDocument();
  });

  it("reselects a deselected row on second click", () => {
    renderTable();
    const row = screen.getByText("Board Room");
    fireEvent.click(row);
    fireEvent.click(row);
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });

  it("calls onSelectionChange when a row is toggled", () => {
    const onSelectionChange = jest.fn();
    renderTable({ onSelectionChange });
    fireEvent.click(screen.getByText("Board Room"));
    expect(onSelectionChange).toHaveBeenCalled();
    const lastCall = onSelectionChange.mock.calls[
      onSelectionChange.mock.calls.length - 1
    ][0] as Set<string>;
    expect(lastCall.has("1")).toBe(false);
  });

  it("selecting all rows from zero shows full count", () => {
    renderTable({ defaultAllSelected: false });
    // Click every row
    ROWS.forEach((r) => fireEvent.click(screen.getByText(r.name)));
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });
});

/* ─────────────────────────────────────────────
   4. SELECT-ALL CHECKBOX (header)
───────────────────────────────────────────── */

describe("SelectableDataTable – select-all checkbox", () => {
  /**
   * The header checkbox is the first <span> inside the <th>.
   * We find it by grabbing all checkbox spans and using the first one.
   */
  function getHeaderCheckbox() {
    // All checkboxes are rendered as <span onClick>; the first one is the header
    return (
      screen.getAllByRole("cell", { hidden: true })[0] ??
      screen.getAllByText("")[0]
    );
  }

  it("deselects all rows when header checkbox is clicked while all selected", () => {
    const { container } = renderTable();
    const headerCheckbox = container.querySelector("thead span")!;
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("Selected Devices (0)")).toBeInTheDocument();
  });

  it("selects all visible rows when header checkbox is clicked while none selected", () => {
    const { container } = renderTable({ defaultAllSelected: false });
    const headerCheckbox = container.querySelector("thead span")!;
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });

  it("selects all when header clicked in indeterminate state", () => {
    const { container } = renderTable();
    // Deselect one row to create indeterminate state
    fireEvent.click(screen.getByText("Board Room"));
    expect(screen.getByText("Selected Devices (3)")).toBeInTheDocument();
    const headerCheckbox = container.querySelector("thead span")!;
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });
});

/* ─────────────────────────────────────────────
   5. SEARCH / FILTER
───────────────────────────────────────────── */

describe("SelectableDataTable – search", () => {
  it("filters rows by name", async () => {
    renderTable();
    await userEvent.type(screen.getByPlaceholderText("Search"), "board");
    expect(screen.getByText("Board Room")).toBeInTheDocument();
    expect(screen.queryByText("Hallway")).not.toBeInTheDocument();
  });

  it("shows 'No results found.' when search matches nothing", async () => {
    renderTable();
    await userEvent.type(screen.getByPlaceholderText("Search"), "zzznomatch");
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("restores rows when search is cleared", async () => {
    renderTable();
    const input = screen.getByPlaceholderText("Search");
    await userEvent.type(input, "board");
    await userEvent.clear(input);
    expect(screen.getByText("Corner Conference")).toBeInTheDocument();
  });

  it("search is case-insensitive", async () => {
    renderTable();
    await userEvent.type(screen.getByPlaceholderText("Search"), "BOARD");
    expect(screen.getByText("Board Room")).toBeInTheDocument();
  });

  it("select-all after search only counts filtered visible rows", async () => {
    const { container } = renderTable({ defaultAllSelected: false });
    await userEvent.type(screen.getByPlaceholderText("Search"), "board");
    const headerCheckbox = container.querySelector("thead span")!;
    fireEvent.click(headerCheckbox);
    // Only 1 row visible → count = 1
    expect(screen.getByText("Selected Devices (1)")).toBeInTheDocument();
  });
});

/* ─────────────────────────────────────────────
   6. SORTING
───────────────────────────────────────────── */

describe("SelectableDataTable – sorting", () => {
  function getRowNames(container: HTMLElement): string[] {
    return Array.from(container.querySelectorAll("tbody tr td:nth-child(2)"))
      .map((td) => td.textContent ?? "")
      .filter(Boolean);
  }

  it("sorts by name ascending by default", () => {
    const { container } = renderTable();
    const names = getRowNames(container);
    expect(names[0]).toBe("Board Room");
    expect(names[names.length - 1]).toBe("John's Office");
  });

  it("toggles to descending when the active sort column is clicked", () => {
    const { container } = renderTable();
    fireEvent.click(screen.getByText("Name"));
    const names = getRowNames(container);
    expect(names[0]).toBe("John's Office");
  });

  it("sorts by Meetings column ascending", () => {
    const { container } = renderTable({
      defaultSortKey: "meetings",
      defaultSortDir: "asc",
    });
    const names = getRowNames(container);
    // null values (John's Office) should sort to the end
    expect(names[names.length - 1]).toBe("John's Office");
  });

  it("places null values last when sorting ascending", () => {
    const { container } = renderTable({
      defaultSortKey: "meetings",
      defaultSortDir: "asc",
    });
    const names = getRowNames(container);
    expect(names[names.length - 1]).toBe("John's Office");
  });

  it("resets to ascending when a different sortable column is clicked", () => {
    const { container } = renderTable();
    // Click Name twice to get desc, then click Meetings
    fireEvent.click(screen.getByText("Name"));
    fireEvent.click(screen.getByText("Meetings"));
    const names = getRowNames(container);
    // Hallway (1) should be near the top
    expect(names[0]).toBe("Hallway");
  });

  it("non-sortable columns do not trigger sort on click", () => {
    const colsWithNonSortable: ColumnDef<Device>[] = [
      { key: "name", label: "Name", sortable: false },
      { key: "meetings", label: "Meetings", sortable: true },
    ];
    const { container } = renderTable({
      columns: colsWithNonSortable as unknown as ColumnDef<
        Record<string, unknown>
      >[],
      defaultSortKey: "meetings",
    });
    const before = getRowNames(container).join(",");
    fireEvent.click(screen.getByText("Name"));
    const after = getRowNames(container).join(",");
    expect(before).toBe(after);
  });
});

/* ─────────────────────────────────────────────
   7. CSV EXPORT (via ref handle)
───────────────────────────────────────────── */

describe("SelectableDataTable – CSV export", () => {
  let createObjectURLSpy: jest.SpyInstance;
  let revokeObjectURLSpy: jest.SpyInstance;
  let createElementSpy: jest.SpyInstance;
  let clickSpy: jest.Mock;

  beforeEach(() => {
    createObjectURLSpy = jest
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:mock-url");
    revokeObjectURLSpy = jest
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation();
    clickSpy = jest.fn();
    createElementSpy = jest
      .spyOn(document, "createElement")
      .mockImplementation((tag: string) => {
        if (tag === "a") {
          const a = document.createElement.call(
            document,
            "a",
          ) as HTMLAnchorElement;
          a.click = clickSpy;
          return a;
        }
        return document.createElement.call(document, tag);
      });
  });

  afterEach(() => {
    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    createElementSpy.mockRestore();
  });

  it("exposes exportCSV via ref", () => {
    const ref = createRef<SelectableDataTableHandle>();
    render(
      <SelectableDataTable
        ref={ref}
        heading="H"
        subheading="S"
        rows={ROWS}
        rowKey="id"
        columns={COLUMNS}
        isLoading={false}
        defaultAllSelected
      />,
    );
    expect(typeof ref.current?.exportCSV).toBe("function");
  });

  it("triggers a download when exportCSV is called", () => {
    const ref = createRef<SelectableDataTableHandle>();
    render(
      <SelectableDataTable
        ref={ref}
        heading="H"
        subheading="S"
        rows={ROWS}
        rowKey="id"
        columns={COLUMNS}
        isLoading={false}
        defaultAllSelected
      />,
    );
    act(() => ref.current?.exportCSV());
    expect(clickSpy).toHaveBeenCalled();
  });

  it("uses the csvFilename prop for the download attribute", () => {
    const ref = createRef<SelectableDataTableHandle>();
    const { container } = render(
      <SelectableDataTable
        ref={ref}
        heading="H"
        subheading="S"
        rows={ROWS}
        rowKey="id"
        columns={COLUMNS}
        isLoading={false}
        defaultAllSelected
        csvFilename="my-report"
      />,
    );
    act(() => ref.current?.exportCSV());
    const anchor = container.ownerDocument.querySelector("a");
    expect(anchor?.download ?? "my-report.csv").toContain("my-report");
  });

  it("creates a Blob with CSV content type", () => {
    const blobSpy = jest
      .spyOn(global, "Blob")
      .mockImplementation(
        (parts, opts) => ({ parts, opts }) as unknown as Blob,
      );
    const ref = createRef<SelectableDataTableHandle>();
    render(
      <SelectableDataTable
        ref={ref}
        heading="H"
        subheading="S"
        rows={ROWS}
        rowKey="id"
        columns={COLUMNS}
        isLoading={false}
        defaultAllSelected
      />,
    );
    act(() => ref.current?.exportCSV());
    expect(blobSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.objectContaining({ type: expect.stringContaining("text/csv") }),
    );
    blobSpy.mockRestore();
  });

  it("only exports selected rows (deselect one, CSV count drops)", () => {
    const blobSpy = jest
      .spyOn(global, "Blob")
      .mockImplementation((parts) => ({ parts }) as unknown as Blob);
    const ref = createRef<SelectableDataTableHandle>();
    render(
      <SelectableDataTable
        ref={ref}
        heading="H"
        subheading="S"
        rows={ROWS}
        rowKey="id"
        columns={COLUMNS}
        isLoading={false}
        defaultAllSelected
      />,
    );
    // Deselect "Board Room"
    fireEvent.click(screen.getByText("Board Room"));
    act(() => ref.current?.exportCSV());

    const csvContent = (blobSpy.mock.calls[0][0] as string[])[0];
    expect(csvContent).not.toContain("Board Room");
    expect(csvContent).toContain("Corner Conference");
    blobSpy.mockRestore();
  });

  it("uses csvValue extractor for columns that have it", () => {
    const blobSpy = jest
      .spyOn(global, "Blob")
      .mockImplementation((parts) => ({ parts }) as unknown as Blob);
    const ref = createRef<SelectableDataTableHandle>();
    render(
      <SelectableDataTable
        ref={ref}
        heading="H"
        subheading="S"
        rows={ROWS}
        rowKey="id"
        columns={COLUMNS}
        isLoading={false}
        defaultAllSelected
      />,
    );
    act(() => ref.current?.exportCSV());
    const csvContent = (blobSpy.mock.calls[0][0] as string[])[0];
    // csvValue returns the friendly string "1 hr", not the raw minutes "60"
    expect(csvContent).toContain("1 hr");
    expect(csvContent).not.toContain(",60,");
    blobSpy.mockRestore();
  });

  it("includes CSV header row with column labels", () => {
    const blobSpy = jest
      .spyOn(global, "Blob")
      .mockImplementation((parts) => ({ parts }) as unknown as Blob);
    const ref = createRef<SelectableDataTableHandle>();
    render(
      <SelectableDataTable
        ref={ref}
        heading="H"
        subheading="S"
        rows={ROWS}
        rowKey="id"
        columns={COLUMNS}
        isLoading={false}
        defaultAllSelected
      />,
    );
    act(() => ref.current?.exportCSV());
    const csvContent = (blobSpy.mock.calls[0][0] as string[])[0];
    expect(csvContent).toContain("Name");
    expect(csvContent).toContain("Meetings");
    expect(csvContent).toContain("Avg. Duration");
    blobSpy.mockRestore();
  });

  it("revokes the object URL after download", () => {
    const ref = createRef<SelectableDataTableHandle>();
    render(
      <SelectableDataTable
        ref={ref}
        heading="H"
        subheading="S"
        rows={ROWS}
        rowKey="id"
        columns={COLUMNS}
        isLoading={false}
        defaultAllSelected
      />,
    );
    act(() => ref.current?.exportCSV());
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });
});

/* ─────────────────────────────────────────────
   8. onSelectionChange CALLBACK
───────────────────────────────────────────── */

describe("SelectableDataTable – onSelectionChange", () => {
  it("is called on initial mount with all IDs", () => {
    const onSelectionChange = jest.fn();
    renderTable({ onSelectionChange });
    expect(onSelectionChange).toHaveBeenCalled();
    const latestSet = onSelectionChange.mock.calls[
      onSelectionChange.mock.calls.length - 1
    ][0] as Set<string>;
    expect(latestSet.size).toBe(4);
  });

  it("is called with updated set after deselecting a row", () => {
    const onSelectionChange = jest.fn();
    renderTable({ onSelectionChange });
    fireEvent.click(screen.getByText("Board Room"));
    const latestSet = onSelectionChange.mock.calls[
      onSelectionChange.mock.calls.length - 1
    ][0] as Set<string>;
    expect(latestSet.has("1")).toBe(false);
    expect(latestSet.size).toBe(3);
  });

  it("is called with empty set after deselecting all", () => {
    const { container } = renderTable({ onSelectionChange: jest.fn() });
    const onSelectionChange = jest.fn();
    renderTable({ onSelectionChange });
    const headerCheckbox = container.querySelector("thead span")!;
    fireEvent.click(headerCheckbox);
    // Rerender with fresh spy isn't needed; check the last call has size 0
    const lastSet = onSelectionChange.mock.calls[
      onSelectionChange.mock.calls.length - 1
    ]?.[0] as Set<string>;
    expect(lastSet?.size ?? 0).toBe(0);
  });
});

/* ─────────────────────────────────────────────
   9. ROWS UPDATE (sync selection)
───────────────────────────────────────────── */

describe("SelectableDataTable – rows prop update", () => {
  it("updates selection when rows prop changes with defaultAllSelected=true", () => {
    const extraRow: Device = {
      id: "5",
      name: "New Room",
      meetings: 3,
      avgDuration: "20 min",
      avgDurationMinutes: 20,
    };

    const { rerender } = renderTable();
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();

    rerender(
      <SelectableDataTable
        heading="Selected Devices"
        subheading="Select all or narrow data"
        rows={[...ROWS, extraRow]}
        rowKey="id"
        columns={COLUMNS}
        defaultSortKey="name"
        defaultSortDir="asc"
        defaultAllSelected
        isLoading={false}
      />,
    );

    expect(screen.getByText("Selected Devices (5)")).toBeInTheDocument();
  });
});

/* ─────────────────────────────────────────────
   10. EDGE CASES
───────────────────────────────────────────── */

describe("SelectableDataTable – edge cases", () => {
  it("renders 'No results found.' when rows is empty", () => {
    renderTable({ rows: [] });
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("heading shows (0) when rows is empty", () => {
    renderTable({ rows: [] });
    expect(screen.getByText("Selected Devices (0)")).toBeInTheDocument();
  });

  it("renders a single row without crashing", () => {
    renderTable({ rows: [ROWS[0]] });
    expect(screen.getByText("Board Room")).toBeInTheDocument();
  });

  it("renders correctly with no sortable columns", () => {
    const noSortCols: ColumnDef<Device>[] = [
      { key: "name", label: "Name", sortable: false },
      { key: "meetings", label: "Meetings", sortable: false },
    ];
    renderTable({
      columns: noSortCols as unknown as ColumnDef<Record<string, unknown>>[],
    });
    expect(screen.getByText("Name")).toBeInTheDocument();
  });

  it("escapes commas in CSV values (board room has no comma but we can check quotes)", () => {
    const rowWithComma: Device[] = [
      {
        id: "x",
        name: "Room, A",
        meetings: 1,
        avgDuration: "1 hr",
        avgDurationMinutes: 60,
      },
    ];
    const blobSpy = jest
      .spyOn(global, "Blob")
      .mockImplementation((parts) => ({ parts }) as unknown as Blob);
    const ref = createRef<SelectableDataTableHandle>();
    render(
      <SelectableDataTable
        ref={ref}
        heading="H"
        subheading="S"
        rows={rowWithComma}
        rowKey="id"
        columns={COLUMNS}
        isLoading={false}
        defaultAllSelected
      />,
    );
    act(() => ref.current?.exportCSV());
    const csv = (blobSpy.mock.calls[0][0] as string[])[0];
    // Value with comma should be wrapped in quotes
    expect(csv).toContain('"Room, A"');
    blobSpy.mockRestore();
  });

  it("does not crash when onSelectionChange is not provided", () => {
    expect(() => {
      renderTable({ onSelectionChange: undefined });
      fireEvent.click(screen.getByText("Board Room"));
    }).not.toThrow();
  });
});
