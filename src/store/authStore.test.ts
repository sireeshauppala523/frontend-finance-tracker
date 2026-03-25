import { describe, expect, it } from "vitest";
import { useAuthStore } from "./authStore";

describe("authStore", () => {
  it("stores the incoming session profile", () => {
    useAuthStore.getState().setSession("access", "refresh", {
      email: "user@example.com",
      displayName: "User",
      preferredCurrency: "USD",
      avatarUrl: "avatar-data",
    });

    expect(useAuthStore.getState().user).toEqual({
      email: "user@example.com",
      displayName: "User",
      preferredCurrency: "USD",
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
