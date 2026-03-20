import { create } from "zustand";

export type ToastType = "success" | "error";

type ToastState = {
  id: number;
  message: string;
  type: ToastType;
};

type UiState = {
  mobileMenuOpen: boolean;
  toast: ToastState | null;
  setMobileMenuOpen: (open: boolean) => void;
  showToast: (message: string, type?: ToastType) => void;
  clearToast: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  mobileMenuOpen: false,
  toast: null,
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  showToast: (message, type = "success") =>
    set((state) => ({
      toast: {
        id: state.toast ? state.toast.id + 1 : 1,
        message,
        type,
      },
    })),
  clearToast: () => set({ toast: null }),
}));
