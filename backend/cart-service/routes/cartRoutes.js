const express = require("express");
const router = express.Router();
const {
  getAllCarts,
  getCartByUserId,
  getCartByUserName,
  addToCart,
  deleteCartByUserId,
  deleteCartByUserName
} = require("../controllers/cartController");

// All carts
router.get("/", getAllCarts);

// CRUD by userId
router.get("/user-id/:userId", getCartByUserId);
router.delete("/user-id/:userId", deleteCartByUserId);

// CRUD by userName
router.get("/user-name/:userName", getCartByUserName);
router.delete("/user-name/:userName", deleteCartByUserName);

// Add or update cart
router.post("/", addToCart);

module.exports = router;
