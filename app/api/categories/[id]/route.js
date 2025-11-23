// /app/api/categories/[id]/route.js
import { readJSON, writeJSON } from "@/lib/db";
import { NextResponse } from "next/server";

// UPDATE CATEGORY (rename)
export async function PUT(req, { params }) {
  const oldKey = params.id;
  const { email, newCategory } = await req.json();

  if (!email || !newCategory) {
    return NextResponse.json({ error: "Missing email or newCategory" }, { status: 400 });
  }

  const normalized = newCategory.toLowerCase().trim().replace(/\s+/g, "-");

  const catsList = readJSON("categories.json");
  let user = catsList.find(u => u.userEmail === email);

  // ⛔ FIX: Auto-create user if missing
  if (!user) {
    user = { userEmail: email, categories: [] };
    catsList.push(user);
  }

  // rename category
  user.categories = user.categories.map(c => (c === oldKey ? normalized : c));
  writeJSON("categories.json", catsList);

  // update items.json
  const itemsList = readJSON("items.json");
  let itemsUser = itemsList.find(u => u.userEmail === email);

  if (!itemsUser) {
    itemsUser = { userEmail: email, items: [] };
    itemsList.push(itemsUser);
  }

  itemsUser.items = itemsUser.items.map(it =>
    it.category === oldKey ? { ...it, category: normalized } : it
  );

  writeJSON("items.json", itemsList);

  return NextResponse.json({ success: true, categories: user.categories });
}

// DELETE CATEGORY
export async function DELETE(req, { params }) {
  const key = params.id;
  const email = req.nextUrl.searchParams.get("email");

  if (!email)
    return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const catsList = readJSON("categories.json");
  let user = catsList.find(u => u.userEmail === email);

  // ⛔ FIX: Auto-create user if missing
  if (!user) {
    user = { userEmail: email, categories: [] };
    catsList.push(user);
  }

  user.categories = user.categories.filter(c => c !== key);
  writeJSON("categories.json", catsList);

  // clean items.json
  const itemsList = readJSON("items.json");
  let itemsUser = itemsList.find(u => u.userEmail === email);

  if (!itemsUser) {
    itemsUser = { userEmail: email, items: [] };
    itemsList.push(itemsUser);
  }

  itemsUser.items = itemsUser.items.map(it =>
    it.category === key ? { ...it, category: "" } : it
  );

  writeJSON("items.json", itemsList);

  return NextResponse.json({ success: true });
}
