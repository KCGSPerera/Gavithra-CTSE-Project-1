const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    items: [
      {
        pid: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        quantity: Number,
        unitPrice: Number,
        discountRate: Number,
        weight: Number,
        itemSubtotal: Number,
        itemShipping: Number,
      },
    ],
    shippingWeight: {
      type: Number,
      default: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    subtotal: Number,
    totalPrice: {
      type: Number,
      get: (v) => parseFloat(v.toFixed(2)),
      set: (v) => parseFloat(v.toFixed(2)),
    },
    status: {
      type: String,
      enum: ["Not Completed", "Completed"],
      default: "Not Completed",
    },
  },
  {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true },
  }
);

module.exports = mongoose.model("Cart", cartSchema);
