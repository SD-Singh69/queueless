import mongoose from 'mongoose';
const queueEntrySchema = new mongoose.Schema({
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: Number, required: true },
  status: { type: String, enum: ['waiting', 'serving', 'completed', 'cancelled'], default: 'waiting' },
  estimatedWait: { type: Number, default: 0 },
  servedAt: Date
}, { timestamps: true });
queueEntrySchema.index({ shop: 1, token: 1 }, { unique: true });
export default mongoose.model('QueueEntry', queueEntrySchema);
