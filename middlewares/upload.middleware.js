const multer = require('multer');

// Use memory storage to keep file in buffer
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
