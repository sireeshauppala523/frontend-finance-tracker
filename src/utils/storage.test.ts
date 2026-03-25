import { describe, expect, it } from "vitest";
import { getPreferredCurrency, getStoredUser, setAuthSession } from "./storage";

describe("storage helpers", () => {
  it("stores the signed-in user for the current session", () => {
    setAuthSession("access", "refresh", {
      email: "user@example.com",
      displayName: "User",
      preferredCurrency: "EUR",
      avatarUrl: null,
    });

    expect(getStoredUser()).toEqual({
      email: "user@example.com",
      displayName: "User",
      preferredCurrency: "EUR",
      avatarUrl: null,
    });
  });

  it("returns the signed-in user's preferred currency when available", () => {
    setAuthSession("access", "refresh", {
      email: "user@example.com",
      displayName: "User",
      preferredCurrency: "GBP",
      avatarUrl: null,
    });

    expect(getPreferredCurrency()).toBe("GBP");
  });

  it("falls back to INR when no stored user exists", () => {
    expect(getPreferredCurrency()).toBe("INR");
  });
});
