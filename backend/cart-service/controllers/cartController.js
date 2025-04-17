const Cart = require("../models/Cart");

// Get all carts
exports.getAllCarts = async (req, res) => {
  const carts = await Cart.find();
  res.json(carts);
};

// Get cart by userId
exports.getCartByUserId = async (req, res) => {
  const cart = await Cart.findOne({ userId: req.params.userId });
  if (!cart) return res.status(404).json({ message: 'Cart not found by userId' });
  res.json(cart);
};

// Get cart by userName
exports.getCartByUserName = async (req, res) => {
  const cart = await Cart.findOne({ userName: req.params.userName });
  if (!cart) return res.status(404).json({ message: 'Cart not found by userName' });
  res.json(cart);
};

// Add or update cart
exports.addToCart = async (req, res) => {
  try {
    const { userId, userName, items } = req.body;

    // Calculate subtotal per item
    const updatedItems = items.map(item => {
      const priceAfterDiscount = item.unitPrice * (1 - (item.discountRate || 0) / 100);
      const subtotal = priceAfterDiscount * item.quantity;
      return {
        ...item,
        subtotal: parseFloat(subtotal.toFixed(2))
      };
    });

    // Calculate total price
    const totalPrice = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);

    let cart = await Cart.findOne({ userId });

    if (cart) {
      cart.items = updatedItems;
      cart.totalPrice = totalPrice;
      cart.userName = userName;
    } else {
      cart = new Cart({ userId, userName, items: updatedItems, totalPrice });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(500).json({ message: "Error saving cart", error });
  }
};

// Delete cart by userId
exports.deleteCartByUserId = async (req, res) => {
  const deleted = await Cart.findOneAndDelete({ userId: req.params.userId });
  if (!deleted) return res.status(404).json({ message: 'Cart not found to delete (by userId)' });
  res.json({ message: "Cart deleted (by userId)" });
};

// Delete cart by userName
exports.deleteCartByUserName = async (req, res) => {
  const deleted = await Cart.findOneAndDelete({ userName: req.params.userName });
  if (!deleted) return res.status(404).json({ message: 'Cart not found to delete (by userName)' });
  res.json({ message: "Cart deleted (by userName)" });
};
