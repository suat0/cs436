import React from "react";
import { useNavigate } from "react-router-dom";
import ringsImg from "../images/rings.jpg";
import necklacesImg from "../images/necklaces.jpg";
import braceletsImg from "../images/bracelets.jpg";
import "./Shop.css";

const Shop = () => {
  const navigate = useNavigate();

  const categories = [
    { name: "Rings", image: ringsImg, path: "/category/rings" },
    { name: "Necklaces", image: necklacesImg, path: "/category/necklaces" },
    { name: "Bracelets", image: braceletsImg, path: "/category/bracelets" },
  ];

  return (
    <div className="shop-page">
      <h2 className="shop-title">Explore Categories</h2>
      <div className="category-grid">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className="category-card"
            onClick={() => navigate(cat.path)}
            style={{ backgroundImage: `url(${cat.image})` }}
          >
            <div className="category-overlay">
              <h3>{cat.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;
