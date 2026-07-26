import mongoose from 'mongoose';
const shopSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true },
  address: { type: String, trim: true },
  averageServiceMinutes: { type: Number, default: 8, min: 1, max: 120 },
  isOpen: { type: Boolean, default: true }
}, { timestamps: true });
export default mongoose.model('Shop', shopSchema);
