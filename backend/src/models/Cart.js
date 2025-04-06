class Cart {
    constructor(data = {}) {
      this.id = data.id || null;
      this.user_id = data.user_id || null;
      this.session_id = data.session_id || null;
    }
  
    // Retrieve a cart by user_id
    static async getByUserId(db, userId) {
      const [rows] = await db.execute('SELECT * FROM Shopping_Cart WHERE user_id = ?', [userId]);
      if (rows.length === 0) return null;
      return new Cart(rows[0]);
    }
  
    // Retrieve a cart by session_id (for guest users)
    static async getBySessionId(db, sessionId) {
      const [rows] = await db.execute('SELECT * FROM Shopping_Cart WHERE session_id = ?', [sessionId]);
      if (rows.length === 0) return null;
      return new Cart(rows[0]);
    }
  
    // Create a new cart. Data must include either user_id or session_id.
    static async create(db, data) {
      if (data.user_id) {
        const query = 'INSERT INTO Shopping_Cart (user_id) VALUES (?)';
        const [result] = await db.execute(query, [data.user_id]);
        data.id = result.insertId;
        return new Cart(data);
      } else if (data.session_id) {
        const query = 'INSERT INTO Shopping_Cart (session_id) VALUES (?)';
        const [result] = await db.execute(query, [data.session_id]);
        data.id = result.insertId;
        return new Cart(data);
      } else {
        throw new Error('Either user_id or session_id must be provided to create a cart.');
      }
    }
  }
  
  class CartItem {
    constructor(data = {}) {
      this.id = data.id || null;
      this.cart_id = data.cart_id;
      this.product_id = data.product_id;
      this.quantity = data.quantity || 1;
    }
  
    // Retrieve all cart items for a given cart
    static async getByCartId(db, cartId) {
      const [rows] = await db.execute('SELECT * FROM Cart_Items WHERE cart_id = ?', [cartId]);
      return rows.map(row => new CartItem(row));
    }
  
    // Create a new cart item
    static async create(db, data) {
      const query = 'INSERT INTO Cart_Items (cart_id, product_id, quantity) VALUES (?, ?, ?)';
      const params = [data.cart_id, data.product_id, data.quantity || 1];
      const [result] = await db.execute(query, params);
      data.id = result.insertId;
      return new CartItem(data);
    }
  
    // Update the quantity of an existing cart item
    async update(db) {
      if (!this.id) throw new Error('Cannot update a cart item without an ID');
      const query = 'UPDATE Cart_Items SET quantity = ? WHERE id = ?';
      await db.execute(query, [this.quantity, this.id]);
      return this;
    }
  
    // Delete a cart item by its ID
    static async delete(db, id) {
      await db.execute('DELETE FROM Cart_Items WHERE id = ?', [id]);
    }
  }
  
  module.exports = { Cart, CartItem };
  