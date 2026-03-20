import { useEffect } from "react";
import { useUiStore } from "../../store/uiStore";

export function ToastCenter() {
  const toast = useUiStore((state) => state.toast);
  const clearToast = useUiStore((state) => state.clearToast);

  useEffect(() => {
    if (!toast) return;

    const timeoutId = window.setTimeout(() => {
      clearToast();
    }, 2600);

    return () => window.clearTimeout(timeoutId);
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div className="toast-center" role="status" aria-live="polite">
      <div className={`toast-message ${toast.type}`}>{toast.message}</div>
    </div>
  );
}
