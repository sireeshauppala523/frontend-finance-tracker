import { describe, expect, it } from "vitest";
import { saveUserProfile } from "../utils/storage";
import { useAuthStore } from "./authStore";

describe("authStore", () => {
  it("merges saved profile preferences into the incoming session", () => {
    saveUserProfile("user@example.com", {
      displayName: "Saved User",
      preferredCurrency: "AED",
      avatarUrl: "avatar-data",
    });

    useAuthStore.getState().setSession("access", "refresh", {
      email: "user@example.com",
      displayName: "Incoming User",
      preferredCurrency: "USD",
      avatarUrl: null,
    });

    expect(useAuthStore.getState().user).toEqual({
      email: "user@example.com",
      displayName: "Saved User",
      preferredCurrency: "AED",
      avatarUrl: "avatar-data",
    });
  });

  it("updates the current user profile in store", () => {
    useAuthStore.getState().setSession("access", "refresh", {
      email: "user@example.com",
      displayName: "User",
      preferredCurrency: "INR",
      avatarUrl: null,
    });

    useAuthStore.getState().updateProfile({
      displayName: "Updated User",
      preferredCurrency: "EUR",
    });

    expect(useAuthStore.getState().user?.displayName).toBe("Updated User");
    expect(useAuthStore.getState().user?.preferredCurrency).toBe("EUR");
  });
});
