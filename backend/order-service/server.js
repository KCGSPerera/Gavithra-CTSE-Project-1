require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5004;

connectDB();

app.listen(PORT, () => {
    console.log(`Order Service is running on port ${PORT}`);
});
