// authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).redirect('/auth/signin');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user to request
        next();
    } catch (err) {
        res.clearCookie('token');
        return res.status(401).redirect('/auth/signin');
    }
};

module.exports = authenticate;