const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let type = 'other';

        if (req.baseUrl.includes('character')) type = 'character';
        if (req.baseUrl.includes('pet')) type = 'pet';
        if (req.baseUrl.includes('vehicle')) type = 'vehicle';

        const folder = `uploads/${type}`;
        fs.mkdirSync(folder, { recursive: true });

        cb(null, folder);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `${Date.now()}${ext}`;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png/;
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype;

    if (allowed.test(ext) && allowed.test(mime)) {
        cb(null, true);
    } else {
        cb(new Error('Only jpg/jpeg/png images are allowed'));
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
