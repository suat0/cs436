const db = require('../controllers/db');
const { validationResult } = require('express-validator');

class CartController {
  // Helper: determine cart identifier (user_id for logged in, session_id for guests)
  getIdentifier(req) {
    if (req.user && req.user.id !== undefined) {
      return { type: 'user', value: req.user.id };
    }
    if (!req.sessionID) {
      throw new Error('Session ID is undefined. Ensure session middleware is properly configured.');
    }
    return { type: 'session', value: req.sessionID };
  }

// Get the current cart (or create one) and its items with nested product details
async getCart(req, res) {
  try {
    const { type, value } = this.getIdentifier(req);
    let query, params;
    if (type === 'user') {
      query = 'SELECT * FROM Shopping_Cart WHERE user_id = ?';
      params = [value];
    } else {
      query = 'SELECT * FROM Shopping_Cart WHERE session_id = ?';
      params = [value];
    }
    const [rows] = await db.execute(query, params);
    let cart;
    if (rows.length === 0) {
      // Create a new cart for the identifier
      if (type === 'user') {
        query = 'INSERT INTO Shopping_Cart (user_id) VALUES (?)';
      } else {
        query = 'INSERT INTO Shopping_Cart (session_id) VALUES (?)';
      }
      params = [value];
      await db.execute(query, params);
      // Retrieve the newly created cart
      if (type === 'user') {
        query = 'SELECT * FROM Shopping_Cart WHERE user_id = ?';
      } else {
        query = 'SELECT * FROM Shopping_Cart WHERE session_id = ?';
      }
      const [newRows] = await db.execute(query, [value]);
      cart = newRows[0];
    } else {
      cart = rows[0];
    }
    // Retrieve cart items along with product details by joining with Products
    query = `
      SELECT 
        ci.id as id, 
        ci.cart_id, 
        ci.product_id, 
        ci.quantity,
        p.name, 
        p.price, 
        p.image_url, 
        p.description
      FROM Cart_Items ci
      JOIN Products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `;
    params = [cart.id];
    const [rowsItems] = await db.execute(query, params);
    // Map each row into an item with a nested product object
    const items = rowsItems.map(row => ({
      id: row.id,
      cart_id: row.cart_id,
      product_id: row.product_id,
      quantity: row.quantity,
      product: {
        name: row.name,
        price: row.price,
        image_url: row.image_url,
        description: row.description
      }
    }));
    return res.status(200).json({ success: true, cart, items });
  } catch (error) {
    console.error('Error fetching cart:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}



  // Add an item to the cart
  async addItem(req, res) {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      const { product_id, quantity } = req.body;
      const { type, value } = this.getIdentifier(req);
      let query, params;

      // Get stock info for the product
      const [productRows] = await db.execute(
        'SELECT quantity_in_stock FROM Products WHERE id = ?',
        [product_id]
      );
  
      if (productRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      const stockAvailable = productRows[0].quantity_in_stock;

      // Retrieve the existing cart
      if (type === 'user') {
        query = 'SELECT * FROM Shopping_Cart WHERE user_id = ?';
        params = [value];
      } else {
        query = 'SELECT * FROM Shopping_Cart WHERE session_id = ?';
        params = [value];
      }
      const [rows] = await db.execute(query, params);
      let cart;
      if (rows.length === 0) {
        // Create a new cart if one doesn't exist (without created_at and updated_at)
        if (type === 'user') {
          query = 'INSERT INTO Shopping_Cart (user_id) VALUES (?)';
        } else {
          query = 'INSERT INTO Shopping_Cart (session_id) VALUES (?)';
        }
        params = [value];
        await db.execute(query, params);
        // Retrieve the new cart
        if (type === 'user') {
          query = 'SELECT * FROM Shopping_Cart WHERE user_id = ?';
        } else {
          query = 'SELECT * FROM Shopping_Cart WHERE session_id = ?';
        }
        const [newRows] = await db.execute(query, [value]);
        cart = newRows[0];
      } else {
        cart = rows[0];
      }
      // Check if the product already exists in the cart
      const [existingItems] = await db.execute(
        'SELECT * FROM Cart_Items WHERE cart_id = ? AND product_id = ?',
        [cart.id, product_id]
      );

      let item;
      if (existingItems.length > 0) {
        // Update the quantity if the item exists
        item = existingItems[0];
        const newQuantity = parseInt(item.quantity) + parseInt(quantity);

        if (newQuantity > stockAvailable) {
          return res.status(400).json({
            success: false,
            message: `Cannot add more than ${stockAvailable} units of this product to the cart`
          });
        }

        await db.execute('UPDATE Cart_Items SET quantity = ? WHERE id = ?', [newQuantity, item.id]);
        item.quantity = newQuantity;
      } else {

        if (parseInt(quantity) > stockAvailable) {
          return res.status(400).json({
            success: false,
            message: `Only ${stockAvailable} units of this product are available`
          });
        }
        // Insert a new cart item
        const [result] = await db.execute(
          'INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
          [cart.id, product_id, quantity]
        );
        item = { id: result.insertId, cart_id: cart.id, product_id, quantity };
      }
      return res.status(200).json({ success: true, message: 'Item added to cart', item });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while adding item to cart',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update a cart item's quantity
  async updateItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      const { cartId, itemId } = req.params;
      const { quantity } = req.body;
      // Verify that the cart exists
      const [cartRows] = await db.execute('SELECT * FROM Shopping_Cart WHERE id = ?', [cartId]);
      if (cartRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }
      const cart = cartRows[0];
      const { type, value } = this.getIdentifier(req);
      if ((type === 'user' && cart.user_id != value) || (type === 'session' && cart.session_id !== value)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      // Verify that the item exists in the cart
      const [itemRows] = await db.execute('SELECT * FROM Cart_Items WHERE id = ? AND cart_id = ?', [itemId, cartId]);
      if (itemRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Cart item not found' });
      }

      const item = itemRows[0];
      const [productRows] = await db.execute(
        'SELECT quantity_in_stock FROM Products WHERE id = ?',
        [item.product_id]
      );
      if (productRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Associated product not found' });
      }
      const stockAvailable = productRows[0].quantity_in_stock;
      if (parseInt(quantity) > stockAvailable) {
        return res.status(400).json({
          success: false,
          message: `Cannot set quantity to ${quantity}. Only ${stockAvailable} units available in stock.`
        });
      }
      
      await db.execute('UPDATE Cart_Items SET quantity = ? WHERE id = ?', [quantity, itemId]);
      return res.status(200).json({ success: true, message: 'Cart item updated successfully' });
    } catch (error) {
      console.error('Error updating cart item:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while updating cart item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  // Merge two carts (e.g., when a user logs in)
  async mergeCarts(userId, sessionCart, sessionId) {
    try {
      // Get or create user cart
      let [userCartRows] = await db.execute('SELECT * FROM Shopping_Cart WHERE user_id = ?', [userId]);
      let userCart = userCartRows[0];
  
      if (!userCart) {
        await db.execute('INSERT INTO Shopping_Cart (user_id) VALUES (?)', [userId]);
        [userCartRows] = await db.execute('SELECT * FROM Shopping_Cart WHERE user_id = ?', [userId]);
        userCart = userCartRows[0];
      }
  
      // Get items from session cart
      const [sessionItems] = await db.execute('SELECT * FROM Cart_Items WHERE cart_id = ?', [sessionCart.id]);
  
      for (const item of sessionItems) {
        const [existing] = await db.execute(
          'SELECT * FROM Cart_Items WHERE cart_id = ? AND product_id = ?',
          [userCart.id, item.product_id]
        );
  
        if (existing.length > 0) {
          // Update quantity
          const newQuantity = existing[0].quantity + item.quantity;
          await db.execute('UPDATE Cart_Items SET quantity = ? WHERE id = ?', [newQuantity, existing[0].id]);
        } else {
          // Insert new item
          await db.execute(
            'INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
            [userCart.id, item.product_id, item.quantity]
          );
        }
      }
      //logger
      console.log(`Merged ${sessionItems.length} items from session cart to user cart`);
  
      // Clear session cart
      await db.execute('DELETE FROM Cart_Items WHERE cart_id = ?', [sessionCart.id]);
  
      console.log('Carts merged successfully');
    } catch (error) {
      console.error('Error merging carts:', error);
      throw error;
    }
  }

  // Remove an item from the cart
  async removeItem(req, res) {
    try {
      const { cartId, itemId } = req.params;
      // Verify that the cart exists
      const [cartRows] = await db.execute('SELECT * FROM Shopping_Cart WHERE id = ?', [cartId]);
      if (cartRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }
      const cart = cartRows[0];
      const { type, value } = this.getIdentifier(req);
      if ((type === 'user' && cart.user_id != value) || (type === 'session' && cart.session_id !== value)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      await db.execute('DELETE FROM Cart_Items WHERE id = ? AND cart_id = ?', [itemId, cartId]);
      return res.status(200).json({ success: true, message: 'Cart item removed successfully' });
    } catch (error) {
      console.error('Error removing cart item:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while removing cart item',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Clear all items from the cart
  async clearCart(req, res) {
    try {
      const { cartId } = req.params;
      // Verify that the cart exists
      const [cartRows] = await db.execute('SELECT * FROM Shopping_Cart WHERE id = ?', [cartId]);
      if (cartRows.length === 0) {
        return res.status(404).json({ success: false, message: 'Cart not found' });
      }
      const cart = cartRows[0];
      const { type, value } = this.getIdentifier(req);
      if ((type === 'user' && cart.user_id != value) || (type === 'session' && cart.session_id !== value)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }
      await db.execute('DELETE FROM Cart_Items WHERE cart_id = ?', [cartId]);
      return res.status(200).json({ success: true, message: 'Cart cleared successfully' });
    } catch (error) {
      console.error('Error clearing cart:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error while clearing cart',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Helper: Fetch cart data without needing req/res
  async fetchCartData(userId, sessionId) {
    let query, params;
    if (userId) {
      query = 'SELECT * FROM Shopping_Cart WHERE user_id = ?';
      params = [userId];
    } else if (sessionId) {
      query = 'SELECT * FROM Shopping_Cart WHERE session_id = ?';
      params = [sessionId];
    } else {
      throw new Error('No identifier provided');
    }

    const [rows] = await db.execute(query, params);
    let cart;

    if (rows.length === 0) {
      // Create new cart
      if (userId) {
        await db.execute('INSERT INTO Shopping_Cart (user_id) VALUES (?)', [userId]);
        const [newRows] = await db.execute('SELECT * FROM Shopping_Cart WHERE user_id = ?', [userId]);
        cart = newRows[0];
      } else {
        await db.execute('INSERT INTO Shopping_Cart (session_id) VALUES (?)', [sessionId]);
        const [newRows] = await db.execute('SELECT * FROM Shopping_Cart WHERE session_id = ?', [sessionId]);
        cart = newRows[0];
      }
    } else {
      cart = rows[0];
    }

    // Get cart items with product details
    const [rowsItems] = await db.execute(`
      SELECT 
        ci.id as id, 
        ci.cart_id, 
        ci.product_id, 
        ci.quantity,
        p.name, 
        p.price, 
        p.image_url, 
        p.description
      FROM Cart_Items ci
      JOIN Products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cart.id]);

    const items = rowsItems.map(row => ({
      id: row.id,
      cart_id: row.cart_id,
      product_id: row.product_id,
      quantity: row.quantity,
      product: {
        name: row.name,
        price: row.price,
        image_url: row.image_url,
        description: row.description
      }
    }));

    return { cart, items };
  }
}

module.exports = new CartController();

  