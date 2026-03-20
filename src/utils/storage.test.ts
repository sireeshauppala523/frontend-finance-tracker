import { describe, expect, it } from "vitest";
import { getPreferredCurrency, getUserProfile, saveUserProfile, setAuthSession } from "./storage";

describe("storage helpers", () => {
  it("stores profile data by normalized email", () => {
    saveUserProfile("User@Example.com", {
      displayName: "User",
      preferredCurrency: "EUR",
    });

    expect(getUserProfile("user@example.com")).toEqual({
      displayName: "User",
      preferredCurrency: "EUR",
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
