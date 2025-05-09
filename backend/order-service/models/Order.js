const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
  cartId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Cart" },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);


// const mongoose = require("mongoose");

// const OrderSchema = new mongoose.Schema({
//   userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
//   orderItems: [
//     {
//       productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Product" },
//       quantity: { type: Number, required: true }
//     }
//   ],
//   shippingAddress: {
//     street: { type: String, required: true },
//     city: { type: String, required: true },
//     postalCode: { type: String, required: true },
//     country: { type: String, required: true }
//   },
//   totalAmount: { type: Number, required: true },
//   status: { type: String, enum: ["pending", "completed", "cancelled"], default: "pending" },
// }, { timestamps: true });

// module.exports = mongoose.model("Order", OrderSchema);
