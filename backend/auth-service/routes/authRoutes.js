const express = require("express");
const { loginUser, validateToken } = require("../controllers/authController");

const router = express.Router();

router.post("/login", loginUser);
router.post("/validate", validateToken);

module.exports = router;
