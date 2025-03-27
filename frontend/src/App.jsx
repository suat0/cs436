import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LoginSignup from "./pages/LoginSignup";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Shop from "./pages/Shop";
import CategoryPage from "./pages/CategoryPage";
import Product from "./pages/Product";

function App() {
  const appContainerStyle = {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
  };

  const mainContentStyle = {
    flex: 1, 
    paddingTop: "80px"
  };

  return (
    <div style={appContainerStyle}>
      <Navbar />
      <main style={mainContentStyle}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<LoginSignup />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/product" element={<Product />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;


