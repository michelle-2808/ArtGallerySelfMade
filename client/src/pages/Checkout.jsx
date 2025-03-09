
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../hooks/AuthContext';
import axios from 'axios';

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    country: '',
    phone: ''
  });
  
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
      
      if (response.data.length === 0) {
        navigate('/cart');
        return;
      }
      
      setCartItems(response.data);
      calculateTotal(response.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError("Failed to load your cart items");
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };
  
  const requestOtp = async () => {
    // Validate shipping info
    for (const [key, value] of Object.entries(shippingInfo)) {
      if (!value.trim()) {
        setError(`Please provide your ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }
    
    try {
      setProcessing(true);
      await axios.post('/api/orders/request-otp');
      setOtpSent(true);
      setError(null);
    } catch (err) {
      console.error("Error requesting OTP:", err);
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setProcessing(false);
    }
  };
  
  const placeOrder = async (e) => {
    e.preventDefault();
    
    if (!otp) {
      setError("Please enter the OTP code");
      return;
    }
    
    try {
      setProcessing(true);
      const response = await axios.post('/api/orders/place-order', {
        otp,
        shippingInfo
      });
      
      // Navigate to order confirmation
      navigate(`/order-confirmation/${response.data.orderId}`);
    } catch (err) {
      console.error("Error placing order:", err);
      setError(err.response?.data?.message || "Failed to place your order");
    } finally {
      setProcessing(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="spinner">Loading checkout...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="md:flex md:gap-6">
        {/* Shipping Information Form */}
        <div className="md:w-2/3 mb-6 md:mb-0">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            
            <form onSubmit={placeOrder}>
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled={otpSent}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="address" className="block text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  disabled={otpSent}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    disabled={otpSent}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    disabled={otpSent}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="country" className="block text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    disabled={otpSent}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded"
                    disabled={otpSent}
                    required
                  />
                </div>
              </div>
              
              {!otpSent ? (
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={processing}
                  className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded transition duration-300 disabled:bg-gray-400"
                >
                  {processing ? 'Processing...' : 'Continue to Payment'}
                </button>
              ) : (
                <div>
                  <div className="mb-4">
                    <label htmlFor="otp" className="block text-gray-700 mb-2">Enter OTP Code</label>
                    <p className="text-sm text-gray-500 mb-2">
                      A one-time password has been sent to your email. Please enter it below to complete your order.
                    </p>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={handleOtpChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={processing || !otp}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded transition duration-300 disabled:bg-gray-400"
                  >
                    {processing ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="md:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="border-b pb-4 mb-4">
              {cartItems.map((item) => (
                <div key={item._id} className="flex justify-between mb-2">
                  <div>
                    <span className="font-medium">{item.quantity} x </span>
                    <span className="text-gray-600">{item.product.title}</span>
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
                <span className="text-gray-800">${totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-800">Free</span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold">${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
