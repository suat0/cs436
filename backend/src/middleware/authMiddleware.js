const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, "your_secret_key"); 
        req.user = decoded; 
        next();
    } catch (error) {
        return res.status(401).json({ error: "Unauthorized: Invalid token" });
    }
};

const checkAuthentication = (req, res, next) => {
    const token = req.cookies.token;

    if (token) {
        try {
            const decoded = jwt.verify(token, "your_secret_key"); 
            req.user = decoded; 
        } catch (error) {
            return res.status(401).json({ error: "Unauthorized: Invalid token" });
        }
    }

    next();
};

module.exports.isAuthenticated = isAuthenticated;
module.exports.checkAuthentication = checkAuthentication;
