import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const CustomOrders = () => {
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const fetchCustomOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await axios.get("/api/custom-orders/admin/list", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setCustomOrders(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching custom orders:", error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (
    orderId,
    status,
    adminNotes,
    approvedPrice,
    validationNotes
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      await axios.patch(
        `/api/custom-orders/${orderId}/status`,
        { status, adminNotes, approvedPrice, validationNotes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchCustomOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error.response?.data?.message || error.message);
    }
  };

  if (error) {
    return <div className="text-red-600 p-4">Error: {error}</div>;
  }

  if (loading) {
    return <div className="p-4">Loading custom orders...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Custom Orders Management</h2>
      <div className="overflow-x-auto">
        {customOrders.length === 0 ? (
          <p className="text-gray-500 p-4">No custom orders found.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {customOrders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {order.orderNumber}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium">{order.customerInfo.name}</p>
                      <p className="text-sm text-gray-500">
                        {order.customerInfo.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{order.productDetails.title}</p>
                    <p className="text-sm text-gray-500 truncate max-w-xs">
                      {order.productDetails.description}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p>Expected: ${order.productDetails.expectedPrice}</p>
                    {order.approvedPrice && (
                      <p className="text-green-600">
                        Approved: ${order.approvedPrice}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : order.status === "approved"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        navigate(`/admin/custom-orders/${order._id}`)
                      }
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Review Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CustomOrders;
