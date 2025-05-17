const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../controllers/db"); 
const rateLimit = require("express-rate-limit");
const authController= require("../controllers/auth");

const router = express.Router();

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Allow only 5 login attempts per IP
    message: { error: "Too many failed login attempts. Please try again later." },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false, // Disable X-RateLimit headers (use standard headers instead)
});

// Auth status check
router.get('/status', authController.status);

router.post("/signup", authController.signup);
router.post("/login",[loginLimiter], authController.login);

router.post("/logout", authController.logout);


module.exports = router;
