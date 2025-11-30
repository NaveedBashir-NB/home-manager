"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import InputField from "../components/InputField";

export default function CategoriesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [editing, setEditing] = useState(null); // { key, value }
  const [loading, setLoading] = useState(false);
  const [checkingDelete, setCheckingDelete] = useState(false);

  // Background image path (uploaded file). Your environment will transform this path to a URL.
  const bgUrl = "/mnt/data/A_high-resolution_digital_photograph_displays_vari.png";

  // Helpers
  const getActiveUser = () => {
    if (session?.user) return session.user;
    const localSession = typeof window !== "undefined" && localStorage.getItem("hm_session") === "active";
    return localSession ? JSON.parse(localStorage.getItem("hm_user") || "null") : null;
  };

  const emailForApi = (u) => encodeURIComponent(u?.email || "");

  const humanize = (slug) =>
    slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  // Load user and categories
  useEffect(() => {
    if (status === "loading") return;
    const active = getActiveUser();
    if (!active) {
      router.push("/login");
      return;
    }
    setUser(active);
  }, [session, status, router]);

  useEffect(() => {
    if (!user?.email) return;
    fetchCategories();
  }, [user]);

  async function fetchCategories() {
    if (!user?.email) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/categories?email=${emailForApi(user)}`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load categories", err);
      setCategories(["grocery", "kitchen", "bathroom", "household", "future-needs"]);
    } finally {
      setLoading(false);
    }
  }

  // Add category
  async function handleAddCategory() {
    if (!newCategory.trim()) {
      alert("Enter a category name");
      return;
    }
    const formatted = newCategory.toLowerCase().trim().replace(/\s+/g, "-");
    if (!user?.email) return;

    setLoading(true);
    try {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, category: formatted }),
      });
      setNewCategory("");
      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to add category");
    } finally {
      setLoading(false);
    }
  }

  // Start editing a category
  function startEdit(key) {
    setEditing({ key, value: key });
  }

  // Cancel edit
  function cancelEdit() {
    setEditing(null);
  }

  // Save rename
  async function saveEdit() {
    if (!editing || !editing.value.trim()) {
      alert("Enter a valid category name");
      return;
    }
    const oldKey = editing.key;
    const newCategoryValue = editing.value.toLowerCase().trim().replace(/\s+/g, "-");
    if (oldKey === newCategoryValue) {
      setEditing(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/categories/${oldKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, newCategory: newCategoryValue }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to rename");
      }
      setEditing(null);
      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to rename category");
    } finally {
      setLoading(false);
    }
  }

  // Delete category with check (warn if items exist)
  async function handleDelete(key) {
    if (!user?.email) return;
    setCheckingDelete(true);

    try {
      // fetch items for this user
      const itemsRes = await fetch(`/api/items?email=${emailForApi(user)}`);
      const items = await itemsRes.json();

      const usedBy = (items || []).filter((it) => it.category === key);
      if (usedBy.length > 0) {
        // warn user
        const ok = confirm(
          `${humanize(key)} is assigned to ${usedBy.length} item(s). Deleting it will remove the category from those items. Proceed?`
        );
        if (!ok) {
          setCheckingDelete(false);
          return;
        }
      } else {
        const ok = confirm(`Delete category "${humanize(key)}"?`);
        if (!ok) {
          setCheckingDelete(false);
          return;
        }
      }

      // proceed with delete
      const res = await fetch(`/api/categories/${key}?email=${emailForApi(user)}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to delete");
      }

      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    } finally {
      setCheckingDelete(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      {/* background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url('${bgUrl}')` }}
      />
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative px-6 py-12 max-w-4xl mx-auto">
        <div className="bg-[var(--bg-nav)] border-yellow-200 border-2 backdrop-blur-lg rounded-xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">Category Manager</h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Add, rename or delete categories for your account.
              </p>
            </div>

            <div className="text-sm text-[var(--text-muted)]">
              {user ? (
                <>
                  <div className="font-semibold">{user.name}</div>
                  <div className="text-xs">{user.email}</div>
                </>
              ) : (
                <div>—</div>
              )}
            </div>
          </div>

          {/* Add new category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end mb-6">
            <div className="sm:col-span-2">
              <InputField
                label="New Category"
                type="text"
                name="newCategory"
                placeholder="e.g., Electronics"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            </div>

            <div>
              <button
                type="button"
                onClick={handleAddCategory}
                className="btn-theme w-full py-2"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Category"}
              </button>
            </div>
          </div>

          {/* Categories list */}
          <div className="space-y-3">
            {loading && categories.length === 0 ? (
              <p className="text-[var(--text-muted)]">Loading categories...</p>
            ) : (
              categories.map((c) => (
                <div
                  key={c}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-[var(--dropdown-border)]"
                >
                  <div className="flex-1">
                    {editing?.key === c ? (
                      <input
                        value={editing.value}
                        onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                        className="w-full p-2 rounded border border-yellow-200 bg-[var(--bg-nav)] text-[var(--text-main)]"
                      />
                    ) : (
                      <div className="text-[var(--text-main)] font-medium">
                        {humanize(c)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editing?.key === c ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="px-3 py-1 rounded bg-green-600 text-white text-sm"
                          disabled={loading}
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 rounded border text-sm"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(c)}
                          className="px-3 py-1 rounded border text-sm hover:bg-yellow-50"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="px-3 py-1 rounded border text-sm text-red-600 hover:bg-red-50"
                          disabled={checkingDelete}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 text-sm text-[var(--text-muted)]">
            Tip: Default categories are <span className="font-semibold">Grocery, Kitchen, Bathroom, Household, Future Needs</span>.
            You can add your own categories; renaming will update items that referenced the category.
          </div>
        </div>
      </div>
    </div>
  );
}
