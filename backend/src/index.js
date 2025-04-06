const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors"); 

const collection = require("./config");
const bcrypt = require("bcryptjs");

const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protectedRoutes");

dotenv.config();
const app = express();
const checkoutRoutes = require('./routes/checkout');
// Import payment routes
const paymentRoutes = require('./routes/payment');
const authenticate = require('./middleware/authMiddleware');


// Register payment API route


app.use(cors({
    origin: "http://localhost:3000", // Allow all origins temporarily (change in production)
   
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/dashboard", protectedRoutes);
app.use('/api/payment', paymentRoutes);

app.use('/api/checkout', checkoutRoutes);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Serve React frontend
app.use(express.static(path.join(__dirname, "../../frontend/build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/build", "index.html"));
});
// Test route to verify token
app.get('/api/test-token', authenticate, (req, res) => {
    res.json({ message: `Token is valid! User: ${req.user.username}` });
  });
  
// Use port 5001 from login system, or change if needed
const port = 5001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
