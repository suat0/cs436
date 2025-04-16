class Product {
    constructor(data = {}) {
      this.id = data.id || null;
      this.name = data.name || '';
      this.category_id = data.category_id || null;
      this.price = data.price || null;
      this.cost_price = data.cost_price || null;
      this.quantity_in_stock = data.quantity_in_stock || 0;
      this.description = data.description || '';
      this.model = data.model || '';
      this.serial_number = data.serial_number || '';
      this.warranty_status = data.warranty_status || false;
      this.distributor_info = data.distributor_info || '';
      this.visibility = data.visibility || false;
      this.image_url = data.image_url || '';
    }
  
    // Static methods for database operations
    static async getAll(db, options = {}) {
      let query = 'SELECT * FROM Products';
      const params = [];
      
      // Filter by visibility
      if (options.visibleOnly) {
        query += ' WHERE visibility = TRUE';
      }
      
      // Filter by category
      if (options.category_id) {
        query += (options.visibleOnly ? ' AND' : ' WHERE') + ' category_id = ?';
        params.push(options.category_id);
      }
      
      // Order by
      if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
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
      return rows.map(row => new Product(row));
    }
  
    static async getById(db, id) {
      const [rows] = await db.execute('SELECT * FROM Products WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      return new Product(rows[0]);
    }
  
    static async getBySku(db, serialNumber) {
      const [rows] = await db.execute('SELECT * FROM Products WHERE serial_number = ?', [serialNumber]);
      if (rows.length === 0) return null;
      return new Product(rows[0]);
    }
  
    static async create(db, productData) {
      const product = new Product(productData);
      
      // Calculate default cost_price if not provided
      if (!product.cost_price && product.price) {
        product.cost_price = product.price * 0.5; // 50% of price by default
      }
      
      const query = `
        INSERT INTO Products 
        (name, category_id, price, cost_price, quantity_in_stock, description, 
         model, serial_number, warranty_status, distributor_info, visibility, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        product.name,
        product.category_id,
        product.price,
        product.cost_price,
        product.quantity_in_stock,
        product.description,
        product.model,
        product.serial_number,
        product.warranty_status,
        product.distributor_info,
        product.visibility,
        product.image_url
      ];
      
      const [result] = await db.execute(query, params);
      product.id = result.insertId;
      return product;
    }
  
    async update(db) {
      if (!this.id) throw new Error('Cannot update product without ID');
      
      const query = `
        UPDATE Products 
        SET name = ?, 
            category_id = ?,
            price = ?,
            cost_price = ?,
            quantity_in_stock = ?,
            description = ?,
            model = ?,
            serial_number = ?,
            warranty_status = ?,
            distributor_info = ?,
            visibility = ?,
            image_url = ?
        WHERE id = ?
      `;
      
      const params = [
        this.name,
        this.category_id,
        this.price,
        this.cost_price,
        this.quantity_in_stock,
        this.description,
        this.model,
        this.serial_number,
        this.warranty_status,
        this.distributor_info, 
        this.visibility,
        this.image_url,
        this.id
      ];
      
      await db.execute(query, params);
      return this;
    }
  
    static async delete(db, id) {
      await db.execute('DELETE FROM Products WHERE id = ?', [id]);
    }
  
    // Business logic methods
    updateStock(quantity) {
      this.quantity_in_stock = Math.max(0, this.quantity_in_stock + quantity);
      return this;
    }
  
    reduceStock(quantity) {
      return this.updateStock(-quantity);
    }
  
    setPrice(price) {
      this.price = price;
      // Update visibility once price is set
      if (price && price > 0) {
        this.visibility = true;
      }
      return this;
    }
  
    isInStock() {
      return this.quantity_in_stock > 0;
    }
  
    calculateProfit() {
      if (!this.price || !this.cost_price) return 0;
      return this.price - this.cost_price;
    }
  
    calculateProfitMargin() {
      if (!this.price || this.price === 0) return 0;
      return (this.calculateProfit() / this.price) * 100;
    }
  
    // Relations
    static async getCategory(db, productId) {
      const [rows] = await db.execute(`
        SELECT c.* FROM Categories c
        JOIN Products p ON c.id = p.category_id
        WHERE p.id = ?
      `, [productId]);
      
      return rows.length > 0 ? rows[0] : null;
    }
  
    static async getComments(db, productId, status = 'approved') {
      const query = `
        SELECT c.*, u.name as user_name 
        FROM Comments c
        JOIN Users u ON c.user_id = u.id
        WHERE c.product_id = ? AND c.status = ?
        ORDER BY c.date DESC
      `;
      
      const [rows] = await db.execute(query, [productId, status]);
      return rows;
    }
  
    static async getRatings(db, productId) {
      const [rows] = await db.execute(`
        SELECT * FROM Ratings
        WHERE product_id = ?
      `, [productId]);
      
      return rows;
    }
  
    static async getAverageRating(db, productId) {
      const [rows] = await db.execute(`
        SELECT AVG(rating) as average
        FROM Ratings
        WHERE product_id = ?
      `, [productId]);
      
      return rows[0].average || 0;
    }
  
    static async searchProducts(db, searchTerm, options = {}) {
      let query = `
        SELECT * FROM Products
        WHERE (name LIKE ? OR description LIKE ? OR model LIKE ?)
      `;
      
      const params = [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`
      ];
      
      if (options.visibleOnly) {
        query += ' AND visibility = TRUE';
      }
      
      if (options.categoryId) {
        query += ' AND category_id = ?';
        params.push(options.categoryId);
      }
      
      if (options.minPrice) {
        query += ' AND price >= ?';
        params.push(options.minPrice);
      }
      
      if (options.maxPrice) {
        query += ' AND price <= ?';
        params.push(options.maxPrice);
      }
      
      if (options.inStock) {
        query += ' AND quantity_in_stock > 0';
      }
      
      if (options.orderBy) {
        query += ` ORDER BY ${options.orderBy}`;
      }
      
      if (options.limit) {
        query += ` LIMIT ${Number(options.limit)}`;
        
        if (options.offset) {
          query += ` OFFSET ${Number(options.offset)}`;
        }
      }
      
      const [rows] = await db.execute(query, params);
      return rows.map(row => new Product(row));
    }
  }
  
  module.exports = Product;