import { connectDB } from "@/lib/mongodb";
import Item from "@/models/Item";
import { ObjectId } from "mongodb";

export async function GET(req) {
  await connectDB();

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) return Response.json([], { status: 200 });

  const items = await Item.find({ userId: email }).sort({ createdAt: -1 });
  return Response.json(items);
}

export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.name || !body.category || !body.userId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await Item.create({
      name: body.name,
      description: body.description || "",
      category: body.category,
      status: body.status || "pending",
      userId: body.userId,
    });

    return Response.json(item, { status: 201 });
  } catch (error) {
    console.error("POST /api/items error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body.id || !body.userId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const updated = await Item.findOneAndUpdate(
      { _id: body.id, userId: body.userId },
      {
        name: body.name,
        description: body.description,
        category: body.category,
        status: body.status,
      },
      { new: true }
    );

    if (!updated) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    return Response.json(updated);
  } catch (error) {
    console.error("PUT error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}


export async function DELETE(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body.id || !body.userId) {
      return Response.json({ error: "Missing id or userId" }, { status: 400 });
    }

    const deleted = await Item.findOneAndDelete({
      _id: body.id,
      userId: body.userId,
    });

    if (!deleted) return Response.json({ error: "Item not found" }, { status: 404 });

    return Response.json({ message: "Item deleted" });
  } catch (error) {
    console.error("DELETE /api/items error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
  