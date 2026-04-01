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

  it("renders two AlertChips (Offline devices and Expired or expiring soon)", () => {
    render(<AlertBanner alert={mockAlert} />);
    const chips = screen.getAllByTestId("alert-chip");
    expect(chips).toHaveLength(2);
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

  it("does NOT render Outdated firmware chip (not in component)", () => {
    render(<AlertBanner alert={mockAlert} />);
    expect(screen.queryByText("Outdated firmware")).not.toBeInTheDocument();
    expect(screen.queryByText("2")).not.toBeInTheDocument();
  });

  it("does NOT render Other issues chip (not in component)", () => {
    render(<AlertBanner alert={mockAlert} />);
    expect(screen.queryByText("Other issues")).not.toBeInTheDocument();
    expect(screen.queryByText("1")).not.toBeInTheDocument();
  });

  it("does NOT render the banner when there are no alerts", () => {
    const zeroAlert = {
      offlineDevices: 0,
      expiredOrExpiringSoon: 0,
      outdatedFirmware: 0,
      otherIssues: 0,
    };
    const { container } = render(<AlertBanner alert={zeroAlert} />);
    // Banner should not be rendered
    expect(container.firstChild).toBeNull();
  });

  it("renders the banner when there are alerts (either offlineDevices or expiredOrExpiringSoon > 0)", () => {
    const alertWithOfflineOnly = {
      offlineDevices: 1,
      expiredOrExpiringSoon: 0,
      outdatedFirmware: 0,
      otherIssues: 0,
    };
    render(<AlertBanner alert={alertWithOfflineOnly} />);
    expect(screen.getByText("Requires admin attention")).toBeInTheDocument();
    expect(screen.getByText("Offline devices")).toBeInTheDocument();
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
