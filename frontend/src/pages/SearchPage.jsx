import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./SearchPage.css";

const SearchPage = () => {
  const { search_query } = useParams();
  const [products, setProducts] = useState([]);
  const [sort_by, setSortBy] = useState("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(search_query)}&sort_by=${sort_by}`, {
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
        });
        if (!response.ok) {
          throw new Error(`Error fetching search results: ${response.statusText}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          setProducts(result.data);
        } else {
          throw new Error(result.message || "Failed to load products.");
        }
      } catch (err) {
        console.error("Error fetching search results:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [search_query, sort_by]);

  return (
    <div className="search-page">
      {loading ? (
        <div className="loading-container">
          <div className="loader"/>
        </div>
      ) : error ? (
        <p>Error loading search results: {error}</p>
      ) : (
        <>
          <div className="search-header">
            <h2 className="search-title">Search Results for "{search_query}"</h2>
            <div className="sort-bar">
              <label>Sort by: </label>
              <select value={sort_by} onChange={(e) => setSortBy(e.target.value)}>
                <option value="name">Name (A–Z)</option>
                <option value="name_desc">Name (Z–A)</option>
                <option value="price">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
                <option value="popularity">Popularity (High to Low)</option>
                <option value="popularity_asc">Popularity (Low to High)</option>
              </select>
            </div>
          </div>
          {products.length === 0 ? (
            <div className="no-results-wrapper">
              <p className="no-results">No products found matching your search.</p>
            </div>
          ) : (
            <div className="product-grid">
              {products.map((product) => (
                <div className="product-card" key={product.id}>
                  <div
                    className="product-image"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <img src={product.image_url} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p>${parseFloat(product.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}      
    </div>
  );
};

export default SearchPage;
