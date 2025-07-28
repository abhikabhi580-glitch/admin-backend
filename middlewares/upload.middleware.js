// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// const storage = new CloudinaryStorage({
//     cloudinary,
//     params: async (req, file) => {
//         let folder = "others";
//         if (req.baseUrl.includes("character")) folder = "character";
//         if (req.baseUrl.includes("pet")) folder = "pet";
//         if (req.baseUrl.includes("vehicle")) folder = "vehicle";

//         // Extract the resource ID from route params
//         const resourceId = req.params.id || Date.now(); // fallback if id not available

//         return {
//             folder: `admin-panel/${folder}`,
//             allowed_formats: ["jpg", "jpeg", "png", "webp"],
//             public_id: `${resourceId}`, // Use the ID as the filename
//             overwrite: true, // Optional, but ensures it replaces old file
//         };
//     }
// });

// const upload = multer({ storage });

// module.exports = upload;


const multer = require('multer');
const path = require('path');

// Store files temporarily in memory (or disk if preferred)
const storage = multer.diskStorage({
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, Date.now() + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Accept image only
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
