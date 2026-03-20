import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandLogo } from "./BrandLogo";

describe("BrandLogo", () => {
  it("renders the finance product wordmark and tagline", () => {
    render(<BrandLogo tagline="Clear, steady money habits" withWordmark />);

    expect(screen.getByText("Personal Finance Tracker")).toBeInTheDocument();
    expect(screen.getByText("Clear, steady money habits")).toBeInTheDocument();
  });

  it("can render the mark without the wordmark", () => {
    const { container } = render(<BrandLogo withWordmark={false} />);

    expect(screen.queryByText("Personal Finance Tracker")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
