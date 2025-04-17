const Payment = require("../models/Payment");


const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);
    res.status(201).json(payment);    
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.status(200).json(payment);
  }
  catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = { createPayment, getPayment };