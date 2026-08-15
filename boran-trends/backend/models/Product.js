const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'Shirts',
        'T-Shirts',
        'baggy Jeans',
        'formal shirts',
        'Formal pants',
        'cargo pants',
        'hoodies',
        'New Arrivals',
      ],
    },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    sizes: [{ type: String }],
    colours: [{ type: String }],
    rating: { type: Number, default: 4.8 },
    description: { type: String, required: true },
    specifications: { type: Object, default: {} },
    stock: { type: Number, default: 20 },
    images: [{ type: String }],
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
