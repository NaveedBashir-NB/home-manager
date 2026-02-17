"use client";

import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        dismissible: true,
        style: {
          background: "var(--color-accent-light)",
          color: "var(--color-secondary)",
          border: "1px solid var(--color-primary)",
          fontSize: "14px",
        },
      }}
    />
  );
}
