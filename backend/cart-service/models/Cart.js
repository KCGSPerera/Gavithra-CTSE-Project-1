const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, required: true }, // ✅ added support for userName
  items: [
    {
      productId: { type: String, required: true },
      name: String,
      quantity: Number,
      unitPrice: Number,
      weight: String,
      discountRate: { type: Number, default: 0 },
      subtotal: Number // Automatically calculated
    }
  ],
  totalPrice: {
    type: Number,
    get: (v) => parseFloat(v.toFixed(2)),
    set: (v) => parseFloat(v.toFixed(2))
  }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

module.exports = mongoose.model("Cart", cartSchema);
