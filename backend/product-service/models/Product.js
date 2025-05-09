const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    weight: {type: Number,required: true},
    discountRate: {type: Number, default:0},
    imageUrl: { type: String },
    // stock: { type: Number, required: true, default: 0 }, // Include in Inventory service
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
