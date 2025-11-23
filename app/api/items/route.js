// /app/api/items/route.js
import { readJSON, writeJSON } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req) {
  const email = req.nextUrl.searchParams.get("email");
  const itemsList = readJSON("items.json");

  const user = itemsList.find(u => u.userEmail === email);
  return NextResponse.json(user ? user.items : []);
}

export async function POST(req) {
  const { email, item } = await req.json();

  if (!email || !item) {
    return NextResponse.json(
      { success: false, message: "Missing email or item" },
      { status: 400 }
    );
  }

  const itemsList = readJSON("items.json");
  let user = itemsList.find(u => u.userEmail === email);

  // Auto-create user (same behavior as categories)
  if (!user) {
    user = { userEmail: email, items: [] };
    itemsList.push(user);
  }

  // Normalize category
  item.category = item.category
    ?.toLowerCase()
    ?.trim()
    ?.replace(/\s+/g, "-") || "";

  // Ensure unique ID
  item.id = item.id || Date.now().toString();

  user.items.push(item);
  writeJSON("items.json", itemsList);

  return NextResponse.json({ success: true, item });
}
