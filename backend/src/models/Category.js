class Category {
    constructor(data = {}) {
      this.id = data.id || null;
      this.name = data.name || '';
      this.image_url = data.image_url || '';
      this.is_active = data.is_active !== undefined ? data.is_active : true;
    }
  
    // Static methods for database operations
    static async getAll(db, options = {}) {
      let query = 'SELECT * FROM Categories';
      const params = [];
      
      // Filter by active status
      if (options.activeOnly) {
        query += ' WHERE is_active = TRUE';
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
      return rows.map(row => new Category(row));
    }
  
    static async getById(db, id) {
      const [rows] = await db.execute('SELECT * FROM Categories WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      return new Category(rows[0]);
    }
  
    static async create(db, categoryData) {
      const category = new Category(categoryData);
      
      const query = `
        INSERT INTO Categories 
        (name, image_url, is_active)
        VALUES (?, ?, ?)
      `;
      
      const params = [
        category.name,
        category.image_url,
        category.is_active
      ];
      
      const [result] = await db.execute(query, params);
      category.id = result.insertId;
      return category;
    }
  
    async update(db) {
      if (!this.id) throw new Error('Cannot update category without ID');
      
      const query = `
        UPDATE Categories 
        SET name = ?, 
            image_url = ?,
            is_active = ?
        WHERE id = ?
      `;
      
      const params = [
        this.name,
        this.image_url,
        this.is_active,
        this.id
      ];
      
      await db.execute(query, params);
      return this;
    }
  
    static async delete(db, id) {
      // Check if category has associated products
      const [productsCount] = await db.execute(
        'SELECT COUNT(*) as count FROM Products WHERE category_id = ?', 
        [id]
      );
      
      if (productsCount[0].count > 0) {
        throw new Error('Cannot delete category with associated products');
      }
      
      await db.execute('DELETE FROM Categories WHERE id = ?', [id]);
    }
  
    // Activate/deactivate category
    async toggleActive(db) {
      this.is_active = !this.is_active;
      return this.update(db);
    }
  
    // Relations
    static async getProducts(db, categoryId, options = {}) {
      let query = `
        SELECT * FROM Products
        WHERE category_id = ?
      `;
      
      const params = [categoryId];
      
      // Filter by visibility
      if (options.visibleOnly) {
        query += ' AND visibility = TRUE';
      }
      
      // Filter by stock
      if (options.inStockOnly) {
        query += ' AND quantity_in_stock > 0';
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
      return rows;
    }
  
    static async getProductCount(db, categoryId, visibleOnly = true) {
      let query = 'SELECT COUNT(*) as count FROM Products WHERE category_id = ?';
      const params = [categoryId];
      
      if (visibleOnly) {
        query += ' AND visibility = TRUE';
      }
      
      const [result] = await db.execute(query, params);
      return result[0].count;
    }
  }
  
  module.exports = Category;