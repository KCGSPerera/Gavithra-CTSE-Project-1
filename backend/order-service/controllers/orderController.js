const axios = require("axios");
require("dotenv").config();
const mongoose = require("mongoose");
const Order = require("../models/Order");
const productServiceUrl = process.env.PRODUCT_SERVICE_URL || `http://product-service:5003/api/products`;


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
    // const url = `http://localhost:5003/product-service/${productId}`;
    const url = `${productServiceUrl}/${productId}`;
    const response = await axios.get(url);
    return response.data.price; // Adjust if your API returns a different format
};

// Create a new order
exports.createOrder1 = async (req, res) => {
    try {
        const { userId, orderItems, shippingAddress, totalAmount } = req.body;

        // Check for existing identical order
        const existingOrders = await Order.find({ userId });
        const duplicate = existingOrders.find(order =>
            isSameOrder(order, { orderItems, shippingAddress })
        );

        if (duplicate) {
            return res.status(400).json({ message: "Duplicate order already exists." });
        }

        const newOrder = new Order({
            userId,
            orderItems,
            shippingAddress,
            totalAmount
        });

        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.createOrder2 = async (req, res) => {
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

exports.createOrder3 = async (req, res) => {
  try {
    const { userId, cartId, shippingAddress } = req.body;

    // Validate required fields
    if (!userId || !cartId || !shippingAddress) {
      return res.status(400).json({ message: "userId, cartId, and shippingAddress are required." });
    }

    // Fetch cart details using cartId from the Cart Service
    // const cartServiceUrl = `${process.env.CART_SERVICE_URL}/${userId}`;
    // const response = await axios.get(`http://localhost:5006/cart-service/${userId}`);
    // const cartData = response.data;
    const cartServiceUrl = `${process.env.CART_SERVICE_URL}/${userId}`;
    const response = await axios.get(cartServiceUrl);
    const cartData = response.data;


    console.log("Cart Data:", cartData);

    // Check if cartId matches
    if (cartData._id !== cartId) {
      return res.status(400).json({ message: "Cart ID does not match the user's cart." });
    }

    // Extract total price
    const totalAmount = cartData.totalPrice;

    // Create order
    const order = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      cartId: new mongoose.Types.ObjectId(cartId),
      shippingAddress,
      totalAmount,
    });

    await order.save();

    // // Call Cart Service to update cart status
    // const updateCartUrl = `${process.env.CART_SERVICE_STATUS_UPDATE_URL}/${userId}/complete`;
    // await axios.put(updateCartUrl); 

    // Call Cart Service to update cart status to "Completed"
    const updateCartUrl = `${process.env.CART_SERVICE_STATUS_UPDATE_URL}/${cartId}`;
    await axios.put(updateCartUrl);

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error.message);
    res.status(500).json({ message: "Failed to create order", error: error.message });
  }
};

exports.createOrder4 = async (req, res) => {
  try {
    const { userId, cartId, shippingAddress } = req.body;

    // Validate required fields
    if (!userId || !cartId || !shippingAddress) {
      return res.status(400).json({ message: "userId, cartId, and shippingAddress are required." });
    }

    // Build cart service URL
    const cartServiceUrl = `${process.env.CART_SERVICE_URL}/${userId}`;
    console.log("➡️ Fetching cart from:", cartServiceUrl);
    console.log("🪪 Forwarding token:", req.headers.authorization);

    // Fetch cart details with Authorization header
    const response = await axios.get(cartServiceUrl, {
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    const cartData = response.data;
    console.log("🛒 Cart Data:", cartData);

    // Check if cartId matches
    if (cartData._id !== cartId) {
      return res.status(400).json({ message: "Cart ID does not match the user's cart." });
    }

    const totalAmount = cartData.totalPrice;

    // Create order
    const order = new Order({
      userId: new mongoose.Types.ObjectId(userId),
      cartId: new mongoose.Types.ObjectId(cartId),
      shippingAddress,
      totalAmount,
    });

    await order.save();
    console.log("✅ Order saved:", order._id);

    // Update cart status
    const updateCartUrl = `${process.env.CART_SERVICE_STATUS_UPDATE_URL}/${cartId}`;
    console.log("➡️ Updating cart status at:", updateCartUrl);

    await axios.put(updateCartUrl, null, {
      headers: {
        Authorization: req.headers.authorization,
      },
    });

    console.log("✅ Cart status updated for:", cartId);

    res.status(201).json(order);
  } catch (error) {
    console.error("🛑 Error creating order:", error.response?.data || error.message);
    res.status(500).json({
      message: "Failed to create order",
      error: error.response?.data || error.message,
    });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartId,
      shippingAddress,
      totalAmount,
      paymentStatus, // Optional
    } = req.body;

    if (!userId || !cartId || !shippingAddress || !totalAmount) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const newOrder = new Order({
      userId,
      cartId,
      shippingAddress,
      totalAmount,
      paymentStatus, // Defaults to "pending" if not provided
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order.', error });
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


exports.getAllOrders2 = async (req, res) => {
    try {
        const orders = await Order.find().populate("userId").populate("orderItems.productId");
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find();
    //   .populate("userId") // Adjust fields as needed
    //   .populate("cartId"); // Optional: populates entire cart if ref is correct

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
            // .populate("userId", "name")
            // .populate("orderItems.productId", "name price");

        if (!order) return res.status(404).json({ message: "Order not found" });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update order
exports.updateOrder1 = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrderAddress = async (req, res) => {
    try {
      // Validate the shippingAddress field
      const { shippingAddress } = req.body;
      if (!shippingAddress) {
        return res.status(400).json({ message: "Shipping address is required." });
      }
  
      // Find the order by ID and update only the shippingAddress field
      const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id, 
        { shippingAddress }, // Only update shippingAddress
        { new: true }
      );
  
      // Check if the order was found and updated
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      // Return the updated order
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order:", error.message);
      res.status(500).json({ message: "Failed to update order", error: error.message });
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

exports.completeOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
  
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: "completed" },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      res.json({ message: "Payment status updated to completed", order: updatedOrder });
    } catch (error) {
      console.error("Error updating payment status:", error.message);
      res.status(500).json({ message: "Failed to update payment status", error: error.message });
    }
  };

  exports.cancelOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
  
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: "cancelled" },
        { new: true }
      );
  
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json({ message: "Payment status updated to completed", order: updatedOrder });
    } catch (error) {
      console.error("Error updating payment status:", error.message);
      res.status(500).json({ message: "Failed to update payment status", error: error.message });
    }
  };
  
  exports.getCompletedOrders1 = async (req, res) => {
    try {
      const { userId } = req.query;
  
      // Build the query filter
      const filter = { paymentStatus: "completed" };
      if (userId) {
        filter.userId = userId;
      }
  
      const completedOrders = await Order.find(filter).sort({ createdAt: -1 }); // Latest first
  
      res.json(completedOrders);
    } catch (error) {
      console.error("Error fetching completed orders:", error.message);
      res.status(500).json({ message: "Failed to fetch completed orders", error: error.message });
    }
  };
  

  exports.getCompletedOrders = async (req, res) => {
    try {
      const { userId } = req.query;
  
      const filter = { paymentStatus: "completed" };
      if (userId) {
        filter.userId = userId;
      }
  
      const completedOrders = await Order.find(filter).sort({ createdAt: -1 });
  
      if (completedOrders.length === 0) {
        return res.status(200).json({ message: "No order history" });
      }
  
      res.json(completedOrders);
    } catch (error) {
      console.error("Error fetching completed orders:", error.message);
      res.status(500).json({ message: "Failed to fetch completed orders", error: error.message });
    }
  };
  