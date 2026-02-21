"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import InputField from "../components/InputField";
import toast from "react-hot-toast";
import { confirmToast } from "../components/ui/confirmToast";
import { CheckCheck, FileDown, Pencil, Trash2, Undo } from "lucide-react";
import { generateItemsPDF } from "../utils/generatePDF";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categories] = useState([
    "Food & Groceries",
    "Household Items / Supplies",
    "Personal Care",
    "Child Care",
    "Clothing & Accessories",
    "Medical & Healthcare",
    "Misc Items",
  ]);

  const [greeting, setGreeting] = useState("");

  // Greeting
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(
      h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening",
    );
  }, []);

  // Load user and items
  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/login");
      return;
    }

    setUser(session.user);
    const email = encodeURIComponent(session.user.email);

    // Start loading
    setIsLoading(true);

    fetch(`/api/items?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        setItems(data || []);
        setFilteredItems(data || []);
      })
      .catch((err) => {
        console.error(err);
        setItems([]);
        setFilteredItems([]);
      })
      .finally(() => {
        setIsLoading(false); // Stop loading
      });
  }, [session, status]);

  // Filter + search logic
  useEffect(() => {
    let data = [...items];

    if (search.trim())
      data = data.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()),
      );
    if (categoryFilter !== "all")
      data = data.filter((i) => i.category === categoryFilter);
    if (statusFilter !== "all")
      data = data.filter((i) => i.status === statusFilter);

    setFilteredItems(data);
  }, [search, categoryFilter, statusFilter, items]);

  const refreshItems = async () => {
    if (!user?.email) return;
    const email = encodeURIComponent(user.email);
    const res = await fetch(`/api/items?email=${email}`);
    const data = await res.json();
    setItems(data || []);
  };

  const markCompleted = async (item) => {
    try {
      const payload = {
        id: item._id,
        userId: session.user.email,
        name: item.name,
        description: item.description,
        category: item.category,
        status: "completed",
      };

      const res = await fetch("/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Failed: " + err.error);
        return;
      }

      const updatedItem = await res.json();

      setItems((prev) =>
        prev.map((i) => (i._id === updatedItem._id ? updatedItem : i)),
      );
      toast.success("Item marked as completed");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const markPending = async (item) => {
    try {
      const payload = {
        id: item._id,
        userId: session.user.email,
        name: item.name,
        description: item.description,
        category: item.category,
        status: "pending",
      };

      const res = await fetch("/api/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error("Failed: " + err.error);
        return;
      }

      const updatedItem = await res.json();

      setItems((prev) =>
        prev.map((i) => (i._id === updatedItem._id ? updatedItem : i)),
      );

      toast.success("Item moved to pending");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  function handleDelete(itemId) {
    confirmToast("Are you sure you want to delete this item?", async () => {
      try {
        const res = await fetch("/api/items", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: itemId,
            userId: session.user.email,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          toast.success("Item deleted successfully");
          setItems(items.filter((item) => item._id !== itemId));
        } else {
          toast.error("Delete failed: " + data.error);
        }
      } catch (err) {
        toast.error("Delete failed: " + err.message);
      }
    });
  }

  const goEdit = (id) => router.push(`/edit-item/${id}`);

  if (!user) return null;

// PDF Export Function
  const handleExportPDF = () => {
  if (filteredItems.length === 0) {
    toast.error("No items to export.");
    return;
  }
  generateItemsPDF(filteredItems, categoryFilter, statusFilter, user);
  toast.success("PDF downloaded!");
};

  return (
    <div className="px-6 py-10 max-w-6xl mx-auto">
      {/* GREETING */}
      <div className="mb-10">
        <h1 className="text-xl sm:text-xl font-bold text-secondary mb-1">
          {greeting}, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-secondary-light">
          Manage your daily household items easily.
        </p>
      </div>

      
      <div className="flex items-center justify-between mb-3">
        <h4>
          {isLoading
            ? "Fetching items..."
            : `Filtered Items (${filteredItems.length})`}
        </h4>
      
        {!isLoading && filteredItems.length > 0 && (
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-yellow-400 hover:bg-yellow-500 text-black rounded-lg transition"
          >
            <FileDown size={16} />
            Export PDF
          </button>
        )}
      </div>
      

      {/* SEARCH + FILTER */}
      <div className="bg-accent-light border-primary border-2 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl transition-colors duration-500 mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InputField
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full mt-1 px-4 py-1 text-sm bg-(--placeholder-bg) dark:bg-black/20 border-primary-light border-2 text-secondary placeholder-(--placeholder-text) rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full mt-1 px-4 py-1 text-sm bg-(--placeholder-bg) dark:bg-black/20 border-primary-light border-2 text-secondary placeholder-(--placeholder-text) rounded-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none transition-colors"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="future-needs">Future Needs</option>
          </select>
        </div>
      </div>

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
            className="card border-2 cursor-pointer"
          >
            <div className="card-header">{box.icon}</div>
            <p className="card-title">{box.label}</p>
          </div>
        ))}
      </div>

      {/* FILTERED ITEMS LIST */}
      <h4 className="mb-3">
        {isLoading
          ? "Fetching items..."
          : `Filtered Items (${filteredItems.length})`}
      </h4>

      {isLoading ? (
        <div className="flex items-center gap-3">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          <p className="text-secondary-light text-sm font-medium">
            Please wait, we are getting your data ready...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <p className="text-secondary-light text-sm">No items found.</p>
      ) : (
        <ul className="space-y-3">
          {Array.isArray(filteredItems) &&
            [...filteredItems] // 1. Create a copy to avoid mutating state
              .sort((a, b) => a.name.localeCompare(b.name)) // 2. Sort ascending by name
              .slice(0, 500) // 3. Limit the results
              .map((item) => (
                <li
                  key={item._id}
                  className="card text-start flex flex-col sm:flex-row justify-between px-3 py-1 space-y-2 sm:p-3"
                >
                  <div className="flex flex-col">
                    <span className="card-title font-semibold text-secondary">
                      {item.name}
                    </span>
                    {item.description && (
                      <span className="card-body">{item.description}</span>
                    )}
                  </div>

                  <div className="flex justify-between py-1 gap-1 sm:w-1/2 sm:max-w-75">
                    <span
                      className={`text-xs sm:text-sm sm:font-bold font-semibold px-3 sm:px-5 py-1 sm:py-2 rounded-sm my-auto ${
                        item.status === "completed"
                          ? "bg-green-500/30 text-green-800"
                          : item.status === "future-needs"
                            ? "bg-blue-500/30 text-blue-800"
                            : "bg-yellow-500/30 text-yellow-800"
                      }`}
                    >
                      {item.status === "future-needs"
                        ? "Future Needs"
                        : item.status === "pending"
                          ? "Pending"
                          : "Completed"}
                    </span>

                    <div className="flex w-2/5 max-w-30 justify-between">
                      {" "}
                      <button
                        onClick={() => goEdit(item._id)}
                        title="Edit"
                        className="text-yellow-500 hover:text-yellow-800 transition"
                      >
                        <Pencil size={22} />
                      </button>
                      {item.status === "completed" ? (
                        <button
                          onClick={() => markPending(item)}
                          title="Mark pending"
                          className="text-blue-500 hover:text-blue-800 transition"
                        >
                          <Undo size={22} />
                        </button>
                      ) : (
                        <button
                          onClick={() => markCompleted(item)}
                          title="Mark completed"
                          className="text-green-500 hover:text-green-800 transition"
                        >
                          <CheckCheck size={22} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                        className="text-red-500 hover:text-red-800 transition"
                      >
                        <Trash2 size={22} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
        </ul>
      )}
    </div>
  );
}
