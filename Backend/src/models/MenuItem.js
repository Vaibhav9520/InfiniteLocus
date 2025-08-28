import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'General', index: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, index: true },
  imageUrl: { type: String, default: '' },
  available: { type: Boolean, default: true },
}, { timestamps: true });

MenuItemSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

export const MenuItem = mongoose.model('MenuItem', MenuItemSchema);
