const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../controllers/db');
const cartController= require('../controllers/cart');
require('dotenv').config();

// Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

class authController {
    verifyToken(token) {
        try {
          if (!token) return null;
          const decoded = jwt.verify(token, JWT_SECRET);
          console.log("Decoded JWT:", decoded);
          return decoded;
        } catch (error) {
          console.error("JWT verification error:", error.message);
          return null;
        }
    }
    
    // Extract token from request (headers or cookies)
    getTokenFromRequest(req) {
        // Check Authorization header first
        if (req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                const token = authHeader.substring(7);
                console.log("Token found in Authorization header");
                return token;
            }
        }
        
        // Then check cookies as fallback
        if (req.cookies && req.cookies.token) {
            console.log("Token found in cookies");
            return req.cookies.token;
        }
        
        console.log("No token found in request");
        return null;
    }
    
    status = async (req, res) => {
        try {
            console.log("Status check - all cookies:", req.cookies);
            console.log("Status check - headers:", req.headers);
            console.log("Status check - authorization:", req.headers.authorization);
            
            // Get token from request (either header or cookie)
            const token = this.getTokenFromRequest(req);
            console.log("Status check - token found:", token ? "Yes" : "No");
        
            // Verify token
            const decoded = this.verifyToken(token);
            console.log("Status check - decoded token:", decoded);
            
            if (!decoded) {
              console.log("Status check - no valid token");
              return res.json({
                isAuthenticated: false,
                user: null
              });
            }
        
            // Get user data from database
            const [users] = await db.query(
              "SELECT id, name, email FROM Users WHERE id = ?",
              [decoded.id]
            );
            console.log("Status check - found user:", users[0] ? { id: users[0].id, email: users[0].email } : null);
        
            if (users.length === 0) {
              console.log("Status check - no user found in database");
              return res.json({
                isAuthenticated: false,
                user: null
              });
            }
        
            console.log("Status check - authentication successful");
            res.json({
              isAuthenticated: true,
              user: {
                id: users[0].id,
                name: users[0].name,
                email: users[0].email
              }
            });
        
          } catch (error) {
            console.error("Auth status check error:", error);
            res.status(500).json({
              isAuthenticated: false,
              error: "Error checking authentication status"
            });
          }
    };
    
    signup = async (req, res) => {
        try {
            const { name, email, password } = req.body;
            
            if (!name || !email || !password) {
                return res.status(400).json({ error: "Name, Email, and Password are required!" });
            }
    
            const EmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!EmailRegex.test(email)) {
                return res.status(400).json({ error: "Invalid Email format. Please enter a valid Email address." });
            }
            const [existingUser] = await db.query("SELECT * FROM Users WHERE Email = ? OR name = ?", [email, name]);
    
            if (existingUser.length > 0) {
                return res.status(400).json({ error: "User with this Email or Name already exists" });
            }
    
            const hashedPassword = await bcrypt.hash(password, 10);
    
            await db.query("INSERT INTO Users (name, Email, Password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
    
            res.status(201).json({ message: "User registered successfully" });
        } catch (error) {
            console.error("Registration Error:", error);
            res.status(500).json({ error: "Error registering user" });
        }
    };
    
   login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Login attempt with email:", email);
        console.log("Login - environment:", process.env.NODE_ENV || 'development');
        console.log("Login - origin:", req.headers.origin);
        
        const [users] = await db.query("SELECT * FROM Users WHERE email = ?", [email]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: "User not found. Please check your email." });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect password. Please try again." });
        }
        
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name }, 
            JWT_SECRET, 
            { expiresIn: "1h" }
        );
        
        // For HTTP environments
        const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https';
        console.log("Is HTTPS connection:", isHttps);
        
        // Cookie settings that work with HTTP
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Set to false for HTTP
            sameSite: 'lax', // Use 'lax' when not secure
            maxAge: 3600000,
            path: '/'
        });
        
        console.log("Cookie set with options:", {
            secure: false,
            sameSite: 'lax',
            isHttps: isHttps
        });
        
        // Merge Cart Logic
        try {
            const sessionId = req.sessionID;
            const { cart: sessionCart, items: sessionItems } = await cartController.fetchCartData(null, sessionId);
            console.log("Session Cart Data:", sessionCart);
            console.log("Session Cart Items:", sessionItems);
            if (sessionItems && sessionItems.length > 0) {
                console.log(`Merging ${sessionItems.length} items from session cart to user cart`);
                await cartController.mergeCarts(user.id, sessionCart, sessionId);
            } else {
                console.log("No session cart items to merge.");
            }
        } catch (cartError) {
            console.error("Cart merging error:", cartError);
            // Don't fail the login if cart merging fails
        }
        
        // Return token in response body for header-based auth
        res.status(200).json({ 
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            },
            token: token // Include token in response for client-side storage
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Error logging in" });
    }
};
    
    logout = async (req, res) => {
        // Use the same cookie options as when setting
        res.clearCookie('token', {
            httpOnly: true,
            secure: false, // Match the setting used when creating the cookie
            sameSite: 'lax', // Match the setting used when creating the cookie
            path: '/'
        });
        res.status(200).json({ message: "Logout successful" });
    };
    
    // Test endpoints for debugging
    checkToken = (req, res) => {
        console.log("Token check - cookies:", req.cookies);
        console.log("Token check - headers:", req.headers);
        
        // Get token from request (either header or cookie)
        const token = this.getTokenFromRequest(req);
        
        if (!token) {
            return res.json({
                hasToken: false,
                message: "No token found"
            });
        }
        
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            return res.json({
                hasToken: true,
                isValid: true,
                user: decoded,
                source: req.headers.authorization ? "header" : "cookie"
            });
        } catch (error) {
            return res.json({
                hasToken: true,
                isValid: false,
                error: error.message
            });
        }
    };
    
    setTestToken = (req, res) => {
        const testToken = jwt.sign(
            { id: 999, email: "test@example.com", name: "Test User" },
            JWT_SECRET,
            { expiresIn: "1h" }
        );
        
        res.cookie("token", testToken, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 3600000,
            path: '/'
        });
        
        res.json({
            message: "Test token set",
            cookieSet: true,
            environment: process.env.NODE_ENV || 'development',
            token: testToken // Include token in response for client to store
        });
    };
}

module.exports = new authController();