const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  cartId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Cart",
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
}, { timestamps: true });

paymentSchema.pre("save", async function (next) {
    const cart = await Cart.findById(this.cartId);
    if (!cart) {
        const error = new Error("Cart not found");
        error.statusCode = 404;
        return next(error);
    }
    if (cart.totalPrice !== this.amount) {
        const error = new Error("Amount does not match cart total price");
        error.statusCode = 400;
        return next(error);
    }
    next();
}); 

module.exports = mongoose.model("Payment", paymentSchema);
