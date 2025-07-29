const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: '🛑 No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Now req.user.id, req.user.email, etc., will be available
        next();
    } catch (err) {
        return res.status(403).json({ message: '🛑 Invalid or expired token' });
    }
};
