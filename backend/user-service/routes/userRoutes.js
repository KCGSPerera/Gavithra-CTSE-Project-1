const express = require("express");
const { registerUser, getUserById, getAllUsers, updateUserById, deleteUserById, resetPassword } = require("../controllers/userController");

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Get all users
router.get("/", getAllUsers);

// Get a user by ID
router.get("/:id", getUserById);

// Update a user by ID
router.put("/:id", updateUserById);

// Reset password
router.put("/:id/reset-password", resetPassword);

// Delete a user by ID
router.delete("/:id", deleteUserById);


// router.post("/register", registerUser);
// router.get("/:id", getUserById);

module.exports = router;
