
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../hooks/AuthContext';
import axios from 'axios';

const Cart = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchCartItems();
  }, [user, navigate]);
  
  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/cart');
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
      return sum + (item.product.price * item.quantity);
    }, 0);
    
    setTotalAmount(total);
  };
  
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      setUpdating(true);
      await axios.put(`/api/cart/${itemId}`, {
        quantity: newQuantity
      });
      
      // Update local state
      const updatedItems = cartItems.map(item => 
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      );
      
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } catch (err) {
      console.error("Error updating cart:", err);
      setError("Failed to update item quantity");
    } finally {
      setUpdating(false);
    }
  };
  
  const removeItem = async (itemId) => {
    try {
      setUpdating(true);
      await axios.delete(`/api/cart/${itemId}`);
      
      // Update local state
      const updatedItems = cartItems.filter(item => item._id !== itemId);
      setCartItems(updatedItems);
      calculateTotal(updatedItems);
    } catch (err) {
      console.error("Error removing item:", err);
      setError("Failed to remove item from cart");
    } finally {
      setUpdating(false);
    }
  };
  
  const proceedToCheckout = () => {
    navigate('/checkout');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="spinner">Loading your cart...</div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          {error}
        </div>
        <button 
          onClick={fetchCartItems}
          className="text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
        <p className="text-gray-600 mb-6">Your cart is empty</p>
        <Link 
          to="/products" 
          className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded transition duration-300"
        >
          Browse Products
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0">
                        <img 
                          className="h-16 w-16 object-cover rounded" 
                          src={item.product.imageUrl} 
                          alt={item.product.title} 
                        />
                      </div>
                      <div className="ml-4">
                        <Link to={`/product/${item.product._id}`} className="text-sm font-medium text-gray-900 hover:text-primary">
                          {item.product.title}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${item.product.price.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        disabled={updating || item.quantity <= 1}
                        className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-1 rounded-l w-8 h-8 flex items-center justify-center disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-center w-10">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={updating || item.quantity >= item.product.stockQuantity}
                        className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-1 rounded-r w-8 h-8 flex items-center justify-center disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => removeItem(item._id)}
                      disabled={updating}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between mb-6">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900 font-medium">${totalAmount.toFixed(2)}</span>
        </div>
        
        <div className="border-t pt-4">
          <div className="flex justify-between mb-6">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">${totalAmount.toFixed(2)}</span>
          </div>
          
          <button
            onClick={proceedToCheckout}
            disabled={updating}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded transition duration-300 disabled:bg-gray-400"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
