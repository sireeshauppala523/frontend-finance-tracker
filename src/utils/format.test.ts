import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, toIsoDate, toMonthLabel } from "./format";

describe("format utilities", () => {
  it("formats explicit currencies without relying on stored user state", () => {
    expect(formatCurrency(1234.5, "USD")).toContain("$");
    expect(formatCurrency(1234.5, "INR")).toContain("?");
  });

  it("formats date values for display", () => {
    expect(formatDate("2026-03-20")).toContain("2026");
    expect(formatDate(null)).toBe("-");
  });

  it("builds month labels and ISO dates", () => {
    expect(toMonthLabel(2026, 3)).toMatch(/Mar/i);
    expect(toIsoDate(new Date("2026-03-20T10:00:00.000Z"))).toBe("2026-03-20");
  });
});
