import React, { createRef } from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import SelectableDataTable from "@/components/SelectedDevices";
import type {
  ColumnDef,
  SelectableDataTableHandle,
} from "@/components/SelectedDevices";

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

// Mock EmptyState
jest.mock("@/components/emptyStates/emptyStates", () => ({
  __esModule: true,
  default: ({ title, description }: { title: string; description: string }) => (
    <div data-testid="empty-state">
      <div className="text-[24px] font-medium text-[#090814] my-8">{title}</div>
      <div className="text-[13px] text-[#93949C] max-w-80 leading-snug">
        {description}
      </div>
    </div>
  ),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = jest.fn();
const mockRevokeObjectURL = jest.fn();

// Mock Blob
const mockBlob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
}));

// Save original references
const originalBlob = global.Blob;
const originalCreateObjectURL = global.URL.createObjectURL;
const originalRevokeObjectURL = global.URL.revokeObjectURL;

beforeEach(() => {
  jest.useFakeTimers();
  global.Blob = mockBlob as any;
  global.URL.createObjectURL = mockCreateObjectURL;
  global.URL.revokeObjectURL = mockRevokeObjectURL;
  mockCreateObjectURL.mockReturnValue("blob:mock-url");
  mockRevokeObjectURL.mockClear();
  mockBlob.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
  global.Blob = originalBlob;
  global.URL.createObjectURL = originalCreateObjectURL;
  global.URL.revokeObjectURL = originalRevokeObjectURL;
});

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
    render: (_v: unknown, row: Device) => row.avgDuration ?? "-",
    csvValue: (_v: unknown, row: Device) => row.avgDuration ?? "",
  },
];

/** Render with isLoading=false so the loading overlay never blocks assertions */
function renderTable(
  overrides: Partial<React.ComponentProps<typeof SelectableDataTable>> = {}
) {
  const orgId = overrides.orgId || "test-org-123";
  return render(
    <SelectableDataTable
      orgId={orgId}
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
    />
  );
}

describe("SelectableDataTable – rendering", () => {
  it("renders the heading with selected count", () => {
    renderTable();
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
        orgId="test-org-123"
        heading="H"
        subheading="S"
        rows={ROWS}
        rowKey="id"
        columns={COLUMNS}
        defaultAllSelected
      />
    );
    expect(screen.getByAltText("Loading")).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(2000));
    await waitFor(() =>
      expect(screen.queryByAltText("Loading")).not.toBeInTheDocument()
    );
  });
});

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
    ROWS.forEach((r) => fireEvent.click(screen.getByText(r.name)));
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });
});

describe("SelectableDataTable – select-all checkbox", () => {
  function getHeaderCheckbox(container: HTMLElement) {
    return container.querySelector("thead span")!;
  }

  it("deselects all rows when header checkbox is clicked while all selected", () => {
    const { container } = renderTable();
    const headerCheckbox = getHeaderCheckbox(container);
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("Selected Devices (0)")).toBeInTheDocument();
  });

  it("selects all visible rows when header checkbox is clicked while none selected", () => {
    const { container } = renderTable({ defaultAllSelected: false });
    const headerCheckbox = getHeaderCheckbox(container);
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });

  it("selects all when header clicked in indeterminate state", () => {
    const { container } = renderTable();
    fireEvent.click(screen.getByText("Board Room"));
    expect(screen.getByText("Selected Devices (3)")).toBeInTheDocument();
    const headerCheckbox = getHeaderCheckbox(container);
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("Selected Devices (4)")).toBeInTheDocument();
  });
});

describe("SelectableDataTable – search", () => {
  it("filters rows by name", () => {
    renderTable();
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "board" } });
    expect(screen.getByText("Board Room")).toBeInTheDocument();
    expect(screen.queryByText("Hallway")).not.toBeInTheDocument();
  });

  it("shows empty state when search matches nothing", () => {
    renderTable();
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "zzznomatch" } });
    // The component renders EmptyState with title "No results found"
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("restores rows when search is cleared", () => {
    renderTable();
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "board" } });
    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByText("Corner Conference")).toBeInTheDocument();
  });

  it("search is case-insensitive", () => {
    renderTable();
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "BOARD" } });
    expect(screen.getByText("Board Room")).toBeInTheDocument();
  });

  it("select-all after search only counts filtered visible rows", () => {
    const { container } = renderTable({ defaultAllSelected: false });
    const input = screen.getByPlaceholderText("Search");
    fireEvent.change(input, { target: { value: "board" } });
    const headerCheckbox = container.querySelector("thead span")!;
    fireEvent.click(headerCheckbox);
    expect(screen.getByText("Selected Devices (1)")).toBeInTheDocument();
  });
});

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
    fireEvent.click(screen.getByText("Name"));
    fireEvent.click(screen.getByText("Name"));
    fireEvent.click(screen.getByText("Meetings"));
    const names = getRowNames(container);
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
    const onSelectionChange = jest.fn();
    const { container } = renderTable({ onSelectionChange });
    const headerCheckbox = container.querySelector("thead span")!;
    fireEvent.click(headerCheckbox);
    const lastSet = onSelectionChange.mock.calls[
      onSelectionChange.mock.calls.length - 1
    ]?.[0] as Set<string>;
    expect(lastSet?.size ?? 0).toBe(0);
  });
});

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
        orgId="test-org-123"
        heading="Selected Devices"
        subheading="Select all or narrow data"
        rows={[...ROWS, extraRow]}
        rowKey="id"
        columns={COLUMNS}
        defaultSortKey="name"
        defaultSortDir="asc"
        defaultAllSelected
        isLoading={false}
      />
    );

    expect(screen.getByText("Selected Devices (5)")).toBeInTheDocument();
  });
});

describe("SelectableDataTable – edge cases", () => {
  it("shows empty state when rows is empty", () => {
    renderTable({ rows: [] });
    expect(screen.getByText("No results found")).toBeInTheDocument();
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

  it("escapes commas in CSV values", () => {
    const rowWithComma: Device[] = [
      {
        id: "x",
        name: "Room, A",
        meetings: 1,
        avgDuration: "1 hr",
        avgDurationMinutes: 60,
      },
    ];
    const ref = createRef<SelectableDataTableHandle>();
    render(
      <SelectableDataTable
        ref={ref}
        orgId="test-org-123"
        heading="H"
        subheading="S"
        rows={rowWithComma}
        rowKey="id"
        columns={COLUMNS}
        isLoading={false}
        defaultAllSelected
      />
    );
    act(() => ref.current?.exportCSV());
    const csv = (mockBlob.mock.calls[0][0] as string[])[0];
    expect(csv).toContain('"Room, A"');
  });

  it("does not crash when onSelectionChange is not provided", () => {
    expect(() => {
      renderTable({ onSelectionChange: undefined });
      fireEvent.click(screen.getByText("Board Room"));
    }).not.toThrow();
  });
});
