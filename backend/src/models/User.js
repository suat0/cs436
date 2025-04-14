const db = require('../controllers/db');
class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.email = data.email || '';
    this.password = data.password || '';
    this.address = data.address || null;
    this.role = data.role || 'customer';
  }

  // Static methods for database operations
  static async getAll(db, options = {}) {
    let query = 'SELECT * FROM Users';
    const params = [];
    
    // Filter by role
    if (options.role) {
      query += ' WHERE role = ?';
      params.push(options.role);
    }
    
    // Order by
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    } else {
      query += ' ORDER BY name ASC';
    }
    
    // Limit and offset for pagination
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      
      if (options.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }
    
    const [rows] = await db.execute(query, params);
    return rows.map(row => new User(row));
  }

  static async getById(db, id) {
    const [rows] = await db.execute('SELECT * FROM Users WHERE id = ?', [id]);
    if (rows.length === 0) return null;
    return new User(rows[0]);
  }

  static async getByEmail(db, email) {
    const [rows] = await db.execute('SELECT * FROM Users WHERE email = ?', [email]);
    if (rows.length === 0) return null;
    return new User(rows[0]);
  }

  static async create(db, userData) {
    // Hash password before storing
    const hashedPassword = await User.hashPassword(userData.password);
    
    const user = new User({
      ...userData,
      password: hashedPassword
    });
    
    const query = `
      INSERT INTO Users 
      (name, email, password, address, role)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      user.name,
      user.email,
      user.password,
      user.address,
      user.role
    ];
    
    const [result] = await db.execute(query, params);
    user.id = result.insertId;
    return user;
  }

  async update(db) {
    if (!this.id) throw new Error('Cannot update user without ID');
    
    const query = `
      UPDATE Users 
      SET name = ?, 
          email = ?,
          address = ?,
          role = ?
      WHERE id = ?
    `;
    
    const params = [
      this.name,
      this.email,
      this.address,
      this.role,
      this.id
    ];
    
    await db.execute(query, params);
    return this;
  }

  async updatePassword(db, newPassword) {
    if (!this.id) throw new Error('Cannot update password without user ID');
    
    this.password = await User.hashPassword(newPassword);
    
    await db.execute(
      'UPDATE Users SET password = ? WHERE id = ?',
      [this.password, this.id]
    );
    
    return this;
  }

  static async delete(db, id) {
    // Check if user has associated orders
    const [ordersCount] = await db.execute(
      'SELECT COUNT(*) as count FROM Orders WHERE user_id = ?', 
      [id]
    );
    
    if (ordersCount[0].count > 0) {
      throw new Error('Cannot delete user with associated orders');
    }
    
    await db.execute('DELETE FROM Users WHERE id = ?', [id]);
  }

  // Password handling
  static async hashPassword(password) {
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async comparePassword(password) {
    const bcrypt = require('bcrypt');
    return await bcrypt.compare(password, this.password);
  }

  // Role checking methods
  isCustomer() {
    return this.role === 'customer';
  }

  isSalesManager() {
    return this.role === 'sales_manager';
  }

  isProductManager() {
    return this.role === 'product_manager';
  }

  isAdmin() {
    return this.role === 'sales_manager' || this.role === 'product_manager';
  }

  // Relations
  static async getOrders(db, userId, options = {}) {
    let query = `
      SELECT * FROM Orders
      WHERE user_id = ?
    `;
    
    const params = [userId];
    
    // Filter by status
    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }
    
    // Order by
    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    } else {
      query += ' ORDER BY date DESC';
    }
    
    // Limit and offset for pagination
    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      
      if (options.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async getWishlist(db, userId) {
    const query = `
      SELECT p.* FROM Wishlist w
      JOIN Products p ON w.product_id = p.id
      WHERE w.user_id = ?
      ORDER BY w.added_at DESC
    `;
    
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  static async getCart(db, userId) {
    // First, get or create cart
    let [carts] = await db.execute(
      'SELECT * FROM Shopping_Cart WHERE user_id = ?',
      [userId]
    );
    
    let cartId;
    if (carts.length === 0) {
      // Create a new cart
      const [result] = await db.execute(
        'INSERT INTO Shopping_Cart (user_id) VALUES (?)',
        [userId]
      );
      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }
    
    // Get cart items
    const [items] = await db.execute(`
      SELECT ci.*, p.name, p.price, p.image_url
      FROM Cart_Items ci
      JOIN Products p ON ci.product_id = p.id
      WHERE ci.cart_id = ?
    `, [cartId]);
    
    return {
      id: cartId,
      items: items
    };
  }

  static async getComments(db, userId) {
    const query = `
      SELECT c.*, p.name as product_name
      FROM Comments c
      JOIN Products p ON c.product_id = p.id
      WHERE c.user_id = ?
      ORDER BY c.date DESC
    `;
    
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  static async getReturns(db, userId) {
    const query = `
      SELECT r.*, oi.product_id, p.name as product_name
      FROM Returns r
      JOIN Order_Items oi ON r.order_item_id = oi.id
      JOIN Products p ON oi.product_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.date DESC
    `;
    
    const [rows] = await db.execute(query, [userId]);
    return rows;
  }

  // Session management
  static async createSession(db, userId, sessionData = {}) {
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
    
    const query = `
      INSERT INTO UserSessions
      (user_id, token, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const params = [
      userId,
      token,
      sessionData.ip_address || null,
      sessionData.user_agent || null,
      expiresAt
    ];
    
    await db.execute(query, params);
    return token;
  }

  static async validateSession(db, token) {
    const query = `
      SELECT us.*, u.* FROM UserSessions us
      JOIN Users u ON us.user_id = u.id
      WHERE us.token = ? AND us.expires_at > NOW()
    `;
    
    const [rows] = await db.execute(query, [token]);
    if (rows.length === 0) return null;
    
    return new User(rows[0]);
  }

  static async destroySession(db, token) {
    await db.execute('DELETE FROM UserSessions WHERE token = ?', [token]);
  }
}

module.exports = User;