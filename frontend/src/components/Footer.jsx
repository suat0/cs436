import React from "react";
import "../styles.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Jewelry Store. All Rights Reserved.</p>
        <div className="social-links">
          <a href="#">Facebook</a> | <a href="#">Instagram</a> | <a href="#">Twitter</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;