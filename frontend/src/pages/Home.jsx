import React from "react";
import "../styles.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <h1>Sparkle and Shine with Dazzling Jewelry</h1>
          <button className="shop-now-btn">Shop Now</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
