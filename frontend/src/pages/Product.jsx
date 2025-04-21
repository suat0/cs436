import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Product.css';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${id}`, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
        });
        if (!response.ok) {
          throw new Error(`Error fetching product: ${response.statusText}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          setProduct(result.data);
        } else {
          throw new Error(result.message || 'Failed to load product.');
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <p>Loading product...</p>;
  if (error || !product) return <p>Product not found.</p>;

  const addToCart = async () => {
    if (quantity > product.quantity_in_stock) {
      setErrorMessage('Quantity exceeds stock available.');
      setSuccessMessage('');
      return;
    }
    try {
      // Retrieve the current cart (user or guest)
      const cartResponse = await fetch(`/api/cart`, {
        method: 'GET',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      });
      const cartData = await cartResponse.json();
      if (!cartResponse.ok) {
        throw new Error(cartData.error || 'Failed to retrieve cart.');
      }
      const cartId = cartData.cart.id;
      // Add item to the cart
      const addItemResponse = await fetch(`/api/cart/items`, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: product.id, quantity })
      });
      const addItemData = await addItemResponse.json();
      if (addItemResponse.ok) {
        setSuccessMessage(`${quantity} item(s) added to cart.`);
        setErrorMessage('');
        setQuantity(1);
      } else {
        setErrorMessage(addItemData.error || 'Failed to add item to cart.');
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      setErrorMessage('Error adding to cart.');
      setSuccessMessage('');
    }
  };


  const toggleWishlist = () => {
    setWishlist(!wishlist);
  };

  const goToComments = () => {
    navigate(`/comments/${id}`);
  };

  return (
    <div className="product-container">
      <img src={product.image_url} alt={product.name} className="product-image" />
      <div className="product-details">
      {(successMessage || errorMessage) && (
      <div
      className={`feedback-message ${
        successMessage ? 'success-message' : 'error-message'
      }`}
        >
      {successMessage || errorMessage}
      </div>
      )}
        <h1>{product.name}</h1>
        <p className="price">${Number(product.price).toFixed(2)}</p>
        <p>{product.description}</p>
        <p className="stock">
          {product.quantity_in_stock > 0
            ? `In Stock (${product.quantity_in_stock} available)`
            : 'Out of Stock'}
        </p>
        <div className="product-extra-details">
        <p><strong>Product ID:</strong> {product.id}</p>
        <p><strong>Model:</strong> {product.model}</p>
        <p><strong>Serial Number:</strong> {product.serial_number}</p>
        <p><strong>Warranty Status:</strong> {product.warranty_status ? 'Covered' : 'No Warranty'}</p>
        <p><strong>Distributor:</strong> {product.distributor_info}</p>
        </div>

        <div className="quantity-selector">
          <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
          <span>{quantity}</span>
          <button onClick={() => setQuantity(q => q + 1)} 
          disabled={quantity >= product.quantity_in_stock}
          > + </button>
        </div>
        <div className="actions">
        <button 
           onClick={addToCart} 
           className="add-to-cart" 
           disabled={product.quantity_in_stock === 0}
          >
          {product.quantity_in_stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <div className="sub-actions">
            <button onClick={toggleWishlist} className={wishlist ? 'wishlisted' : ''}>
              {wishlist ? 'Wishlisted' : 'Add to Wishlist'}
            </button>
            <button onClick={goToComments} className="comments-button">View Comments</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
