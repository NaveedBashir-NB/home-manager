// /app/api/items/[id]/route.js
import { readJSON, writeJSON } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const id = Number(params.id);
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const itemsList = readJSON("items.json");
  const user = itemsList.find(u => u.userEmail === email);
  const item = user ? user.items.find(i => i.id === id) : null;
  return NextResponse.json(item || null);
}

export async function PUT(req, { params }) {
  const id = Number(params.id);
  const body = await req.json(); // expect { email, item } where item contains updated fields
  const { email, item } = body;
  if (!email || !item) return NextResponse.json({ error: "Missing email or item" }, { status: 400 });

  const itemsList = readJSON("items.json");
  const user = itemsList.find(u => u.userEmail === email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const idx = user.items.findIndex(i => i.id === id);
  if (idx === -1) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  // Merge update
  user.items[idx] = { ...user.items[idx], ...item, id }; 
  writeJSON("items.json", itemsList);

  return NextResponse.json({ success: true, item: user.items[idx] });
}

export async function DELETE(req, { params }) {
  const id = Number(params.id);
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const itemsList = readJSON("items.json");
  const user = itemsList.find(u => u.userEmail === email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const updated = user.items.filter(i => i.id !== id);
  user.items = updated;
  writeJSON("items.json", itemsList);

  return NextResponse.json({ success: true });
}
