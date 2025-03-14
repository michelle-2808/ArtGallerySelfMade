import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const OrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Get token from localStorage
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`/api/admin/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setOrder(response.data);
        setStatus(response.data.status);
        setTrackingNumber(response.data.trackingNumber || "");
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.response?.data?.message || "Error loading order details");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const updateOrder = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      // Get token from localStorage
      const token = localStorage.getItem("token");

      if (!token) {
        setMessage({
          type: "error",
          text: "Authentication token not found. Please login again.",
        });
        setUpdating(false);
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Update status
      if (status !== order.status) {
        await axios.put(
          `/api/admin/orders/${orderId}/status`,
          { status },
          config
        );
      }

      // Update tracking number
      if (trackingNumber !== (order.trackingNumber || "")) {
        await axios.put(
          `/api/admin/orders/${orderId}/tracking`,
          { trackingNumber },
          config
        );
      }

      // Refresh order data
      const response = await axios.get(`/api/admin/orders/${orderId}`, config);
      setOrder(response.data);

      setMessage({ type: "success", text: "Order updated successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      console.error("Error updating order:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update order",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto px-16 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto px-16 py-16">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error || "Order not found"}
        </div>
        <div className="mt-4">
          <Link to="/admin/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-16 py-16">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          Order Details: {order.orderNumber}
        </h1>
        <Link to="/admin/dashboard" className="text-blue-600 hover:underline">
          Back to Dashboard
        </Link>
      </div>

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

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Order Information</h2>
              <p className="mb-2">
                <span className="font-medium">Order ID:</span> {order._id}
              </p>
              <p className="mb-2">
                <span className="font-medium">Order Number:</span>{" "}
                {order.orderNumber}
              </p>
              <p className="mb-2">
                <span className="font-medium">Date:</span>{" "}
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
              <p className="mb-2">
                <span className="font-medium">Status:</span>
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
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">
                Customer Information
              </h2>
              <p className="mb-2">
                <span className="font-medium">Customer:</span>{" "}
                {order.userId?.email || "Unknown"}
              </p>
              <p className="mb-2">
                <span className="font-medium">Shipping Address:</span>
              </p>
              {order.shippingAddress && (
                <div className="ml-4">
                  <p>{order.shippingAddress.streetAddress}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              )}
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-3">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
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
                          {item.product && (
                            <p className="text-sm text-gray-500">
                              {item.product.category}
                            </p>
                          )}
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

          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Status History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Note
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.statusHistory.map((history, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              history.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : history.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : history.status === "shipped"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {history.status.charAt(0).toUpperCase() +
                              history.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {new Date(history.timestamp).toLocaleString()}
                        </td>
                        <td className="px-4 py-2">{history.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <form onSubmit={updateOrder} className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Update Order</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
            </div>
            <div className="mt-4">
              <button
                type="submit"
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200 disabled:bg-blue-300"
              >
                {updating ? "Updating..." : "Update Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
