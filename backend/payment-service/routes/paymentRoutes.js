const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/pay", paymentController.initiatePayment);
router.put("/status/:paymentId", paymentController.updatePaymentStatus);

module.exports = router;
