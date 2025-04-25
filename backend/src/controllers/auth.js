const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../controllers/db');
const cartController= require('../controllers/cart');

class authController {
    verifyToken(token) {
        try {
          if (!token) return null;
          const decoded = jwt.verify(token, "your_secret_key");
          console.log("Decoded JWT:", decoded);
          return decoded;
        } catch (error) {
          console.error("JWT verification error:", error.message);
          return null;
        }
      }
    status = async (req, res) => {
        try {
            console.log("Status check - all cookies:", req.cookies);
            const token = req.cookies.token;
            console.log("Status check - token from cookies:", token);
        
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
            //console.log("Request Body:", req.body); 
    
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
            console.error(" Registration Error:", error);
            res.status(500).json({ error: "Error registering user" });
        }
    };
    login = async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log("Login attempt with email:", email);
            
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
                "your_secret_key", 
                { expiresIn: "1h" }
            );
            
            res.cookie("token", token, {
                httpOnly: true,
                secure: false,  // Set to true in production with HTTPS
                sameSite: 'lax',
                maxAge: 3600000,
                path: '/'
            });

            // Merge Cart Logic
            const sessionId = req.sessionID;
            const { cart: sessionCart, items: sessionItems } = await cartController.fetchCartData(null, sessionId);
            console.log("Session Cart Data:", sessionCart);
            console.log("Session Cart Items:", sessionItems);
            if (sessionItems.length > 0) {
                console.log(`Merging ${sessionItems.length} items from session cart to user cart`);
                await cartController.mergeCarts(user.id, sessionCart, sessionId);
            } else {
                console.log("No session cart items to merge.");
            }

            res.status(200).json({ 
                success: true,
                message: "Login successful",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (error) {
            console.error("Login Error:", error);
            res.status(500).json({ error: "Error logging in" });
        }
    };  
    logout = async (req, res) => {
        res.clearCookie('token');
        res.status(200).json({ message: "Logout successful" });
    };    
}

module.exports = new authController();
