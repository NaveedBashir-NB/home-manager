"use client";

import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <Toaster position="top-center" />
      {children}
    </SessionProvider>
  );
}
