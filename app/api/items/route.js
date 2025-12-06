import { connectDB } from "@/lib/mongodb";
import Item from "@/models/Item";

export async function POST(req) {
  await connectDB();
  const body = await req.json();
  await Item.create(body);
  return Response.json({ success: true });
}

export async function GET(req) {
  await connectDB();

  const email = req.nextUrl.searchParams.get("email");
  const items = await Item.find({ userEmail: email }).sort({ createdAt: -1 });

  return Response.json(items);
}
