// /app/api/categories/route.js
import { readJSON, writeJSON } from "@/lib/db";
import { NextResponse } from "next/server";

// GET categories for user
export async function GET(req) {
  const email = req.nextUrl.searchParams.get("email");
  const categoriesList = readJSON("categories.json");

  const user = categoriesList.find(u => u.userEmail === email);
  return NextResponse.json(user ? user.categories : []);
}

// ADD category
export async function POST(req) {
  const { email, category } = await req.json();

  if (!email || !category) {
    return NextResponse.json(
      { success: false, message: "Missing category or email" },
      { status: 400 }
    );
  }

  const categoriesList = readJSON("categories.json");

  // find or create user block
  let user = categoriesList.find(u => u.userEmail === email);

  if (!user) {
    user = { userEmail: email, categories: [] };
    categoriesList.push(user);
  }

  // normalize category
  const normalized = category
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");

  // prevent duplicates
  if (!user.categories.includes(normalized)) {
    user.categories.push(normalized);
  }

  writeJSON("categories.json", categoriesList);

  return NextResponse.json({ success: true, categories: user.categories });
}
