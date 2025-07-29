const multer = require('multer');

// Use memory storage to store uploaded files in buffer (RAM)
const storage = multer.memoryStorage();

// Filter to accept only image files (optional but recommended)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

// Configure multer
const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;
