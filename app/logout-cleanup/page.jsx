"use client";

import { useEffect } from "react";

export default function LogoutCleanup() {
  useEffect(() => {
    // Clear only session
    localStorage.removeItem("hm_session");

    // Now redirect safely
    window.location.href = "/";
  }, []);

  return null;
}
