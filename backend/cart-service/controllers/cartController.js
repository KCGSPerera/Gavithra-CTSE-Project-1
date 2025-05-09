const Cart = require("../models/Cart");
const axios = require("axios");

// const updateInventoryQuantity = async (pid, quantityChange, req) => {
//   try {
//     const res = await axios.get(
//       `http://api-gateway:8080/api/inventories/inventory-service/pid/${pid}`,
//       {
//         headers: {
//           Authorization: req.headers.authorization || '',
//           'x-internal-service': 'true'
//         }
//       }
//     );

//     const item = res.data;

//     if (!item || typeof item.remainingQuantity !== 'number') {
//       throw new Error(`Invalid inventory item or missing remainingQuantity for PID ${pid}`);
//     }

//     const newRemaining = item.remainingQuantity + quantityChange;

//     // 🟢 Just update remainingQuantity
//     await axios.put(
//       `http://api-gateway:8080/api/inventories/inventory-service/pid/${pid}`,
//       {
//         remainingQuantity: newRemaining
//       },
//       {
//         headers: {
//           Authorization: req.headers.authorization || '',
//           'x-internal-service': 'true'
//         }
//       }
//     );

//     console.log(`✅ Inventory updated for PID ${pid}: newRemaining = ${newRemaining}`);
//   } catch (error) {
//     console.error(`❌ Inventory update failed for PID ${pid}:`, error.response?.data || error.message);
//   }
// };


// Get all carts



// ✅ Fixed: include both quantity and remainingQuantity to avoid CastError

// ✅ Fixed: include both quantity and remainingQuantity to avoid CastError
// ✅ updateInventoryQuantity with direction (increase or decrease)
// ✅ Final: Direct calculation based on current inventory and quantity change
// ✅ updateInventoryQuantity – Send only the quantity delta, let backend add it
const updateInventoryQuantity = async (pid, quantityChange, req) => {
  try {
    // Step 1: Fetch inventory item (for safety/logging only)
    const res = await axios.get(
      `http://api-gateway.ecommerce-namespace:8080/api/inventories/inventory-service/pid/${pid}`,
      {
        headers: {
          Authorization: req.headers.authorization || '',
          'x-internal-service': 'true'
        }
      }
    );

    const item = res.data;

    if (!item || typeof item.remainingQuantity !== 'number') {
      throw new Error(`Invalid inventory item or missing fields for PID ${pid}`);
    }

    // Step 2: PUT only quantity delta (backend adds to both quantity + remainingQuantity)
    await axios.put(
      `http://api-gateway.ecommerce-namespace:8080/api/inventories/inventory-service/pid/${pid}`,
      {
        quantity: quantityChange // backend adds this to current quantity + remainingQuantity
      },
      {
        headers: {
          Authorization: req.headers.authorization || '',
          'x-internal-service': 'true'
        }
      }
    );
  } catch (error) {
    console.error(`❌ Inventory update failed for PID ${pid}:`, error.message);
    throw new Error(`Inventory update failed for PID ${pid}`);
  }
};

exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find();
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get cart by userId
exports.getCartByUserId = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userid: req.params.userid });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete cart by userId and restore inventory
exports.deleteCartByUserId = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userid: req.params.userid });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found to delete" });
    }

    // ✅ Restore inventory quantities
    for (const item of cart.items) {
      // Increase remainingQuantity back when deleting
      await updateInventoryQuantity(item.pid, item.quantity, req);
    }

    // Delete cart
    await Cart.deleteOne({ userid: req.params.userid });
    res.json({ message: "Cart deleted and inventory restored" });
  } catch (error) {
    console.error("❌ Failed to delete cart or restore inventory:", error.message);
    res.status(500).json({ message: error.message });
  }
};


// Add or update cart
// exports.addToCart = async (req, res) => {
//   try {
//     const { userid, items } = req.body;

//     let subtotal = 0;
//     let shippingCost = 0;
//     let shippingWeight = 0;

//     // Restore inventory from old cart
//     const oldCart = await Cart.findOne({ userid });
//     if (oldCart) {
//       for (const oldItem of oldCart.items) {
//         await updateInventoryQuantity(oldItem.pid, oldItem.quantity, req);
//       }
//     }

//     const enrichedItems = await Promise.all(
//       items.map(async (item) => {
//         // Get product details
//         // const productRes = await axios.get(`http://localhost:8085/api/products/product-service/${item.pid}`);
//         const productRes = await axios.get(
//           `http://api-gateway:8080/api/products/product-service/${item.pid}`,
//           {
//             headers: {
//               Authorization: req.headers.authorization || "", // Pass token from frontend
//               "x-internal-service": "true", // Optional fallback for internal microservice communication
//             },
//           }
//         );

//         const product = productRes.data;

//         const unitPrice = product.price;
//         const discountRate = product.discountRate || 0;
//         const weight = product.weight;

//         const priceAfterDiscount = unitPrice * (1 - discountRate / 100);
//         const itemSubtotal = priceAfterDiscount * item.quantity;

//         const itemWeight = weight * item.quantity;
//         const itemShipping = Math.ceil(itemWeight / 100) * 5;

//         subtotal += itemSubtotal;
//         shippingCost += itemShipping;
//         shippingWeight += itemWeight;

//         await updateInventoryQuantity(item.pid, -item.quantity, req);

//         return {
//           pid: item.pid,
//           quantity: item.quantity,
//           unitPrice,
//           discountRate,
//           weight,
//           itemSubtotal: parseFloat(itemSubtotal.toFixed(2)),
//           itemShipping,
//         };
//       })
//     );

