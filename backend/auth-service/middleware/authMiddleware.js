const jwt = require("jsonwebtoken");
require("dotenv").config();

const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) return res.status(403).json({ error: "Access Denied" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: "Invalid Token" });
    }
};

module.exports = authenticateToken;
