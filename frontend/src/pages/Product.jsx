import React, { useState } from 'react';
import pearlEarringImg from '../images/pearl_earing.jpg';
import './Product.css';

const ProductPage = () => {
  const product = {
    name: 'Pearl Earrings',
    price: 76.00,
    stock: 10,
    description: 'Elegant pearl earrings with a gold setting.',
    image: pearlEarringImg
  };

  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState(false);

  const addToCart = () => {
    if (quantity <= product.stock) {
      setCart([...cart, { ...product, quantity }]);
      alert(`${quantity} item(s) added to cart.`);
    } else {
      alert('Quantity exceeds stock available.');
    }
  };

  const toggleWishlist = () => {
    setWishlist(!wishlist);
  };

  return (
    <div className="product-container">
      <img src={product.image} alt={product.name} className="product-image" />
      <div className="product-details">
        <h1>{product.name}</h1>
        <p className="price">${product.price.toFixed(2)}</p>
        <p>{product.description}</p>
        <p className="stock">{product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}</p>
        <div className="quantity-selector">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)}>+</button>
        </div>
        <div className="actions">
          <button onClick={addToCart}>Add to Cart</button>
          <button onClick={toggleWishlist} className={wishlist ? 'wishlisted' : ''}>
            {wishlist ? 'Wishlisted' : 'Add to Wishlist'}
          </button>
        </div>
        

      </div>
    </div>
  );
};

export default ProductPage;
