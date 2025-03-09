
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  
  const [order, setOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!orderId) return;
    
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);
        const orderResponse = await axios.get(`/api/orders/${orderId}`);
        setOrder(orderResponse.data);
        
        const itemsResponse = await axios.get(`/api/orders/${orderId}/items`);
        setOrderItems(itemsResponse.data);
      } catch (err) {
        console.error("Error fetching order details:", err);
        setError("Failed to load order details");
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [orderId]);
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="spinner">Loading order details...</div>
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error || "Order not found"}
        </div>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">
          Return to Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="bg-green-100 text-green-700 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Order Details</h2>
            <span className="text-sm text-gray-500">Order #{orderId.substring(0, 8)}</span>
          </div>
          
          <div className="mb-4 pb-4 border-b">
            <p className="text-gray-700">
              <span className="font-medium">Date: </span>
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Status: </span>
              <span className="capitalize">{order.status}</span>
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Total: </span>
              ${order.totalAmount.toFixed(2)}
            </p>
          </div>
          
          <h3 className="font-semibold text-gray-800 mb-2">Items</h3>
          <div className="space-y-3 mb-6">
            {orderItems.map((item) => (
              <div key={item._id} className="flex justify-between">
                <div className="flex">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded">
                    <img 
                      className="h-full w-full object-cover"
                      src={item.product.imageUrl}
                      alt={item.product.title}
                    />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{item.product.title}</p>
                    <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-900">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </div>
          
          <div className="border-t pt-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span className="text-gray-800">${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Shipping</span>
              <span className="text-gray-800">Free</span>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t">
              <span className="font-bold">Total</span>
              <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <Link 
            to="/products" 
            className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-6 rounded transition duration-300"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
