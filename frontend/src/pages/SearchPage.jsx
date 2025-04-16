import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./SearchPage.css"; // Create and style this file as needed

const SearchPage = () => {
  const { search_query } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/search?q=${encodeURIComponent(search_query)}`, {
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
  }, [search_query]);

  if (loading) return <p>Loading search results...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="search-page">
      <h2 className="search-title">
        Search Results for "{search_query}"
      </h2>
      {products.length === 0 ? (
        <p>No products found matching your search.</p>
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
    </div>
  );
};

export default SearchPage;
