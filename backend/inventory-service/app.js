const express = require('express');
const cors = require('cors');
const inventoryRoutes = require('./routes/inventoryRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Log every incoming request
app.use((req, res, next) => {
    console.log(`📥 Received request at path: ${req.method} ${req.originalUrl}`);
    next();
  });


// Routes
app.use('/inventory-service', inventoryRoutes);


// ✅ Global error handler – MUST be after all routes and middleware
app.use((err, req, res, next) => {
  console.error("🔥 Express error handler caught:", err.message);
  res.status(400).json({ error: "Invalid request body" });
});

module.exports = app;
