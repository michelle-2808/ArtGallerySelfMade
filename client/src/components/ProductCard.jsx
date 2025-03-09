
import React from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../hooks/AuthContext';

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  
  // Function to determine stock status and text
  const getStockStatus = () => {
    if (!product.isAvailable) {
      return { text: 'Out of Stock', className: 'stock-out' };
    }
    if (product.stockQuantity <= 5) {
      return { text: `Only ${product.stockQuantity} left`, className: 'stock-low' };
    }
    return { text: 'In Stock', className: 'stock-available' };
  };
  
  // Get stock display info
  const stockStatus = getStockStatus();
  
  // Record a product view when card is clicked
  const recordProductView = async () => {
    if (user && user.isAdmin) return; // Don't record admin views
    
    try {
      await fetch(`/api/admin/analytics/record-view/${product._id}`, {
        method: 'POST',
      });
    } catch (error) {
      console.error('Error recording product view:', error);
    }
  };
  
  return (
    <div className="product-card">
      <Link 
        to={`/product/${product._id}`} 
        className="flex flex-col h-full" 
        onClick={recordProductView}
      >
        <div className="product-image-container">
          <img 
            src={product.imageUrl} 
            alt={product.title} 
            className="product-image"
          />
          {product.featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>
        
        <div className="product-info">
          <h3 className="product-title">{product.title}</h3>
          <p className="product-category">{product.category}</p>
          <p className="product-price">${product.price.toFixed(2)}</p>
          <p className={`product-stock ${stockStatus.className}`}>
            {stockStatus.text}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
