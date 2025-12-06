import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();
  const { name, email, password } = await req.json();

  const exists = await User.findOne({ email });
  if (exists) {
    return new Response(JSON.stringify({ message: "Email already exists" }), { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await User.create({ name, email, password: hashed });

  return new Response(JSON.stringify({ message: "User created" }), { status: 201 });
}
