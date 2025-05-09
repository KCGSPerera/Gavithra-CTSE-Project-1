const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(express.json());
app.use(cors());

// app.use("/api/v1/product-service", productRoutes);
app.use("/product-service", productRoutes);


module.exports = app;
