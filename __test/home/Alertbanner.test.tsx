import React from "react";
import { render, screen } from "@testing-library/react";
import AlertBanner from "@/components/home/AlertBanner";

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Mock SVG imports
jest.mock("@/components/icons/tv_off.svg", () => "TvOffIcon");
jest.mock("@/components/icons/event_busy.svg", () => "CalendarIcon");
jest.mock("@/components/icons/outdated_firmware.svg", () => "DownloadIcon");
jest.mock("@/components/icons/warning.svg", () => "AlertTriangleIcon");
jest.mock("@/components/icons/error.svg", () => "ErrorIcon");

// Mock AlertChip
jest.mock("@/components/home/AlertChip", () => ({
  __esModule: true,
  default: ({
    label,
    value,
  }: {
    icon: unknown;
    label: string;
    value: number;
  }) => (
    <div data-testid="alert-chip">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
}));

const mockAlert = {
  offlineDevices: 3,
  expiredOrExpiringSoon: 5,
  outdatedFirmware: 2,
  otherIssues: 1,
};

describe("AlertBanner", () => {
  it("renders the admin attention title", () => {
    render(<AlertBanner alert={mockAlert} />);
    expect(screen.getByText("Requires admin attention")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<AlertBanner alert={mockAlert} />);
    expect(screen.getByText("Click to filter devices")).toBeInTheDocument();
  });

  it("renders the alert icon", () => {
    render(<AlertBanner alert={mockAlert} />);
    expect(screen.getByAltText("Alert icon")).toBeInTheDocument();
  });

  it("renders all four AlertChips", () => {
    render(<AlertBanner alert={mockAlert} />);
    const chips = screen.getAllByTestId("alert-chip");
    expect(chips).toHaveLength(4);
  });

  it("renders Offline devices chip with correct value", () => {
    render(<AlertBanner alert={mockAlert} />);
    expect(screen.getByText("Offline devices")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders Expired or expiring soon chip with correct value", () => {
    render(<AlertBanner alert={mockAlert} />);
    expect(screen.getByText("Expired or expiring soon")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders Outdated firmware chip with correct value", () => {
    render(<AlertBanner alert={mockAlert} />);
    expect(screen.getByText("Outdated firmware")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("renders Other issues chip with correct value", () => {
    render(<AlertBanner alert={mockAlert} />);
    expect(screen.getByText("Other issues")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders with zero values", () => {
    const zeroAlert = {
      offlineDevices: 0,
      expiredOrExpiringSoon: 0,
      outdatedFirmware: 0,
      otherIssues: 0,
    };
    render(<AlertBanner alert={zeroAlert} />);
    const chips = screen.getAllByTestId("alert-chip");
    expect(chips).toHaveLength(4);
    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(4);
  });

  it("has the correct background color class", () => {
    const { container } = render(<AlertBanner alert={mockAlert} />);
    const banner = container.firstChild as HTMLElement;
    expect(banner.className).toContain("bg-[#F3D9D7]");
  });

  it("renders with large values", () => {
    const largeAlert = {
      offlineDevices: 9999,
      expiredOrExpiringSoon: 1234,
      outdatedFirmware: 567,
      otherIssues: 89,
    };
    render(<AlertBanner alert={largeAlert} />);
    expect(screen.getByText("9999")).toBeInTheDocument();
    expect(screen.getByText("1234")).toBeInTheDocument();
  });
});
