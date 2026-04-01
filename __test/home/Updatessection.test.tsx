import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import UpdatesSection from "@/components/home/UpdatesSection";

// Mock Next.js Image
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt, ...props }: { alt: string; [key: string]: unknown }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

// Mock SVG icons
jest.mock("@/components/icons/help.svg", () => "HelpIcon");
jest.mock("@/components/icons/feed.svg", () => "FeedIcon");

// Mock lucide-react
jest.mock("lucide-react", () => ({
  ChevronDownIcon: () => <span data-testid="chevron-down" />,
  ChevronUpIcon: () => <span data-testid="chevron-up" />,
  ExternalLinkIcon: () => <span data-testid="external-link" />,
}));

const mockRelease = {
  version: "Mersive v1.0.1",
  date: "April 10, 2024",
  bullets: [
    "Release note bullet point one",
    "Release note bullet point two",
    "Release note bullet point three",
  ],
};

const mockFaqs = [
  { question: "How do I activate a device?" },
  {
    question: "What network settings are needed for WebRTC sharing?",
    answer: "You need to configure your firewall.",
  },
  { question: "How do I troubleshoot using analytics?" },
];

describe("UpdatesSection", () => {
  describe("Header / Toggle", () => {
    it("renders the Updates heading", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      expect(screen.getByText("Updates")).toBeInTheDocument();
    });

    it("shows content by default (open=true)", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      expect(screen.getByText("Mersive v1.0.1")).toBeInTheDocument();
    });

    it("shows chevron-up when open", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      expect(screen.getByTestId("chevron-up")).toBeInTheDocument();
    });

    it("collapses content when header button is clicked", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      const toggleBtn = screen.getByRole("button", { name: /updates/i });
      fireEvent.click(toggleBtn);
      expect(screen.queryByText("Mersive v1.0.1")).not.toBeInTheDocument();
    });

    it("shows chevron-down after collapsing", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      const toggleBtn = screen.getByRole("button", { name: /updates/i });
      fireEvent.click(toggleBtn);
      expect(screen.getByTestId("chevron-down")).toBeInTheDocument();
    });

    it("re-expands content when toggled again", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      const toggleBtn = screen.getByRole("button", { name: /updates/i });
      fireEvent.click(toggleBtn);
      fireEvent.click(toggleBtn);
      expect(screen.getByText("Mersive v1.0.1")).toBeInTheDocument();
    });
  });

  describe("Release Notes", () => {
    it("renders the Latest Updates section heading", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      expect(screen.getByText("Latest Updates")).toBeInTheDocument();
    });

    it("renders the release version", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      expect(screen.getByText("Mersive v1.0.1")).toBeInTheDocument();
    });

    it("renders the release date", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      expect(screen.getByText("April 10, 2024")).toBeInTheDocument();
    });

    it("renders all bullet points", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      expect(
        screen.getByText("Release note bullet point one"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Release note bullet point two"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Release note bullet point three"),
      ).toBeInTheDocument();
    });

    it("renders 'See all release notes' link button", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      expect(screen.getByText(/see all release notes/i)).toBeInTheDocument();
    });
  });

  describe("FAQ Section", () => {
    it("renders all FAQ questions", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      expect(
        screen.getByText("How do I activate a device?"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          "What network settings are needed for WebRTC sharing?",
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText("How do I troubleshoot using analytics?"),
      ).toBeInTheDocument();
    });

    it("FAQ answers are hidden by default", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      expect(
        screen.queryByText("You need to configure your firewall."),
      ).not.toBeInTheDocument();
    });

    it("shows answer when FAQ is clicked (with custom answer)", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      const faqBtn = screen.getByRole("button", { name: /WebRTC/i });
      fireEvent.click(faqBtn);
      expect(
        screen.getByText("You need to configure your firewall."),
      ).toBeInTheDocument();
    });

    it("shows default answer text when no answer provided", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      const faqBtn = screen.getByRole("button", { name: /activate a device/i });
      fireEvent.click(faqBtn);
      expect(
        screen.getByText(
          "Answer content will appear here once available from the API.",
        ),
      ).toBeInTheDocument();
    });

    it("collapses FAQ answer when clicked again", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      const faqBtn = screen.getByRole("button", { name: /WebRTC/i });
      fireEvent.click(faqBtn);
      fireEvent.click(faqBtn);
      expect(
        screen.queryByText("You need to configure your firewall."),
      ).not.toBeInTheDocument();
    });

    it("opens only one FAQ at a time", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      const faq1 = screen.getByRole("button", { name: /activate a device/i });
      const faq2 = screen.getByRole("button", { name: /WebRTC/i });
      fireEvent.click(faq1);
      fireEvent.click(faq2);
      // faq1's answer should be gone, faq2's should be visible
      expect(
        screen.queryByText(
          "Answer content will appear here once available from the API.",
        ),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("You need to configure your firewall."),
      ).toBeInTheDocument();
    });

    it("shows + icon for closed FAQ items", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      const plusSigns = screen.getAllByText("+");
      expect(plusSigns.length).toBe(mockFaqs.length);
    });

    it("shows − icon for open FAQ item", () => {
      render(<UpdatesSection release={mockRelease} faqs={mockFaqs} />);
      const faqBtn = screen.getByRole("button", { name: /activate a device/i });
      fireEvent.click(faqBtn);
      expect(screen.getByText("−")).toBeInTheDocument();
    });
  });
});
