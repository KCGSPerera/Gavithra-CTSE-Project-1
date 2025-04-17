require("dotenv").config();
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5003;

connectDB();

app.listen(PORT, () => {
    console.log(`Product Service is running on port ${PORT}`);
});
