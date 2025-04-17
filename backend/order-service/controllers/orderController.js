const axios = require("axios");
require("dotenv").config();
const Order = require("../models/Order");

// Helper to compare order items
const isSameOrder = (existingOrder, newOrder) => {
    const existingItems = JSON.stringify(existingOrder.orderItems.sort((a, b) => a.productId.toString().localeCompare(b.productId.toString())));
    const newItems = JSON.stringify(newOrder.orderItems.sort((a, b) => a.productId.localeCompare(b.productId)));
    return existingItems === newItems &&
        existingOrder.shippingAddress.street === newOrder.shippingAddress.street &&
        existingOrder.shippingAddress.city === newOrder.shippingAddress.city &&
        existingOrder.shippingAddress.postalCode === newOrder.shippingAddress.postalCode &&
        existingOrder.shippingAddress.country === newOrder.shippingAddress.country;
};

// Helper to get product price
const getProductPrice = async (productId) => {
    const url = `http://localhost:5003/api/v1/product-service/${productId}`;
    const response = await axios.get(url);
    return response.data.price; // Adjust if your API returns a different format
};

// Create a new order
// exports.createOrder = async (req, res) => {
//     try {
//         const { userId, orderItems, shippingAddress, totalAmount } = req.body;

//         // Check for existing identical order
//         const existingOrders = await Order.find({ userId });
//         const duplicate = existingOrders.find(order =>
//             isSameOrder(order, { orderItems, shippingAddress })
//         );

//         if (duplicate) {
//             return res.status(400).json({ message: "Duplicate order already exists." });
//         }

//         const newOrder = new Order({
//             userId,
//             orderItems,
//             shippingAddress,
//             totalAmount
//         });

//         await newOrder.save();
//         res.status(201).json(newOrder);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };
exports.createOrder = async (req, res) => {
    try {
        const { userId, orderItems, shippingAddress } = req.body;

        // Validate input
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "Order items are required" });
        }

        // Calculate total amount
        let totalAmount = 0;
        for (const item of orderItems) {
            const price = await getProductPrice(item.productId);
            totalAmount += price * item.quantity;
        }

        // Check for duplicate order (optional: same as before)
        const existingOrders = await Order.find({ userId });
        const isSameOrder = (existingOrder) => {
            const existingItems = JSON.stringify(existingOrder.orderItems.sort((a, b) => a.productId.toString().localeCompare(b.productId.toString())));
            const newItems = JSON.stringify(orderItems.sort((a, b) => a.productId.localeCompare(b.productId)));
            return existingItems === newItems &&
                existingOrder.shippingAddress.street === shippingAddress.street &&
                existingOrder.shippingAddress.city === shippingAddress.city &&
                existingOrder.shippingAddress.postalCode === shippingAddress.postalCode &&
                existingOrder.shippingAddress.country === shippingAddress.country;
        };

        const duplicate = existingOrders.find(order => isSameOrder(order));
        if (duplicate) {
            return res.status(400).json({ message: "Duplicate order already exists." });
        }

        // Create and save order
        const newOrder = new Order({
            userId,
            orderItems,
            shippingAddress,
            totalAmount
        });

        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Order creation failed:", error.message);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
};

// Get all orders
exports.getAllOrders1 = async (req, res) => {
    try {
        const orders = await Order.find().populate("userId", "name").populate("orderItems.productId", "name price");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("userId").populate("orderItems.productId");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("userId", "name")
            .populate("orderItems.productId", "name price");

        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order
exports.updateOrder = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete order
exports.deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: "Order not found" });
        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
