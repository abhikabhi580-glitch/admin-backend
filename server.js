require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

// MySQL connection check
db.connect((err) => {
    if (err) {
        console.error('❌ MySQL connection error:', err.message);
        process.exit(1);
    }

    console.log('✅ Connected to MySQL');

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
});
