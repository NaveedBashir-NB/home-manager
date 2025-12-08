import { connectDB } from "@/lib/mongodb";

export async function GET() {
  await connectDB();

  // Static categories — no model needed
  const categories = [
    "Food & Groceries",
    "Household Items / Supplies",
    "Personal Care",
    "Child Care",
    "Clothing & Accessories",
    "Medical & Healthcare",
    "Misc Items"
  ];

  return new Response(JSON.stringify(categories), { status: 200 });
}
