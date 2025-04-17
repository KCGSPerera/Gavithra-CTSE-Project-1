const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true }, // ✅ Add unique constraint
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true },          // Total quantity received or available
  remainingQuantity: { type: Number, required: true }, // Stock left after cart/checkout
  unitPrice: { type: Number, required: true },
  weight: { type: String },                            // e.g., "500g", "1kg"
  discountRate: { type: Number, default: 0 },          // e.g., 10 for 10%
  date: { type: Date, default: Date.now }              // Automatically set current date
}, {
  timestamps: true
});

module.exports = mongoose.model('Inventory', inventorySchema);
