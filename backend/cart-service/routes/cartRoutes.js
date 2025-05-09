const express = require("express");
const router = express.Router();
const {
  getAllCarts,
  getCartByUserId,
  addToCart,
  deleteCartByUserId,
  updateCart,
  markCartAsCompleted,
  getCartsByStatus,
  manualInventoryUpdate,
  getCartIdByUserId,
} = require("../controllers/cartController");

router.get("/", getAllCarts);
router.get("/:userid", getCartByUserId);
router.post("/", addToCart);
router.put("/:userid", updateCart);
router.delete("/:userid", deleteCartByUserId);

// ✅ New status-based routes
router.put("/:userid/complete", markCartAsCompleted);
router.get("/status/:status", getCartsByStatus);

// ✅ New manual inventory update route
router.put("/inventory-update/:pid", manualInventoryUpdate);

// Route to get cart ID by user ID
router.get("/:userid/cart-id", getCartIdByUserId);



module.exports = router;
