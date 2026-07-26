import mongoose from "mongoose";

const queueEntrySchema = new mongoose.Schema({
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
  },
  customerPhone: {
    type: String,
    trim: true,
    default: "",
  },
  token: {
    type: Number,
    required: true,
  },
  estimatedWait: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["waiting", "serving", "completed", "cancelled"],
    default: "waiting",
  },
  notifiedPosition3: {
    type: Boolean,
    default: false,
  },
  notifiedTurn: {
    type: Boolean,
    default: false,
  },
  servedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("QueueEntry", queueEntrySchema);
