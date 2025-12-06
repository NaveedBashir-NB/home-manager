import mongoose from "mongoose";

const ItemSchema = new mongoose.Schema({
  userEmail: String,
  name: String,
  category: String,
  quantity: Number,
  notes: String,
}, { timestamps: true });

export default mongoose.models.Item || mongoose.model("Item", ItemSchema);
