import { Routes, Route } from "react-router-dom";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LoginSignup from "./pages/LoginSignup";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Comment from "./pages/Comment";
import Cart from "./pages/Cart";
import Shop from "./pages/Shop";
import CategoryPage from "./pages/CategoryPage";
import Product from "./pages/Product";
import CheckoutPage from "./pages/Checkout";


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
          <Route path="/comments/:productId" element={<Comment />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/product/:id" element={<Product />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;


