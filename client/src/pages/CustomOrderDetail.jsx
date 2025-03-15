import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

const CustomOrderDetail = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
//   const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [approvedPrice, setApprovedPrice] = useState("");
  const [validationNotes, setValidationNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Authentication token not found");
          return;
        }

        const response = await axios.get(
          `/api/custom-orders/admin/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setOrder(response.data);
        setStatus(response.data.status);
        // setTrackingNumber(response.data.trackingNumber || "");
        setAdminNotes(response.data.adminNotes || "");
        setApprovedPrice(response.data.approvedPrice || "");
        setValidationNotes(response.data.validationNotes || "");
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
      const token = localStorage.getItem("token");

      await axios.patch(
        `/api/custom-orders/admin/${orderId}/status`,
        {
          status,
          adminNotes,
          approvedPrice: Number(approvedPrice),
          validationNotes
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({ type: "success", text: "Order updated successfully" });
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Error updating order",
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!order) return <div className="p-4">Order not found</div>;

  return (
    <div className="mx-auto px-4 md:px-48 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">
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

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-3">Order Information</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Order ID:</span> {order._id}
                </p>
                <p>
                  <span className="font-medium">Order Number:</span>{" "}
                  {order.orderNumber}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Expected Price:</span> $
                  {order.productDetails.expectedPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-3">
                Customer Information
              </h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {order.customerInfo.name}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {order.customerInfo.email}
                </p>
                <p>
                  <span className="font-medium">Phone:</span>{" "}
                  {order.customerInfo.phone}
                </p>
                <div>
                  <span className="font-medium">Shipping Address:</span>
                  <p className="mt-1">
                    {order.shippingAddress.street}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                    {order.shippingAddress.zip}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold mb-3">Product Details</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Title:</span>{" "}
                {order.productDetails.title}
              </p>
              <p>
                <span className="font-medium">Description:</span>{" "}
                {order.productDetails.description}
              </p>
              <p>
                <span className="font-medium">Specifications:</span>{" "}
                {order.productDetails.specifications}
              </p>
              {order.productDetails.customizations && (
                <p>
                  <span className="font-medium">Customizations:</span>{" "}
                  {order.productDetails.customizations}
                </p>
              )}
            </div>
          </div>

          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-3">Status History</h2>
              <div className="space-y-2">
                {order.statusHistory.map((history, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <div className="flex justify-between">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          history.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : history.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {history.status.charAt(0).toUpperCase() +
                          history.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(history.timestamp).toLocaleString()}
                      </span>
                    </div>
                    {history.note && (
                      <p className="text-sm text-gray-600 mt-2">
                        {history.note}
                      </p>
                    )}
                  </div>
                ))}
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
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approved Price
                </label>
                <input
                  type="number"
                  value={approvedPrice}
                  onChange={(e) => setApprovedPrice(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter approved price"
                />
              </div>

              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter tracking number"
                />
              </div> */}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Validation Notes
              </label>
              <textarea
                value={validationNotes}
                onChange={(e) => setValidationNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded h-24"
                placeholder="Enter validation notes..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded h-24"
                placeholder="Enter admin notes..."
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={updating}
                className="px-6 py-2.5 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200 disabled:bg-green-300"
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

export default CustomOrderDetail;
