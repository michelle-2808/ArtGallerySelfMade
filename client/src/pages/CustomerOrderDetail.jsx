import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const CustomerOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCustomOrder, setIsCustomOrder] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
          return;
        }

        // Try fetching as regular order first
        try {
          const response = await axios.get(`/api/orders/${orderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setOrder(response.data);
          setIsCustomOrder(false);
        } catch (err) {
          // If not found, try fetching as custom order
          const customResponse = await axios.get(
            `/api/custom-orders/${orderId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setOrder(customResponse.data);
          setIsCustomOrder(true);
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.response?.data?.message || "Error loading order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error || "Order not found"}
        </div>
        <div className="mt-4">
          <Link to="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const renderRegularOrder = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">Order Information</h2>
          <p className="mb-2">
            <span className="font-medium">Order Number:</span>{" "}
            {order.orderNumber}
          </p>
          <p className="mb-2">
            <span className="font-medium">Date:</span>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p className="mb-2">
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`ml-2 inline-block px-2 py-1 text-xs rounded-full ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-800"
                  : order.status === "cancelled"
                  ? "bg-red-100 text-red-800"
                  : order.status === "shipped"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </p>
          <p className="mb-2">
            <span className="font-medium">Total Amount:</span> $
            {order.totalAmount.toFixed(2)}
          </p>
          {order.trackingNumber && (
            <p className="mb-2">
              <span className="font-medium">Tracking Number:</span>{" "}
              {order.trackingNumber}
            </p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
          <div className="mb-4">
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zip}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-3">Order Items</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Quantity
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Subtotal
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    {item.product && (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.title}
                        className="h-10 w-10 object-cover mr-3"
                      />
                    )}
                    <div>
                      <p className="font-medium">
                        {item.product
                          ? item.product.title
                          : "Product Unavailable"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">${item.price.toFixed(2)}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3" className="px-4 py-2 text-right font-medium">
                Total:
              </td>
              <td className="px-4 py-2 font-bold">
                ${order.totalAmount.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  const renderCustomOrder = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Custom Order Information
          </h2>
          <p className="mb-2">
            <span className="font-medium">Order Number:</span>{" "}
            {order.orderNumber}
          </p>
          <p className="mb-2">
            <span className="font-medium">Date:</span>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p className="mb-2">
            <span className="font-medium">Status:</span>{" "}
            <span
              className={`ml-2 inline-block px-2 py-1 text-xs rounded-full ${
                order.status === "completed"
                  ? "bg-green-100 text-green-800"
                  : order.status === "rejected"
                  ? "bg-red-100 text-red-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </p>
          <p className="mb-2">
            <span className="font-medium">Expected Price:</span> $
            {order.productDetails.expectedPrice.toFixed(2)}
          </p>
          {order.approvedPrice && (
            <p className="mb-2">
              <span className="font-medium">Approved Price:</span> $
              {order.approvedPrice.toFixed(2)}
            </p>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Shipping Information</h2>
          <div className="mb-4">
            <p>{order.shippingAddress.street}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zip}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Product Details</h2>
        <div className="bg-gray-50 p-4 rounded">
          <p className="mb-2">
            <span className="font-medium">Title:</span>{" "}
            {order.productDetails.title}
          </p>
          <p className="mb-2">
            <span className="font-medium">Description:</span>{" "}
            {order.productDetails.description}
          </p>
          {order.productDetails.specifications && (
            <p className="mb-2">
              <span className="font-medium">Specifications:</span>{" "}
              {order.productDetails.specifications}
            </p>
          )}
          {order.productDetails.customizations && (
            <p className="mb-2">
              <span className="font-medium">Customizations:</span>{" "}
              {order.productDetails.customizations}
            </p>
          )}
          {order.productDetails.attachments &&
            order.productDetails.attachments.length > 0 && (
              <div className="mt-4">
                <p className="font-medium mb-2">Attachments:</p>
                <div className="flex flex-wrap gap-2">
                  {order.productDetails.attachments.map((attachment, index) => (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>

      {order.statusHistory && order.statusHistory.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Status History</h2>
          <div className="space-y-2">
            {order.statusHistory.map((history, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded">
                <p className="font-medium">
                  {history.status.charAt(0).toUpperCase() +
                    history.status.slice(1)}
                </p>
                <p className="text-sm text-gray-600">
                  {new Date(history.timestamp).toLocaleString()}
                </p>
                {history.note && (
                  <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto px-4 md:px-48 py-16">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold font-playfair">
          {isCustomOrder ? "Custom Order Details" : "Order Details"}
        </h1>
        <Link to="/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>

      {isCustomOrder ? renderCustomOrder() : renderRegularOrder()}
    </div>
  );
};

export default CustomerOrderDetail;
