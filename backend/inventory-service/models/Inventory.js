const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    pid: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Product",
    }, // Reference to Product model
    productId: { type: String, required: true, unique: true }, // ✅ Add unique constraint
    quantity: { type: Number, required: true, required: true }, // Total quantity received or available
    remainingQuantity: { type: Number}, // Stock left after cart/checkout
    date: { type: Date, default: Date.now }, // Automatically set current date
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);
