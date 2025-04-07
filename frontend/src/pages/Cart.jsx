import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import "./Cart.css";

const CartPage = () => {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    syncCartToBackend,
    setCartItems,
  } = useCart();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginAndFetchCart = async () => {
      try {
        const authRes = await fetch("/auth/status", {
          credentials: "include",
        });
        const authData = await authRes.json();

        if (authData.loggedIn) {
          setIsLoggedIn(true);
          const res = await fetch("/api/cart", {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            credentials: "include",
          });
          const data = await res.json();
          console.log("Cart API response:", data); // 👈 ADD THIS LINE
          
          if (res.ok && data.success) {
            setCartItems(
              data.items.map((item) => ({
                Id: item.product_id,
                quantity: item.quantity,
                Name: item.product.name,
                Product_Image: item.product.image_url,
                Current_Price: parseFloat(item.product.price),
                product: item.product,
                id: item.id,
              }))
            );
          } else {
            throw new Error(data.message || "Failed to load cart");
          }
        } else {
          setIsLoggedIn(false); // Guest
        }
      } catch (err) {
        console.error("Auth/cart error:", err);
        setError("Failed to load cart.");
      } finally {
        setLoading(false);
      }
    };

    checkLoginAndFetchCart();
  }, [setCartItems]);

  const total = cartItems.reduce(
    (acc, item) => acc + ((parseFloat(item.product?.price) || parseFloat(item.Current_Price) || 0) * item.quantity),
    0
  );

  if (loading) return <p>Loading cart...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="cart-page">
      <h2 className="cart-title">Your Shopping Cart</h2>
      <div className="cart-items">
        {cartItems.length === 0 ? (
          <p className="empty-cart">Your cart is empty.</p>
        ) : (
          cartItems.map((item) => (
            <div key={item.id || item.Id} className="cart-item">
              <img
                src={item.product?.image_url || item.Product_Image || ""}
                alt={item.product?.name || item.Name || "Product"}
                className="cart-item-img"
              />
              <div className="cart-item-info">
                <h3>{item.product?.name || item.Name || "Unnamed Product"}</h3>
                <p>
                  {(item.product?.price || item.Current_Price) != null
                    ? `$${(parseFloat(item.product?.price) || parseFloat(item.Current_Price)).toFixed(2)}`
                    : "Price unavailable"}
                </p>
                <div className="cart-qty">
                  <button onClick={() => updateQuantity(item.id || item.Id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id || item.Id, 1)}>+</button>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(item.id || item.Id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-total">
        <h3>Total: ${total.toFixed(2)}</h3>
        <button className="checkout-btn" disabled={cartItems.length === 0}>
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
