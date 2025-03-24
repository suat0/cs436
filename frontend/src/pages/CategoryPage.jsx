import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag, faHeart, faExchangeAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import "../styles.css";
import "../Category.css";

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5001/getProducts");
        const filtered = res.data.filter(
          (product) => product.Product_Category_Id?.toLowerCase() === category.toLowerCase()
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
          <div className="product-card" key={product.Id}>
            <div className="product-image">
              <img src={product.Product_Image} alt={product.Name} />
              <div className="product-actions">
                <FontAwesomeIcon icon={faShoppingBag} />
                <FontAwesomeIcon icon={faHeart} />
                <FontAwesomeIcon icon={faExchangeAlt} />
                <FontAwesomeIcon icon={faSearch} />
              </div>
            </div>
            <div className="product-info">
              <h3>{product.Name}</h3>
              <p>${product.Current_Price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
