const db = require('../controllers/db'); 
const authenticate = require('../middleware/authMiddleware');
const router = require('../routes/auth');
// Mask card details to protect sensitive data
const maskCardNumber = (cardNumber) => {
    return cardNumber.slice(0, 4) + '********' + cardNumber.slice(-4);
  };
  
  // Validate Card Number Format (Basic Check)
  const validateCardNumber = (cardNumber) => {
    return /^\d{16}$/.test(cardNumber);
  };
  
  // Validate CVV Format (3 or 4 digits)
  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };
  
  // Validate Expiry Date (Format MM/YY or MM/YYYY)
  const validateExpiryDate = (expiryDate) => {
    const regex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
    return regex.test(expiryDate);
  };

  exports.checkout= async (req,res) =>{ 
    try {
        const { cartItems, paymentMethod, address, paymentDetails } = req.body;
    
        console.log('Received Checkout Request:', req.body); 
    
        if (!cartItems || cartItems.length === 0) {
          return res.status(400).json({ error: 'Your cart is empty!' });
        }
    
        if (!paymentMethod || !address) {
          return res.status(400).json({ error: 'Payment method and address are required!' });
        }
    
        // Validate Payment Details
        if (
          !validateCardNumber(paymentDetails.cardNumber) ||
          !validateCVV(paymentDetails.cvv) ||
          !validateExpiryDate(paymentDetails.expiryDate)
        ) {
          return res.status(400).json({ error: 'Invalid payment details.' });
        }
    
        // Mask card details before storing (do not store full card details)
        const maskedCardNumber = maskCardNumber(paymentDetails.cardNumber);
    
        // Start transaction
        await db.query('START TRANSACTION');
    
        // Calculate total price
        let totalPrice = 0;
        const productData = []; // Store product data for inserting order items
    
        for (const item of cartItems) {
          const [product] = await db.query('SELECT * FROM products WHERE id = ?', [item.productId]);
          console.log('Product Query Result:', product); 
    
          if (!product || product.length === 0 || product[0].quantity < item.quantity) {
            await db.query('ROLLBACK');
            return res.status(400).json({ error: `Product with ID ${item.productId} is out of stock!` });
          }
    
          totalPrice += product[0].price * item.quantity;
          productData.push({
            productId: item.productId,
            quantity: item.quantity,
            price: product[0].price, // Correct price from product
          });
        }
    
        console.log('Total Price Calculated:', totalPrice); 
    
        // Insert order into the database
        const [orderResult] = await db.query(
          'INSERT INTO orders (user_id, total_price, payment_method, address, status, masked_card_number) VALUES (?, ?, ?, ?, ?, ?)',
          [req.user.id, totalPrice, paymentMethod, address, 'processing', maskedCardNumber]
        );
    
        const orderId = orderResult.insertId;
        console.log('Order Insert Result:', orderResult); 
    
        // Insert order items and update product quantity
        for (const item of productData) {
          await db.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.productId, item.quantity, item.price]
          );
    
          // Update product quantity after order
          await db.query(
            'UPDATE products SET quantity = quantity - ? WHERE id = ? AND quantity >= ?',
            [item.quantity, item.productId, item.quantity]
          );
    
          // Check if quantity went below 0 after update
          const [updatedProduct] = await db.query(
            'SELECT quantity FROM products WHERE id = ?',
            [item.productId]
          );
    
          if (updatedProduct[0].quantity < 0) {
            // Rollback transaction if product goes negative
            await db.query('ROLLBACK');
            throw new Error(`Product ${item.productId} is out of stock after update.`);
          }
        }
    
        // Commit the transaction
        await db.query('COMMIT');
    
        res.status(201).json({ message: 'Order placed successfully!', orderId });
      } catch (error) {
        console.error('Checkout Error Details:', error); 
        await db.query('ROLLBACK');
        res.status(500).json({ error: 'Something went wrong during checkout.' });
      }
    };




  