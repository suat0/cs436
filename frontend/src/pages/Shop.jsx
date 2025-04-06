import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Shop.css";

// If you have a baseURL configured in your environment, you can use it
// const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const Shop = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Make sure to use the correct API URL
        // If your API is on the same domain, use a relative path
        // If it's on a different domain, use the full URL
        const url = '/api/categories?active=true';
        console.log('Fetching from:', url);
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response from server");
        }
        
        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setCategories(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch categories');
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // While API isn't working, use placeholder categories for development
  const usePlaceholders = error !== null;
  const placeholderCategories = [
    { id: 1, name: "Rings", image_url: "" },
    { id: 2, name: "Necklaces", image_url: "" },
    { id: 3, name: "Bracelets", image_url: "" },
  ];

  const displayCategories = usePlaceholders ? placeholderCategories : categories;

  return (
    <div className="shop-page">
      {loading && <div className="loading">Loading categories...</div>}
      
      {error && (
        <div className="error-banner">
          <p>Error loading categories: {error}</p>
          <p>Showing placeholder categories for development</p>
        </div>
      )}

      <div className="category-grid">
        {displayCategories.length > 0 ? (
          displayCategories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              onClick={() => navigate(`/category/${category.name.toLowerCase()}`)}
              style={{ 
                backgroundImage: category.image_url ? `url(${category.image_url})` : 'none',
                backgroundColor: !category.image_url ? '#f0f0f0' : 'transparent'
              }}
            >
              <div className="category-overlay">
                <h3>{category.name}</h3>
              </div>
            </div>
          ))
        ) : (
          <div className="no-categories">No categories available.</div>
        )}
      </div>
    </div>
  );
};

export default Shop;