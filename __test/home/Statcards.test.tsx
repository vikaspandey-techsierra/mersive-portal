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

  it("renders avgMeetingLength value (without min suffix)", () => {
    render(<StatCards stats={mockStats} />);
    expect(screen.getByText("38")).toBeInTheDocument();
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
      screen.getByAltText("Average meeting length icon")
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

    // meetingsUnderway and activeUsers show "0"
    const zeros = screen.getAllByText("0");
    expect(zeros).toHaveLength(2);

    // avgMeetingLength shows a gray bar (since 0 is falsy)
    const grayBars = document.querySelectorAll(
      ".w-6.h-1\\.5.bg-\\[\\#090814\\].my-5"
    );
    expect(grayBars.length).toBe(2); // One for avgMeetingLength, one for busiestTime
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
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("2:00 PM - 3:00 PM")).toBeInTheDocument();
  });

  it("renders all cards in a flex container", () => {
    const { container } = render(<StatCards stats={mockStats} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("flex");
  });

  it("renders dash for meetingsUnderway when undefined", () => {
    const statsWithUndefinedMeetings = {
      meetingsUnderway: undefined,
      activeUsers: 45,
      avgMeetingLengthMin: 38,
      busiestTimeLabel: "10:00 AM",
    };
    // @ts-expect-error testing undefined edge case
    render(<StatCards stats={statsWithUndefinedMeetings} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders dash for activeUsers when undefined", () => {
    const statsWithUndefinedUsers = {
      meetingsUnderway: 12,
      activeUsers: undefined,
      avgMeetingLengthMin: 38,
      busiestTimeLabel: "10:00 AM",
    };
    // @ts-expect-error testing undefined edge case
    render(<StatCards stats={statsWithUndefinedUsers} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders gray bar for avgMeetingLength when null", () => {
    const statsWithNullAvg = {
      meetingsUnderway: 10,
      activeUsers: 20,
      avgMeetingLengthMin: null,
      busiestTimeLabel: "10:00 AM",
    };
    // @ts-expect-error testing null edge case
    render(<StatCards stats={statsWithNullAvg} />);
    const grayBars = document.querySelectorAll(
      ".w-6.h-1\\.5.bg-\\[\\#090814\\].my-5"
    );
    expect(grayBars.length).toBe(1);
  });

  it("renders gray bar for busiestTime when empty", () => {
    const statsWithEmptyBusiestTime = {
      meetingsUnderway: 10,
      activeUsers: 20,
      avgMeetingLengthMin: 30,
      busiestTimeLabel: "",
    };
    render(<StatCards stats={statsWithEmptyBusiestTime} />);
    const grayBars = document.querySelectorAll(
      ".w-6.h-1\\.5.bg-\\[\\#090814\\].my-5"
    );
    expect(grayBars.length).toBe(1);
  });

  it("renders gray bars for both avgMeetingLength and busiestTime when both are falsy", () => {
    const statsWithBothFalsy = {
      meetingsUnderway: 10,
      activeUsers: 20,
      avgMeetingLengthMin: null,
      busiestTimeLabel: "",
    };
    // @ts-expect-error testing null edge case
    render(<StatCards stats={statsWithBothFalsy} />);
    const grayBars = document.querySelectorAll(
      ".w-6.h-1\\.5.bg-\\[\\#090814\\].my-5"
    );
    expect(grayBars.length).toBe(2);
  });

  it("renders gray bar for avgMeetingLength when value is 0", () => {
    const statsWithZeroAvg = {
      meetingsUnderway: 10,
      activeUsers: 20,
      avgMeetingLengthMin: 0,
      busiestTimeLabel: "10:00 AM",
    };
    render(<StatCards stats={statsWithZeroAvg} />);
    // 0 is falsy, so it should show a gray bar instead of "0"
    const grayBars = document.querySelectorAll(
      ".w-6.h-1\\.5.bg-\\[\\#090814\\].my-5"
    );
    expect(grayBars.length).toBe(1);
    // Should NOT show "0" for avgMeetingLength - use queryAllByText which returns empty array when not found
    const zeros = screen.queryAllByText("0");
    expect(zeros).toHaveLength(0); // No zeros at all (meetingsUnderway is 10, activeUsers is 20)
  });

  it("renders gray bar for avgMeetingLength when value is undefined", () => {
    const statsWithUndefinedAvg = {
      meetingsUnderway: 10,
      activeUsers: 20,
      avgMeetingLengthMin: undefined,
      busiestTimeLabel: "10:00 AM",
    };
    // @ts-expect-error testing undefined edge case
    render(<StatCards stats={statsWithUndefinedAvg} />);
    const grayBars = document.querySelectorAll(
      ".w-6.h-1\\.5.bg-\\[\\#090814\\].my-5"
    );
    expect(grayBars.length).toBe(1);
  });
});
