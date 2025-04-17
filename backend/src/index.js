const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");


const authRoutes = require("./routes/auth");
const protectedRoutes = require("./routes/protectedRoutes");
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const cartRoutes = require("./routes/cart");
const ratingsRoutes = require('./routes/ratings');
const commentsRoutes = require('./routes/comments');
const checkoutRoutes = require('./routes/checkout');
const paymentRoutes = require('./routes/payment');
const orderRoutes = require('./routes/orders');
const authenticate = require('./middleware/authMiddleware');

dotenv.config();
const app = express();

app.use(cors({
    origin: "http://localhost:3000", // Allow all origins temporarily (change in production)
   
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: process.env.SESSION_SECRET || "your_secret_key", resave: false, saveUninitialized: true, }));

app.use("/auth", authRoutes);
app.use("/dashboard", protectedRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/ratings', ratingsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/orders', orderRoutes);

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
