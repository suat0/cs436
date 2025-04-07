import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartId, setCartId] = useState(null);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("/auth/status", {
          credentials: "include",
        });
        const data = await res.json();
        setIsLoggedIn(data.loggedIn);
      } catch (err) {
        console.error("Login check failed:", err);
        setIsLoggedIn(false);
      }
    };
    checkLogin();
  }, []);

  useEffect(() => {
    const fetchCartId = async () => {
      if (!isLoggedIn) return;
      try {
        const res = await fetch("/api/cart", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.cart) {
          setCartId(data.cart.id);
        }
      } catch (err) {
        console.error("Failed to fetch cart ID:", err);
      }
    };
    fetchCartId();
  }, [isLoggedIn]);

  const updateBackendItem = async (cartItemId, quantity) => {
    if (!isLoggedIn || !cartId || !cartItemId) return;
    try {
      await fetch(`/api/cart/${cartId}/items/${cartItemId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ quantity }),
      });
    } catch (error) {
      console.error("Failed to update cart item:", error);
    }
  };

  const createBackendItem = async (productId, quantity) => {
    if (!isLoggedIn || !productId) return;
    try {
      await fetch(`/api/cart/items`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ product_id: productId, quantity }),
      });
    } catch (error) {
      console.error("Failed to add item to backend cart:", error);
    }
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.Id === product.Id || item.id === product.Id);
      const newItems = exists
        ? prev.map((item) =>
            item.Id === product.Id || item.id === product.Id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...prev, { ...product, quantity }];

      if (isLoggedIn && exists) {
        updateBackendItem(exists.id || exists.Id, exists.quantity + quantity);
      } else if (isLoggedIn && !exists) {
        createBackendItem(product.Id, quantity);
      }

      return newItems;
    });
  };

  const removeFromCart = (id) => {
    if (isLoggedIn && cartId) {
      fetch(`/api/cart/${cartId}/items/${id}`, {
        method: "DELETE",
        credentials: "include",
      }).catch((err) => console.error("Failed to remove item from backend:", err));
    }
    setCartItems((prev) =>
      prev.filter((item) => item.Id !== id && item.id !== id)
    );
  };

  const updateQuantity = (id, amount) => {
    setCartItems((prev) => {
      const updated = prev.map((item) => {
        if (item.Id === id || item.id === id) {
          const newQuantity = Math.max(1, item.quantity + amount);
          if (isLoggedIn) {
            updateBackendItem(item.id || item.Id, newQuantity);
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
      return updated;
    });
  };

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, updateQuantity, setCartItems }}
    >
      {children}
    </CartContext.Provider>
  );
};