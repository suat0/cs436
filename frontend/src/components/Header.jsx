import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaShoppingCart, FaUserCircle } from "react-icons/fa";
import "../styles.css";

const Header = () => {
  const [dropdown, setDropdown] = useState(null);

  const toggleDropdown = (menu) => {
    setDropdown(dropdown === menu ? null : menu);
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>Jewelry Store</h1>
      </div>
      <nav className="nav">
        <ul className="nav-menu">
          <li><Link to="/">Home</Link></li>
          <li onClick={() => toggleDropdown("shop")}>Shop
            {dropdown === "shop" && (
              <ul className="dropdown">
                <li><Link to="/rings">Rings</Link></li>
                <li><Link to="/necklaces">Necklaces</Link></li>
                <li><Link to="/bracelets">Bracelets</Link></li>
              </ul>
            )}
          </li>
          <li onClick={() => toggleDropdown("about")}>About
            {dropdown === "about" && (
              <ul className="dropdown">
                <li><Link to="/our-story">Our Story</Link></li>
                <li><Link to="/craftsmanship">Craftsmanship</Link></li>
              </ul>
            )}
          </li>
          <li onClick={() => toggleDropdown("contact")}>Contact
            {dropdown === "contact" && (
              <ul className="dropdown">
                <li><Link to="/customer-service">Customer Service</Link></li>
                <li><Link to="/support">Support</Link></li>
              </ul>
            )}
          </li>
        </ul>
      </nav>
      <div className="header-icons">
        <Link to="/cart" className="icon"><FaShoppingCart /></Link>
        <Link to="/login" className="icon"><FaUserCircle /></Link>
      </div>
    </header>
  );
};

export default Header;
