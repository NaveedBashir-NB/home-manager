"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isLocalLoggedIn } from "../utils/checkAuth";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Wait for OAuth session to load
    if (status === "loading") return;

    const localUser = isLocalLoggedIn();

    // If neither Google auth nor local login exists → redirect to login
    if (!session && !localUser) {
      router.push("/login");
    }
  }, [session, status, router]);

  return (
    <div className="p-6 text-[var(--text-main)]">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="mt-2 text-[var(--text-muted)]">
        Welcome to your home management panel.
      </p>
    </div>
  );
}
