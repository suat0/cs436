import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

const CartPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to refresh the cart data from the API
  const refreshCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setCart(data.cart);
        setCartItems(data.items);
      } else {
        throw new Error(data.error || "Failed to fetch cart.");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError(err.message);
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
        alert(data.error || data.message || "Failed to update quantity.");
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
        alert(data.error || "Failed to remove item.");
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

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="cart-page">
      <h2 className="cart-title">Your Shopping Cart</h2>
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
        <button className="checkout-btn" onClick={() => navigate("/checkout")}>Proceed to Checkout</button>      
      </div>
    </div>
  );
};

export default CartPage;
