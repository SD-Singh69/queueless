const mongoose = require('mongoose');

const queueEntrySchema = new mongoose.Schema({
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true,
    default: ''
  },
  tokenNumber: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'serving', 'served', 'cancelled'],
    default: 'waiting'
  },
  notifiedPosition3: {
    type: Boolean,
    default: false
  },
  notifiedTurn: {
    type: Boolean,
    default: false
  },
  servedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('QueueEntry', queueEntrySchema);
