import { connectDB } from "@/lib/mongodb";
import Category from "@/models/Category";

export async function GET() {
  await connectDB();

  const categories = [
    "Food & Groceries",
    "Household Items / Supplies",
    "Personal Care",
    "Child Care",
    "Clothing & Accessories",
    "Medical & Healthcare",
    "Misc Items"
  ];

  await Category.deleteMany({});
  await Category.insertMany(categories.map((c) => ({ name: c })));

  return new Response("Categories seeded!");
}