//     const totalPrice = parseFloat((subtotal + shippingCost).toFixed(2));

//     let cart = await Cart.findOne({ userid });

//     if (cart) {
//       cart.items = enrichedItems;
//       cart.subtotal = parseFloat(subtotal.toFixed(2));
//       cart.shippingWeight = shippingWeight;
//       cart.shippingCost = shippingCost;
//       cart.totalPrice = totalPrice;
//     } else {
//       cart = new Cart({
//         userid,
//         items: enrichedItems,
//         subtotal: parseFloat(subtotal.toFixed(2)),
//         shippingWeight,
//         shippingCost,
//         totalPrice,
//       });
//     }

//     await cart.save();
//     res.status(200).json(cart);
//   } catch (error) {
//     console.error("Add to Cart Error:", error.message);
//     res
//       .status(500)
//       .json({ message: "Error saving cart", error: error.message });
//   }
// };

// ✅ addToCart function (no changes needed, already passes req)
exports.addToCart = async (req, res) => {
  try {
    const { userid, items } = req.body;

    let subtotal = 0;
    let shippingCost = 0;
    let shippingWeight = 0;

    // Restore inventory from old cart
    const oldCart = await Cart.findOne({ userid });
    if (oldCart) {
      for (const oldItem of oldCart.items) {
        await updateInventoryQuantity(oldItem.pid, oldItem.quantity, req);
      }
    }

    const enrichedItems = await Promise.all(items.map(async (item) => {
      const productRes = await axios.get(
        `http://api-gateway.ecommerce-namespace:8080/api/products/product-service/${item.pid}`,
        {
          headers: {
            Authorization: req.headers.authorization || '',
            'x-internal-service': 'true'
          }
        }
      );

      const product = productRes.data;
      const unitPrice = product.price;
      const discountRate = product.discountRate || 0;
      const weight = product.weight;

      const priceAfterDiscount = unitPrice * (1 - discountRate / 100);
      const itemSubtotal = priceAfterDiscount * item.quantity;

      const itemWeight = weight * item.quantity;
      const itemShipping = Math.ceil(itemWeight / 100) * 5;

      subtotal += itemSubtotal;
      shippingCost += itemShipping;
      shippingWeight += itemWeight;

      await updateInventoryQuantity(item.pid, -item.quantity, req);

      return {
        pid: item.pid,
        quantity: item.quantity,
        unitPrice,
        discountRate,
        weight,
        itemSubtotal: parseFloat(itemSubtotal.toFixed(2)),
        itemShipping
      };
    }));

    const totalPrice = parseFloat((subtotal + shippingCost).toFixed(2));

    let cart = await Cart.findOne({ userid });

    if (cart) {
      cart.items = enrichedItems;
      cart.subtotal = parseFloat(subtotal.toFixed(2));
      cart.shippingWeight = shippingWeight;
      cart.shippingCost = shippingCost;
      cart.totalPrice = totalPrice;
    } else {
      cart = new Cart({
        userid,
        items: enrichedItems,
        subtotal: parseFloat(subtotal.toFixed(2)),
        shippingWeight,
        shippingCost,
        totalPrice
      });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Add to Cart Error:", error.message);
    res.status(500).json({ message: "Error saving cart", error: error.message });
  }
};

// Update cart using PUT
exports.updateCart = async (req, res) => {
  req.body.userid = req.params.userid;
  return exports.addToCart(req, res);
};

// ✅ Update Cart Status to Completed
exports.markCartAsCompleted = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userid: req.params.userid },
      { status: "Completed" },
      { new: true }
    );
    if (!cart)
      return res
        .status(404)
        .json({ message: "Cart not found to mark as completed" });
    res.json({ message: "Cart marked as completed", cart });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all carts by status
exports.getCartsByStatus = async (req, res) => {
  try {
    const carts = await Cart.find({ status: req.params.status });
    res.json(carts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Manually update remaining quantity via route
exports.manualInventoryUpdate = async (req, res) => {
  const { pid } = req.params;
  const { quantityChange } = req.body;

  if (typeof quantityChange !== "number") {
    return res.status(400).json({ message: "quantityChange must be a number" });
  }

  try {
    const response = await axios.get(
      `http://localhost:8085/api/inventories/inventory-service/pid/${pid}`
    );
    const item = response.data;

    const newRemaining = item.remainingQuantity + quantityChange;

    const updated = await axios.put(
      `http://localhost:8085/api/inventories/inventory-service/pid/${pid}`,
      {
        remainingQuantity: newRemaining,
      }
    );

    res.status(200).json({
      message: "Inventory updated successfully",
      updated: updated.data,
    });
  } catch (error) {
    console.error(`Inventory update failed for ${pid}:`, error.message);
    res
      .status(500)
      .json({ message: "Inventory update failed", error: error.message });
  }
};

// Get only the cart ID by userId
exports.getCartIdByUserId = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userid: req.params.userid }).select(
      "_id"
    );
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.json({ cartId: cart._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateCartStatusHansanie = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return res.status(400).json({ message: "Cart ID is required" });
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      cartId,
      { status: "Completed" },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    res.status(200).json({
      message: "Cart status updated to Completed",
      cart: updatedCart,
    });
  } catch (error) {
    console.error("Error updating cart status:", error.message);
    res
      .status(500)
      .json({ message: "Failed to update cart status", error: error.message });
  }
}
