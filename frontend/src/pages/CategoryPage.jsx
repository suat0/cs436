import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import "../styles.css";

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5001/getProducts");
        const filtered = res.data.filter(
          (product) => product.category?.toLowerCase() === category.toLowerCase()
        );
        setProducts(filtered);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="category-page">
      <h2 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.id}>
            <img src={product.image} alt={product.name} className="product-img" />
            <h3>{product.name}</h3>
            <p>${product.current_price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
