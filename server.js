// server.js
require('dotenv').config(); // Load environment variables
const app = require('./app');
const { connectDB } = require('./config/db'); // MySQL connection

const PORT = process.env.PORT || 5000;

// Connect to database and then start the server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    console.error('❌ Server failed to start due to DB error:', err.message);
});
