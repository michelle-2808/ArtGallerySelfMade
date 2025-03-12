import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../hooks/AuthContext";
import axios from "axios";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Wait until we know the auth status (user is no longer undefined)
    if (user === undefined) {
      return; // Still loading auth state, don't do anything yet
    }

    // If user is not logged in (user is explicitly null)
    if (user === null) {
      navigate("/auth", { state: { from: "/cart" } });
      return;
    }

    // Admin shouldn't access cart
    if (user.isAdmin) {
      navigate("/admin/dashboard");
      return;
    }

    // At this point we have a non-admin user, fetch cart items
    fetchCartItems();
  }, [user, navigate]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setCartItems(response.data);
      calculateTotal(response.data);
    } catch (err) {
      console.error("Error fetching cart items:", err);
      setError("Failed to load your cart");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    setTotalAmount(total);
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setUpdating(true);
      await axios.put(
        `/api/cart/${itemId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update locally to avoid refetching
      const updatedItems = cartItems.map((item) =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      );
      setCartItems(updatedItems);
      calculateTotal(updatedItems);

      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (err) {
      console.error("Error updating quantity:", err);
      setError("Failed to update item quantity");
    } finally {
      setUpdating(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      setUpdating(true);
      await axios.delete(`/api/cart/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Update locally
      const updatedItems = cartItems.filter((item) => item._id !== itemId);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);

      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Failed to remove item from cart");
    } finally {
      setUpdating(false);
    }
  };

  const clearCart = async () => {
    if (!cartItems.length) return;

    if (!window.confirm("Are you sure you want to clear your cart?")) return;

    try {
      setUpdating(true);
      await axios.delete("/api/cart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Clear local state
      setCartItems([]);
      setTotalAmount(0);

      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new CustomEvent("cart-updated"));
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError("Failed to clear cart");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>
        <button
          onClick={() => fetchCartItems()}
          className="bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 font-playfair">
        Your Shopping Cart
      </h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/products"
            className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-primary-dark transition duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cart Items */}
          <div className="w-full md:w-2/3">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">
                    Cart Items ({cartItems.length})
                  </h2>
                  <button
                    onClick={clearCart}
                    disabled={updating}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Clear Cart
                  </button>
                </div>

                <div className="divide-y">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="py-4 flex flex-col sm:flex-row"
                    >
                      {/* Product Image */}
                      <div className="sm:w-1/4 mb-4 sm:mb-0">
                        <Link to={`/product/${item.product._id}`}>
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.title}
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </Link>
                      </div>

                      {/* Product Details */}
                      <div className="sm:w-2/4 sm:px-6">
                        <Link to={`/product/${item.product._id}`}>
                          <h3 className="text-lg font-semibold text-gray-800 hover:text-primary">
                            {item.product.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-500 mb-2">
                          {item.product.category}
                        </p>
                        <p className="text-primary font-bold">
                          ${item.product.price.toFixed(2)}
                        </p>

                        {/* Quantity Control */}
                        <div className="flex items-center mt-4">
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity - 1)
                            }
                            disabled={updating || item.quantity <= 1}
                            className="border border-gray-300 rounded-l px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          >
                            -
                          </button>
                          <span className="border-t border-b border-gray-300 px-4 py-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            disabled={
                              updating ||
                              item.quantity >= item.product.stockQuantity
                            }
                            className="border border-gray-300 rounded-r px-3 py-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Price and Remove */}
                      <div className="sm:w-1/4 flex flex-col items-end justify-between">
                        <p className="text-lg font-bold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item._id)}
                          disabled={updating}
                          className="text-red-500 hover:text-red-700 mt-4"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

              <div className="mb-4">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex justify-between mb-2">
                    <div>
                      <span className="font-medium">{item.quantity} x </span>
                      <span className="text-gray-600">
                        {item.product.title}
                      </span>
                    </div>
                    <span className="text-gray-800">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-800">Free</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link
                to="/checkout"
                className={`mt-6 block text-center bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary-dark transition duration-300 ${
                  cartItems.length === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                style={{ backgroundColor: "#4a6741" }}
                onClick={(e) => cartItems.length === 0 && e.preventDefault()}
              >
                Proceed to Checkout
              </Link>

              <Link
                to="/products"
                className="mt-4 block text-center text-primary hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
