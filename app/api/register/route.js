import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const usersFile = path.join(process.cwd(), "data", "users.json");

export async function POST(req) {
  const body = await req.json();
  const { name, email, password } = body;

  const users = JSON.parse(fs.readFileSync(usersFile, "utf8"));

  const userExists = users.some((u) => u.email === email);

  if (userExists) {
    return NextResponse.json({ message: "User already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now(),
    name,
    email,
    password: hashedPassword,
  };

  users.push(newUser);
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

  return NextResponse.json({ message: "User registered successfully" });
}
