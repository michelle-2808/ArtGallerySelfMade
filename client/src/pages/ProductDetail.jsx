import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthContext from "../hooks/AuthContext";
import axios from "axios";

const ProductDetail = () => {
  const { productId } = useParams();
  const { user, loading: authLoading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // If the auth state is still loading, wait
    if (authLoading) return;

    // Redirect to login if user is not authenticated
    if (!user) {
      navigate("/auth", { state: { from: `/product/${productId}` } });
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/products/${productId}`);
        setProduct(response.data);

        // Record view separately after setting product data
        if (!user.isAdmin) {
          recordProductView(productId);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is authenticated
    fetchProduct();
  }, [productId, user, navigate, authLoading]);

  // Separate function to record product view - doesn't block UI
  const recordProductView = async (id) => {
    // Only proceed if we have a token
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await axios.post(
        `/api/products/record-view/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      // Silent fail - don't block user experience for analytics errors
      console.error("Error recording product view:", error);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    setQuantity(Math.max(1, Math.min(value || 1, product?.stockQuantity || 1)));
  };

  const addToCart = async () => {
    if (!user) {
      navigate("/auth", { state: { from: `/product/${productId}` } });
      return;
    }

    if (user.isAdmin) {
      setMessage({
        type: "error",
        text: "Admin users cannot add items to cart",
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    try {
      setAddingToCart(true);

      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await axios.post(
        "/api/cart/add",
        {
          productId,
          quantity,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage({
        type: "success",
        text: "Product added to cart successfully!",
      });

      setTimeout(() => setMessage(null), 3000);

      // Dispatch custom event to notify Navbar about cart update
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (err) {
      console.error("Error adding to cart:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to add product to cart",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-48 py-16 flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto px-48 py-16">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  const isOutOfStock = !product.isAvailable || product.stockQuantity === 0;

  return (
    <div className="mx-auto px-48 py-16">
      {message && (
        <div
          className={`mb-4 p-4 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Product Image */}
          <div className="md:w-1/2">
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-auto object-cover"
              style={{ maxHeight: "500px" }}
            />
          </div>

          {/* Product Info */}
          <div className="md:w-1/2 p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2 font-playfair">
                {product.title}
              </h1>
              <p className="text-sm text-gray-500 mb-2">
                Category: {product.category}
              </p>
              {product.artist && (
                <p className="text-md text-gray-700 mb-2">
                  Artist: {product.artist}
                </p>
              )}
              {product.creationYear && (
                <p className="text-md text-gray-700 mb-2">
                  Year: {product.creationYear}
                </p>
              )}
            </div>

            <div className="mb-6">
              <p className="text-2xl font-bold text-primary mb-4">
                ${product.price.toFixed(2)}
              </p>
              <p className="text-gray-700 mb-4">{product.description}</p>

              {/* Dimensions if available */}
              {product.dimensions &&
                (product.dimensions.width || product.dimensions.height) && (
                  <div className="mb-4">
                    <p className="text-gray-700 font-medium">Dimensions:</p>
                    <p className="text-gray-600">
                      {product.dimensions.width &&
                        `Width: ${product.dimensions.width} ${
                          product.dimensions.unit || "cm"
                        }`}
                      {product.dimensions.height &&
                        `, Height: ${product.dimensions.height} ${
                          product.dimensions.unit || "cm"
                        }`}
                      {product.dimensions.depth &&
                        `, Depth: ${product.dimensions.depth} ${
                          product.dimensions.unit || "cm"
                        }`}
                    </p>
                  </div>
                )}

              {/* Tags if available */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock status */}
              <p
                className={`mb-4 font-medium ${
                  isOutOfStock
                    ? "text-red-600"
                    : product.stockQuantity <= 5
                    ? "text-amber-600"
                    : "text-green-600"
                }`}
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : product.stockQuantity <= 5
                  ? `Only ${product.stockQuantity} left in stock`
                  : "In Stock"}
              </p>
            </div>

            {/* Add to cart section */}
            {!isOutOfStock && user && !user.isAdmin && (
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <label htmlFor="quantity" className="mr-4 text-gray-700">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.stockQuantity}
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="w-16 px-3 py-2 border border-gray-300 rounded"
                  />
                </div>

                <button
                  onClick={addToCart}
                  disabled={addingToCart || isOutOfStock}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded transition duration-300 disabled:bg-gray-400"
                  style={{ backgroundColor: "#4a6741" }}
                >
                  {addingToCart ? "Adding..." : "Add to Cart"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
