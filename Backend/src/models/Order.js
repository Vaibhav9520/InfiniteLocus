import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String },
  price: { type: Number, default: 0 },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  items: { type: [OrderItemSchema], required: true, validate: v => v.length > 0 },
  status: { 
    type: String, 
    enum: ['pending','confirmed','processing','active','completed','cancelled','delivered','refunded'],
    default: 'pending'
  },
  notes: { type: String },
  cancelReason: { type: String },
  expiresAt: { type: Date },
}, { timestamps: true });

OrderSchema.index({ userId: 1, status: 1 });

export const Order = mongoose.model('Order', OrderSchema);
