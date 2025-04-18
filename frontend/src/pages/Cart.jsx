import React, { useState, useEffect } from "react";
import "./Cart.css";
import { useNavigate} from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  console.log("isAuthenticated:", isAuthenticated);
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');


  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  const [showLoginModal, setShowLoginModal] = useState(false);

  // Function to refresh the cart data from the API
  const refreshCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });
      console.log("Cart API response status:", response.status);
      const data = await response.json();
      if (response.ok && data.success) {
        setCart(data.cart);
        setCartItems(data.items);
        
      } else {
        if (response.status === 401) {
          setShowLoginModal(true);
          return;
        }
        throw new Error(data.error || "Failed to fetch cart.");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  // Update the quantity for a given cart item
  const updateQuantity = async (itemId, delta) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (!item) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;
    try {
      const response = await fetch(`/api/cart/${cart.id}/items/${itemId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      const data = await response.json();
      if (response.ok && data.success) {

        refreshCart();
      } else {
        setErrorMessage(data.error || "Failed to update quantity.");
        setSuccessMessage('');
        setErrorMessage(data.error || "Failed to update quantity.");
        setSuccessMessage('');
      }
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  // Remove an item from the cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await fetch(`/api/cart/${cart.id}/items/${itemId}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        refreshCart();
      } else {
        setErrorMessage(data.error || "Failed to remove item.");
        setSuccessMessage('');
        setErrorMessage(data.error || "Failed to remove item.");
        setSuccessMessage('');
      }
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  // Calculate the total price based on each product's price and quantity.
  const total = cartItems.reduce(
    (acc, item) => acc + (parseFloat(item.product?.price) || 0) * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      navigate('/checkout');
    }
  };

  if (loading) return <p>Loading cart...</p>;


  return (
    <div className="cart-page">
      <h2 className="cart-title">Your Shopping Cart</h2>
      {(successMessage || errorMessage) && (
      <div
      className={`feedback-message ${
      successMessage ? 'success-message' : 'error-message'
      }`}
      >
      {successMessage || errorMessage}
      </div>
      )}
      {(successMessage || errorMessage) && (
      <div
      className={`feedback-message ${
      successMessage ? 'success-message' : 'error-message'
      }`}
      >
      {successMessage || errorMessage}
      </div>
      )}
      <div className="cart-items">
        {cartItems.map((item) => (
          <div key={item.id} className="cart-item">
            <img
              src={item.product?.image_url || ""}
              alt={item.product?.name || "Product"}
              className="cart-item-img"
            />
            <div className="cart-item-info">
              <h3>{item.product?.name || "Unnamed Product"}</h3>
              <p>${(parseFloat(item.product?.price) || 0).toFixed(2)}</p>
              <div className="cart-qty">
                <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)}>+</button>
              </div>
              <button className="remove-btn" onClick={() => removeFromCart(item.id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <h3>Total: ${total.toFixed(2)}</h3>
        <button className="checkout-btn" onClick={handleCheckout}>Proceed to Checkout</button>
      </div>

      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-content">
              <h3>Login Required</h3>
              <p>Please log in to proceed with checkout</p>
              <div className="modal-buttons">
                <button
                  className="modal-button primary"
                  onClick={() => navigate('/login', { state: { from: '/checkout' } })}
                >
                  Log In
                </button>
                <button
                  className="modal-button secondary"
                  onClick={() => setShowLoginModal(false)}
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
