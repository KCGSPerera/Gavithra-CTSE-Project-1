const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/User");
require("dotenv").config();

// @desc User login
// @route POST /auth/login
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: "No User Found" });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(401).json({ error: "Invalid credentials" });

        console.log("🔐 Signing with secret:", process.env.JWT_SECRET);

        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ user,token });
    } catch (error) {
        res.status(500).json({ error: "Server error: " + error.message });
    }
};

// @desc Validate JWT
// @route POST /auth/validate
const validateToken = (req, res) => {
    const token = req.body.token;
    if (!token) return res.status(403).json({ error: "Token required" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ valid: true, user: decoded });
    } catch (err) {
        res.status(401).json({ valid: false, error: "Invalid token" });
    }
};

module.exports = { loginUser, validateToken };
