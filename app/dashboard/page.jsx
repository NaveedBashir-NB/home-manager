"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isLocalLoggedIn } from "../utils/checkAuth";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [greeting, setGreeting] = useState("");

  // Greeting
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening");
  }, []);

  // Authentication Check
  useEffect(() => {
    if (status === "loading") return;

    const localUser = isLocalLoggedIn();

    if (!session && !localUser) {
      router.push("/login");
      return;
    }

    setUser(session?.user || JSON.parse(localStorage.getItem("hm_user")));
  }, [session, status, router]);

  // Load Items
  useEffect(() => {
    const saved = localStorage.getItem("hm_items");
    if (saved) {
      const parsed = JSON.parse(saved);
      setItems(parsed);
      setFilteredItems(parsed);
    }
  }, []);

  // FILTER + SEARCH Logic
  useEffect(() => {
    let data = [...items];

    // Search
    if (search.trim()) {
      data = data.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Category Filter
    if (categoryFilter !== "all") {
      data = data.filter((i) => i.category === categoryFilter);
    }

    // Status Filter
    if (statusFilter !== "all") {
      data = data.filter((i) => i.status === statusFilter);
    }

    setFilteredItems(data);
  }, [search, categoryFilter, statusFilter, items]);

  const categories = [
    { label: "Grocery", value: "grocery" },
    { label: "Kitchen", value: "kitchen" },
    { label: "Bathroom", value: "bathroom" },
    { label: "Household", value: "household" },
  ];

  if (!user) return null;

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      {/* GREETING */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-main)]">
          {greeting}, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Manage your daily household items easily.
        </p>
      </div>

      {/* SEARCH + FILTERS */}
      <div
        className="
          bg-[var(--card-bg)]
          border border-[var(--dropdown-border)]
          rounded-xl p-5 mb-10 shadow-lg backdrop-blur-xl
        "
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* SEARCH BOX */}
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full px-4 py-2 rounded-xl bg-black/10 dark:bg-white/10 
              border border-[var(--dropdown-border)] text-[var(--text-main)]
              focus:outline-none focus:border-yellow-300 transition
            "
          />

          {/* CATEGORY FILTER */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="
              w-full px-4 py-2 rounded-xl bg-black/10 dark:bg-white/10 
              border border-[var(--dropdown-border)] text-[var(--text-main)]
              focus:outline-none focus:border-yellow-300 transition
            "
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>

          {/* STATUS FILTER */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
              w-full px-4 py-2 rounded-xl bg-black/10 dark:bg-white/10
              border border-[var(--dropdown-border)] text-[var(--text-main)]
              focus:outline-none focus:border-yellow-300 transition
            "
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Add Item", icon: "➕", action: "/add-item" },
          { label: "All Items", icon: "📦", action: "/items" },
          { label: "Pending", icon: "⏳", action: "/items?filter=pending" },
          { label: "Completed", icon: "✅", action: "/items?filter=done" },
        ].map((box) => (
          <div
            key={box.label}
            onClick={() => router.push(box.action)}
            className="
              cursor-pointer bg-[var(--card-bg)]
              border border-[var(--dropdown-border)] rounded-xl
              p-6 text-center hover:scale-105 transition shadow-md
            "
          >
            <div className="text-3xl mb-2">{box.icon}</div>
            <p className="text-sm font-semibold">{box.label}</p>
          </div>
        ))}
      </div>

      {/* FILTERED RESULTS LIST */}
      <h2 className="text-xl font-bold mb-3 text-[var(--text-main)]">
        Filtered Items ({filteredItems.length})
      </h2>

      <div
        className="
          bg-[var(--card-bg)]
          p-5 rounded-xl border border-[var(--dropdown-border)]
          shadow mb-10
        "
      >
        {filteredItems.length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">No items found.</p>
        ) : (
          <ul className="space-y-3">
            {filteredItems.slice(0, 10).map((item, index) => (
              <li
                key={index}
                className="
                  flex justify-between items-center p-3 rounded-lg
                  bg-black/10 dark:bg-white/10
                "
              >
                <span>{item.name}</span>

                <span
                  className={`text-xs px-3 py-1 rounded-full ${
                    item.status === "completed"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-300"
                  }`}
                >
                  {item.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* TODAY'S TASKS */}
      <h2 className="text-xl font-bold mb-2 text-[var(--text-main)]">
        Today’s Pending Items
      </h2>

      <div
        className="
          bg-[var(--card-bg)]
          p-5 rounded-xl border border-[var(--dropdown-border)]
          shadow
        "
      >
        {filteredItems.filter((i) => i.status === "pending").length === 0 ? (
          <p className="text-[var(--text-muted)] text-sm">No pending tasks 🎉</p>
        ) : (
          <ul className="space-y-3">
            {filteredItems
              .filter((i) => i.status === "pending")
              .slice(0, 5)
              .map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-black/10 dark:bg-white/10"
                >
                  <span>{item.name}</span>
                  <button
                    onClick={() => {
                      const updated = items.map((x) =>
                        x.id === item.id ? { ...x, status: "completed" } : x
                      );
                      setItems(updated);
                      localStorage.setItem("hm_items", JSON.stringify(updated));
                    }}
                    className="text-green-400 font-semibold hover:text-green-300"
                  >
                    ✓
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
