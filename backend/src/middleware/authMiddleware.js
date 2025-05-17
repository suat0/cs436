const db = require("../controllers/db");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Use a proper secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

const isAuthenticated = (req, res, next) => {
  console.log("Auth check - Cookies:", req.cookies);
  console.log("Auth check - Headers:", req.headers);
  console.log("Auth check - Authorization Header:", req.headers.authorization);
  
  // Get token from various sources
  let token = null;
  
  // Check cookies first
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
    console.log("Token found in cookies");
  } 
  // Then check authorization header
  else if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
      console.log("Token found in Authorization header");
    }
  }
  // Check query parameter as fallback (not recommended for production)
  else if (req.query && req.query.token) {
    token = req.query.token;
    console.log("Token found in query parameters");
  }

  console.log("Final token value:", token ? "Token exists" : "No token found");

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Token verified successfully:", decoded);
    req.user = decoded; // Attach user data to request object
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ error: "Unauthorized: Invalid token", details: error.message });
  }
};

const checkAuthentication = (req, res, next) => {
  console.log("Check Auth - Cookies:", req.cookies);
  
  let token = null;
  
  // Check multiple sources for token
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  // This middleware doesn't block the request if no token is found
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      console.log("User authenticated in checkAuthentication:", decoded);
    } catch (error) {
      console.error("Token verification failed in checkAuthentication:", error.message);
      // We don't return an error here, just don't set req.user
    }
  } else {
    console.log("No token found in checkAuthentication");
  }

  next();
};

module.exports.isAuthenticated = isAuthenticated;
module.exports.checkAuthentication = checkAuthentication;