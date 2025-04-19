import React, { useState } from "react";
import { useNavigate} from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import {
  faSignOutAlt,
  faSearch,
  faUser,
  faHeart,
  faShoppingBag,
  faBars,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import "./Navbar.css";
import logo from "../images/logo.png";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();


  // Handle account icon click
  const handleAccountClick = () => {
    if (isAuthenticated) {
      navigate("/account");
    } else {
      navigate("/login");
    }
  };

 // Handle logout
 const handleLogout = async () => {
  try {
    await logout();
    navigate('/');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
const handleSearchSubmit = (e) => {
  e.preventDefault();
  // Only navigate if the search term is not empty
  if (searchTerm.trim() !== "") {
    navigate(`/search/${encodeURIComponent(searchTerm.trim())}`);
    // Optionally clear the search input
    setSearchTerm("");
  }
};



  return (
    <nav className="navbar">
      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
      </div>

      <div className="logo-container" onClick={() => navigate("/")}> 
        <img src={logo} alt="Pearl Logo" className="logo" />
        <h1 className="logo-text">Pearl</h1>
      </div>

      <div className="nav-center">
        <ul className="nav-links">
          <li onClick={() => navigate("/")}>Home</li>
          <li onClick={() => navigate("/shop")}>Shop</li>
          <li onClick={() => navigate("/contact")}>Contact</li>
        </ul>
      </div>
      <div className="nav-right">
  <form onSubmit={handleSearchSubmit} className="search-form">
    <input
      type="text"
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    />
    <button type="submit" className="search-button">
      <FontAwesomeIcon icon={faSearch} />
    </button>
  </form>
      <div className="nav-icons">
        <FontAwesomeIcon icon={faSearch} onClick={() => navigate("/search")} />
        <FontAwesomeIcon icon={faUser} onClick={handleAccountClick} />
        <FontAwesomeIcon icon={faHeart} onClick={() => navigate("/wishlist")} />
        <FontAwesomeIcon icon={faShoppingBag} onClick={() => navigate("/cart")} />
        {isAuthenticated && (
        <FontAwesomeIcon 
          icon={faSignOutAlt} 
          onClick={handleLogout} 
          title="Logout" 
          className="logout-icon" 
        />
      )}
      </div>
      </div>
      <ul className={`mobile-menu ${menuOpen ? "show-menu" : ""}`}>
        <li onClick={() => { navigate("/"); setMenuOpen(false); }}>Home</li>
        <li onClick={() => { navigate("/shop"); setMenuOpen(false); }}>Shop</li>
        <li onClick={() => { navigate("/contact"); setMenuOpen(false); }}>Contact</li>
        {isAuthenticated && (
        <li onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</li>
      )}
        <li className="mobile-search">
    <form onSubmit={handleSearchSubmit} className="search-form mobile-search-form">
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      <button type="submit" className="search-button">
        <FontAwesomeIcon icon={faSearch} />
      </button>
    </form>
  </li>
      </ul>
    </nav>
  );
};

export default Navbar;
