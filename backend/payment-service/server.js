require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

// Connect to MongoDB and Start Server
connectDB();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
