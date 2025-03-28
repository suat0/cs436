import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Product.css';

const sampleProducts = [
  {
    Id: 1,
    Name: 'Gold Ring',
    Product_Image: 'https://sainttracy.com/cdn/shop/products/JUNEDIAMONDENGAGEMENTRING_09fa3e82-c58a-47a4-992a-c53bceddf4d4_700x.jpg?v=1682327491',
    Current_Price: 120.0,
    Quantity_In_Stocks: 10,
    Description: 'Elegant gold ring with intricate detailing.',
  },
  {
    Id: 2,
    Name: 'Emerald Ring',
    Product_Image: 'https://via.placeholder.com/300x400?text=Emerald+Ring',
    Current_Price: 145.0,
    Quantity_In_Stocks: 5,
    Description: 'A beautiful emerald ring set in sterling silver.',
  },
  // ...add more products if needed
];

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);

  useEffect(() => {
    const found = sampleProducts.find((p) => p.Id.toString() === id);
    setProduct(found);
  }, [id]);

  if (!product) return <p>Product not found.</p>;

  const addToCart = () => {
    if (quantity <= product.Quantity_In_Stocks) {
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
      <img src={product.Product_Image} alt={product.Name} className="product-image" />
      <div className="product-details">
        <h1>{product.Name}</h1>
        <p className="price">${product.Current_Price.toFixed(2)}</p>
        <p>{product.Description}</p>
        <p className="stock">
          {product.Quantity_In_Stocks > 0
            ? `In Stock (${product.Quantity_In_Stocks} available)`
            : 'Out of Stock'}
        </p>
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
