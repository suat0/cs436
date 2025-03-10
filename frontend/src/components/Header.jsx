import React from "react";
import { Link } from "react-router-dom";
import "../styles.css";

const Header = () => {
  return (
    <header className="header">
      <div className="logo">
        <h1>Jewelry Store</h1>
      </div>
      <nav className="nav">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/shop">Shop</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/cart">🛒</Link></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;