import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag, faHeart, faExchangeAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import "../styles.css";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sampleProducts = [
      // Rings
      {
        Id: 1,
        Name: "Gold Ring",
        Product_Category_Id: "rings",
        Product_Image: "https://sainttracy.com/cdn/shop/products/JUNEDIAMONDENGAGEMENTRING_09fa3e82-c58a-47a4-992a-c53bceddf4d4_700x.jpg?v=1682327491",
        Current_Price: 120.0,
      },
      {
        Id: 2,
        Name: "Emerald Ring",
        Product_Category_Id: "rings",
        Product_Image: "https://via.placeholder.com/300x400?text=Emerald+Ring",
        Current_Price: 145.0,
      },
      {
        Id: 3,
        Name: "Vintage Silver Ring",
        Product_Category_Id: "rings",
        Product_Image: "https://via.placeholder.com/300x400?text=Silver+Ring",
        Current_Price: 90.0,
      },

      // Necklaces
      {
        Id: 4,
        Name: "Silver Necklace",
        Product_Category_Id: "necklaces",
        Product_Image: "https://via.placeholder.com/300x400?text=Silver+Necklace",
        Current_Price: 95.0,
      },
      {
        Id: 5,
        Name: "Pearl Choker",
        Product_Category_Id: "necklaces",
        Product_Image: "https://via.placeholder.com/300x400?text=Pearl+Choker",
        Current_Price: 135.0,
      },
      {
        Id: 6,
        Name: "Gold Pendant Necklace",
        Product_Category_Id: "necklaces",
        Product_Image: "https://via.placeholder.com/300x400?text=Gold+Pendant",
        Current_Price: 160.0,
      },

      // Bracelets
      {
        Id: 7,
        Name: "Diamond Bracelet",
        Product_Category_Id: "bracelets",
        Product_Image: "https://via.placeholder.com/300x400?text=Diamond+Bracelet",
        Current_Price: 150.0,
      },
      {
        Id: 8,
        Name: "Beaded Bracelet",
        Product_Category_Id: "bracelets",
        Product_Image: "https://via.placeholder.com/300x400?text=Beaded+Bracelet",
        Current_Price: 75.0,
      },
      {
        Id: 9,
        Name: "Cuff Bracelet",
        Product_Category_Id: "bracelets",
        Product_Image: "https://via.placeholder.com/300x400?text=Cuff+Bracelet",
        Current_Price: 110.0,
      },
    ];

    const filtered = sampleProducts.filter(
      (product) => product.Product_Category_Id?.toLowerCase() === category.toLowerCase()
    );
    setProducts(filtered);
    setLoading(false);
  }, [category]);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="category-page">
      <h2 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div
            className="product-card"
            key={product.Id}
            onClick={() => navigate(`/product/${product.Id}`)}
          >
            <div className="product-image">
              <img src={product.Product_Image} alt={product.Name} />
              <div className="product-actions">
                <FontAwesomeIcon icon={faShoppingBag} />
                <FontAwesomeIcon icon={faHeart} />
                <FontAwesomeIcon icon={faExchangeAlt} />
                <FontAwesomeIcon icon={faSearch} />
              </div>
            </div>
            <div className="product-info">
              <h3>{product.Name}</h3>
              <p>${product.Current_Price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;





/*import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingBag, faHeart, faExchangeAlt, faSearch } from "@fortawesome/free-solid-svg-icons";
import "../styles.css";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5001/getProducts");
        const filtered = res.data.filter(
          (product) => product.Product_Category_Id?.toLowerCase() === category.toLowerCase()
        );
        setProducts(filtered);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="category-page">
      <h2 className="category-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h2>
      <div className="product-grid">
        {products.map((product) => (
          <div className="product-card" key={product.Id}>
            <div className="product-image">
              <img src={product.Product_Image} alt={product.Name} />
              <div className="product-actions">
                <FontAwesomeIcon icon={faShoppingBag} />
                <FontAwesomeIcon icon={faHeart} />
                <FontAwesomeIcon icon={faExchangeAlt} />
                <FontAwesomeIcon icon={faSearch} />
              </div>
            </div>
            <div className="product-info">
              <h3>{product.Name}</h3>
              <p>${product.Current_Price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
*/