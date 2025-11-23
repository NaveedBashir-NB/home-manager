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
    setGreeting(
      h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening"
    );
  }, []);

  // Auth check & user load
  useEffect(() => {
    if (status === "loading") return;

    const localUser = isLocalLoggedIn();
    if (!session && !localUser) {
      router.push("/login");
      return;
    }

    setUser(session?.user || JSON.parse(localStorage.getItem("hm_user")));
  }, [session, status, router]);

  // Load items & categories from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("hm_items");
    if (saved) {
      const parsed = JSON.parse(saved);
      setItems(parsed);
      setFilteredItems(parsed);
    } else {
      setItems([]);
      setFilteredItems([]);
    }

    // Ensure categories exist (do not mutate UI layout)
    const savedCats = JSON.parse(localStorage.getItem("hm_categories") || "[]");
    const defaultCategories = [
      "grocery",
      "kitchen",
      "bathroom",
      "household",
      "future-needs",
    ];
    const merged = Array.from(new Set([...defaultCategories, ...savedCats]));
    localStorage.setItem("hm_categories", JSON.stringify(merged));
  }, []);

  // Filter + search logic (keeps your original layout and semantics)
  useEffect(() => {
    let data = [...items];

    if (search.trim()) {
      data = data.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter !== "all") {
      data = data.filter((i) => i.category === categoryFilter);
    }

    if (statusFilter !== "all") {
      data = data.filter((i) => i.status === statusFilter);
    }

    setFilteredItems(data);
  }, [search, categoryFilter, statusFilter, items]);

  // Helpers to update localStorage + state
  const saveItems = (updated) => {
    setItems(updated);
    localStorage.setItem("hm_items", JSON.stringify(updated));
  };

  // CRUD handlers
  const markCompleted = (id) => {
    const updated = items.map((x) =>
      x.id === id ? { ...x, status: "completed" } : x
    );
    saveItems(updated);
  };

  const deleteItem = (id) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const updated = items.filter((x) => x.id !== id);
    saveItems(updated);
  };

  const goEdit = (id) => {
    // edit route is app/edit-item/[id]/page.jsx -> navigate to /edit-item/<id>
    router.push(`/edit-item/${id}`);
  };

  // categories for dropdown (load from localStorage)
  const rawCats = JSON.parse(localStorage.getItem("hm_categories") || "[]");
  const categories = rawCats.length
    ? rawCats
    : ["grocery", "kitchen", "bathroom", "household", "future-needs"];

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

          {/* CATEGORY FILTER (dynamic categories) */}
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
              <option key={c} value={c}>
                {c.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </option>
            ))}
          </select>

          {/* STATUS FILTER (including future-needs) */}
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
            <option value="future-needs">Future Needs</option>
          </select>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        {[
          {
            label: "Add Item",
            icon: "➕",
            action: () => router.push("/add-item"),
          },
          {
            label: "All Items",
            icon: "📦",
            action: () => setStatusFilter("all"),
          },
          {
            label: "Pending",
            icon: "⏳",
            action: () => setStatusFilter("pending"),
          },
          {
            label: "Completed",
            icon: "✅",
            action: () => setStatusFilter("completed"),
          },
          {
            label: "Future Needs",
            icon: "🔮",
            action: () => setStatusFilter("future-needs"),
          },
        ].map((box) => (
          <div
            key={box.label}
            onClick={box.action}
            className="
        cursor-pointer bg-[var(--card-bg)]
        border border-[var(--dropdown-border)]
        rounded-xl p-6 text-center hover:scale-105 
        transition shadow-md select-none
      "
          >
            <div className="text-3xl mb-2">{box.icon}</div>
            <p className="text-sm font-semibold text-[var(--text-main)]">
              {box.label}
            </p>
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
            {filteredItems.slice(0, 10).map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-3 rounded-lg bg-black/10 dark:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <span>{item.name}</span>
                </div>

                {/* Status badge + action icons on right (Option A) */}
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs px-3 py-1 rounded-full ${
                      item.status === "completed"
                        ? "bg-green-500/20 text-green-400"
                        : item.status === "future-needs"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-yellow-500/20 text-yellow-300"
                    }`}
                  >
                    {item.status === "future-needs"
                      ? "Future Needs"
                      : item.status}
                  </span>

                  {/* Edit */}
                  <button
                    onClick={() => goEdit(item.id)}
                    title="Edit"
                    className="text-[var(--text-main)] hover:text-yellow-400 transition"
                  >
                    ✏️
                  </button>

                  {/* Mark Completed (only if not completed) */}
                  {item.status !== "completed" && (
                    <button
                      onClick={() => markCompleted(item.id)}
                      title="Mark completed"
                      className="text-green-400 hover:text-green-300 transition"
                    >
                      ✔
                    </button>
                  )}

                  {/* Delete */}
                  <button
                    onClick={() => deleteItem(item.id)}
                    title="Delete"
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* TODAY'S PENDING TASKS */}
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
          <p className="text-[var(--text-muted)] text-sm">
            No pending tasks 🎉
          </p>
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
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const updated = items.map((x) =>
                          x.id === item.id ? { ...x, status: "completed" } : x
                        );
                        saveItems(updated);
                      }}
                      className="text-green-400 font-semibold hover:text-green-300"
                    >
                      ✓
                    </button>

                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-red-400 font-semibold hover:text-red-300"
                    >
                      🗑
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}
