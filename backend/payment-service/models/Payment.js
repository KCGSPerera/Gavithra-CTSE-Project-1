const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["card", "cash", "upi"], required: true },
  status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Payment", PaymentSchema);
