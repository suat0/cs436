import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag, faHeart, faExchangeAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useCart } from "../context/CartContext";
import "../styles.css";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const catRes = await fetch('/api/categories?active=true', {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        if (!catRes.ok) {
          throw new Error(`Error fetching categories: ${catRes.status}`);
        }
        const catData = await catRes.json();
        if (!catData.success || !catData.data) {
          throw new Error(catData.message || "Failed to fetch categories");
        }

        const currentCategory = catData.data.find(
          (cat) => cat.name.toLowerCase() === category.toLowerCase()
        );
        if (!currentCategory) {
          setProducts([]);
          setLoading(false);
          return;
        }

        const prodRes = await fetch(`/api/categories/${currentCategory.id}/products?sort_by=${sort}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        if (!prodRes.ok) {
          throw new Error(`Error fetching products: ${prodRes.status}`);
        }
        const prodData = await prodRes.json();
        if (!prodData.success || !prodData.data) {
          throw new Error(prodData.message || "Failed to fetch products");
        }

        setProducts(prodData.data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, sort]);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="category-page">
      <h2 className="category-title">
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </h2>

      <div className="sort-header">
        <div className="sort-align-right">
          <label>Sort by: </label>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="name">Name (A–Z)</option>
            <option value="name_desc">Name (Z–A)</option>
            <option value="price">Price (Low to High)</option>
            <option value="price_desc">Price (High to Low)</option>
            <option value="popularity">Popularity (High to Low)</option>
            <option value="popularity_asc">Popularity (Low to High)</option>
          </select>
        </div>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <div
              className="product-image"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <img src={product.image_url} alt={product.name} />
            </div>
            <div className="product-actions">
              <FontAwesomeIcon icon={faShoppingBag} onClick={() => addToCart(product)} />
              <FontAwesomeIcon icon={faHeart} />
              <FontAwesomeIcon icon={faExchangeAlt} />
              <FontAwesomeIcon icon={faSearch} />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>${product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
