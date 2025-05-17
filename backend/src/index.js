const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors"); 
const orderRoutes = require('./routes/orders');
const session = require("express-session");

const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const cartRoutes = require("./routes/cart");
const checkoutRoutes = require('./routes/checkout');
const paymentRoutes = require('./routes/payment');

const authenticate = require('./middleware/authMiddleware').isAuthenticated;
const invoiceRoutes = require('./routes/invoice');

const commentRoutes = require("./routes/comments");
const ratingRoutes = require("./routes/ratings"); 



// Register payment API route
dotenv.config();
const app = express();
app.set('trust proxy', 1);
const allowedOrigins = [
  'http://34.32.72.13',       // Your frontend origin
  'https://34.32.72.13',      // Add HTTPS version
  'http://localhost:3000'     // Local development
];
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS: ", origin); // Add logging
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ 
  secret: process.env.SESSION_SECRET || "your_secret_key", 
  resave: false, 
  saveUninitialized: false, // Change to false to avoid creating empty sessions
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only secure in production
    httpOnly: true,
    sameSite: 'none', // Change from 'lax' to 'none' for cross-origin
    maxAge: 24 * 60 * 60 * 1000 // 1 day in milliseconds
  }
}));

app.use("/auth", authRoutes);
app.use('/api/orders', orderRoutes);

//app.use(authenticate);
app.use('/api/payment', paymentRoutes);

app.use('/api/checkout', checkoutRoutes);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/invoices', invoiceRoutes);

app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);

app.get('/ege/status', (req, res) => {
  res.status(200).json({ status: 'VER:11' });
});

app.get('/debug/cookies', (req, res) => {
  res.json({
    cookies: req.cookies,
    signedCookies: req.signedCookies,
    headers: req.headers
  });
});

app.get('/debug/session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    user: req.user
  });
});

// Test setting a cookie
app.get('/set-test-cookie', (req, res) => {
  res.cookie('testCookie', 'testValue', { 
    httpOnly: false, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none'
  });
  res.json({ message: 'Test cookie set!' });
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
