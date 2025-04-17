class Category {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || '';
    this.image_url = data.image_url || '';
    this.is_active = data.is_active !== undefined ? data.is_active : true;
  }

  static async getAll(db, options = {}) {
    let query = 'SELECT * FROM Categories';
    const params = [];

    if (options.activeOnly) {
      query += ' WHERE is_active = TRUE';
    }

    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy}`;
    } else {
      query += ' ORDER BY name ASC';
    }

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
    const [productsCount] = await db.execute(
      'SELECT COUNT(*) as count FROM Products WHERE category_id = ?', 
      [id]
    );

    if (productsCount[0].count > 0) {
      throw new Error('Cannot delete category with associated products');
    }

    await db.execute('DELETE FROM Categories WHERE id = ?', [id]);
  }

  async toggleActive(db) {
    this.is_active = !this.is_active;
    return this.update(db);
  }

  static async getProducts(db, categoryId, options = {}) {
    const usePopularity = options.orderBy === 'popularity' || options.orderBy === 'popularity_asc';

    let query = usePopularity
      ? `
        SELECT p.*, COALESCE(AVG(r.rating), 0) AS popularity
        FROM Products p
        LEFT JOIN Ratings r ON p.id = r.product_id
        WHERE p.category_id = ?
      `
      : `
        SELECT * FROM Products
        WHERE category_id = ?
      `;

    const params = [categoryId];

    if (options.visibleOnly) {
      query += usePopularity ? ' AND p.visibility = TRUE' : ' AND visibility = TRUE';
    }

    if (options.inStockOnly) {
      query += usePopularity ? ' AND p.quantity_in_stock > 0' : ' AND quantity_in_stock > 0';
    }

    if (usePopularity) {
      query += `
        GROUP BY p.id
        ORDER BY popularity ${options.orderBy === 'popularity_asc' ? 'ASC' : 'DESC'}, p.name ASC
      `;
    } else {
      if (options.orderBy) {
        if (options.orderBy === 'name_desc') {
          query += ' ORDER BY name DESC';
        } else if (options.orderBy === 'price' || options.orderBy === 'price_asc') {
          query += ' ORDER BY price ASC';
        } else if (options.orderBy === 'price_desc') {
          query += ' ORDER BY price DESC';
        } else {
          query += ' ORDER BY name ASC';
        }
      } else {
        query += ' ORDER BY name ASC';
      }
    }

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
