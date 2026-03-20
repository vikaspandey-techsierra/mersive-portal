import React from "react";
import { render, screen } from "@testing-library/react";
import StatCards from "@/components/home/StatCards";

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Mock SVG icons
jest.mock("@/components/icons/tv.svg", () => "MonitorIcon");
jest.mock("@/components/icons/person.svg", () => "UserIcon");
jest.mock("@/components/icons/schedule.svg", () => "ClockIcon");
jest.mock("@/components/icons/trending_up.svg", () => "TrendingUpIcon");

const mockStats = {
  meetingsUnderway: 12,
  activeUsers: 45,
  avgMeetingLengthMin: 38,
  busiestTimeLabel: "10:00 AM - 11:00 AM",
};

describe("StatCards", () => {
  it("renders all four stat cards", () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByText("Meetings underway")).toBeInTheDocument();
    expect(screen.getByText("Device used")).toBeInTheDocument();
    expect(screen.getByText("Average meeting length")).toBeInTheDocument();
    expect(screen.getByText("Busiest time")).toBeInTheDocument();
  });

  it("renders meetingsUnderway value", () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("renders activeUsers value", () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByText("45")).toBeInTheDocument();
  });

  it("renders avgMeetingLength with min suffix", () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByText("38 min")).toBeInTheDocument();
  });

  it("renders busiestTimeLabel", () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByText("10:00 AM - 11:00 AM")).toBeInTheDocument();
  });

  it("renders four card icons", () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByAltText("Meetings underway icon")).toBeInTheDocument();
    expect(screen.getByAltText("Device used icon")).toBeInTheDocument();
    expect(
      screen.getByAltText("Average meeting length icon"),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Busiest time icon")).toBeInTheDocument();
  });

  it("renders with zero values", () => {
    const zeroStats = {
      meetingsUnderway: 0,
      activeUsers: 0,
      avgMeetingLengthMin: 0,
      busiestTimeLabel: "",
    };
    render(<StatCards stats={zeroStats} />);
    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(2); // meetings + activeUsers
    expect(screen.getByText("0 min")).toBeInTheDocument();
  });

  it("renders with large numbers", () => {
    const largeStats = {
      meetingsUnderway: 9999,
      activeUsers: 8888,
      avgMeetingLengthMin: 120,
      busiestTimeLabel: "2:00 PM - 3:00 PM",
    };
    render(<StatCards stats={largeStats} />);
    expect(screen.getByText("9999")).toBeInTheDocument();
    expect(screen.getByText("8888")).toBeInTheDocument();
    expect(screen.getByText("120 min")).toBeInTheDocument();
  });

  it("renders all cards in a flex container", () => {
    const { container } = render(<StatCards stats={mockStats} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("flex");
  });
});
