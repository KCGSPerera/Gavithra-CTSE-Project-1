const express = require("express");
const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/order-service", orderRoutes);

module.exports = app;
