import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUser, faHeart, faShoppingBag, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./Navbar.css";
import logo from "../images/logo.png"; // Import logo image

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </div>

      <div className="logo-container" onClick={() => navigate("/")}> 
        <img src={logo} alt="Pearl Logo" className="logo" />
        <h1 className="logo-text">Pearl</h1>
      </div>

      <ul className="nav-links">
        <li onClick={() => navigate("/")}>Home</li>
        <li onClick={() => navigate("/product")}>Product</li>
        <li onClick={() => navigate("/contact")}>Contact</li>
      </ul>

      <div className="nav-icons">
        <FontAwesomeIcon icon={faSearch} onClick={() => navigate("/search")} />
        <FontAwesomeIcon icon={faUser} onClick={() => navigate("/account")} />
        <FontAwesomeIcon icon={faHeart} onClick={() => navigate("/wishlist")} />
        <FontAwesomeIcon icon={faShoppingBag} onClick={() => navigate("/cart")} />
      </div>

      <ul className={`mobile-menu ${menuOpen ? "show-menu" : ""}`}>
        <li onClick={() => { navigate("/"); setMenuOpen(false); }}>Home</li>
        <li onClick={() => { navigate("/product"); setMenuOpen(false); }}>Product</li>
        <li onClick={() => { navigate("/contact"); setMenuOpen(false); }}>Contact</li>
      </ul>
    </nav>
  );
};

export default Navbar;
