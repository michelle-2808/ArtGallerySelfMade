import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../hooks/AuthContext";

const ProductCard = ({ product }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);

  // Function to determine stock status and text
  const getStockStatus = () => {
    if (!product.isAvailable || product.stockQuantity === 0) {
      return { text: "Out of Stock", className: "text-red-600" };
    }
    if (product.stockQuantity <= 5) {
      return {
        text: `Only ${product.stockQuantity} left`,
        className: "text-amber-600",
      };
    }
    return { text: "In Stock", className: "text-green-600" };
  };

  // Get stock display info
  const stockStatus = getStockStatus();

  // Record a product view when card is clicked
  const recordProductView = async (e) => {
    // If user is not logged in, redirect to auth page
    if (!user) {
      e.preventDefault();
      navigate("/auth", { state: { from: `/product/${product._id}` } });
      return;
    }

    // Don't record admin views
    if (user.isAdmin) return;

    try {
      await axios.post(
        `/api/products/record-view/${product._id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Error recording product view:", error);
    }
  };

  const addToCart = async (e) => {
    e.preventDefault(); // Prevent navigation to product detail
    e.stopPropagation(); // Stop event bubbling

    if (!user) {
      window.location.href = `/auth?redirect=/products`;
      return;
    }

    if (user.isAdmin) {
      setMessage("Admin users cannot add items to cart");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setAddingToCart(true);

      // Send request to add item to cart
      await axios.post(
        "/api/cart/add",
        {
          productId: product._id,
          quantity: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("Added to cart!");
      setTimeout(() => setMessage(null), 3000);

      // Dispatch custom event to notify Navbar about cart update
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (err) {
      console.error("Error adding to cart:", err);
      setMessage("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full relative">
      {message && (
        <div className="absolute top-2 left-2 right-2 z-10 bg-green-100 text-green-700 p-2 rounded text-sm text-center">
          {message}
        </div>
      )}

      <Link
        to={`/product/${product._id}`}
        className="flex flex-col h-full"
        onClick={recordProductView}
      >
        <div className="relative">
          <img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-48 object-cover"
          />
          {product.featured && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
              Featured
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            {product.title}
          </h3>
          <p className="text-sm text-gray-500 mb-2">{product.category}</p>
          <p className="text-primary font-bold mb-2">
            ${product.price.toFixed(2)}
          </p>
          <p className={`text-sm font-medium ${stockStatus.className} mb-4`}>
            {stockStatus.text}
          </p>

          <div className="mt-auto">
            {user &&
              !user.isAdmin &&
              product.isAvailable &&
              product.stockQuantity > 0 && (
                <button
                  onClick={addToCart}
                  disabled={addingToCart}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded transition duration-300 disabled:bg-gray-400"
                  style={{ backgroundColor: "#4a6741" }}
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
              )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
