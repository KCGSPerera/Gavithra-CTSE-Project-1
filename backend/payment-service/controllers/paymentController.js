// controllers/paymentController.js
const axios   = require("axios");
const Payment = require("../models/Payment");

const ORDER_API = process.env.ORDER_SERVICE_URL;  
// e.g. http://order-service:5004/api/v1/order-service

exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;

    // 🔥 Fetch the order over HTTP
    const { data: order } = await axios.get(`${ORDER_API}/${orderId}`);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const payment = await Payment.create({
      orderId: order._id,
      userId:  order.userId,
      amount:  order.totalAmount,
      method,
      status:  "pending",
    });

    res.status(201).json(payment);
  } catch (err) {
    console.error("initiatePayment:", err.response?.data || err.message);
    res.status(500).json({ error: "Payment initiation failed" });
  }
};

exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { status }    = req.body;

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      { status },
      { new: true }
    );
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    // 🔥 Notify order‑service of new status
    const newOrderStatus = status === "successful" ? "completed" : "cancelled";
    await axios.put(
      `${ORDER_API}/${payment.orderId}`,
      { status: newOrderStatus }
    );

    res.status(200).json(payment);
  } catch (err) {
    console.error("updatePaymentStatus:", err.response?.data || err.message);
    res.status(500).json({ error: "Payment status update failed" });
  }
};
