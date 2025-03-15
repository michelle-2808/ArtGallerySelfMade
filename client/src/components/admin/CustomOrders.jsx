import React, { useState, useEffect } from "react";
import axios from "axios";

const CustomOrders = () => {
  const [customOrders, setCustomOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomOrders();
  }, []);

  const fetchCustomOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/custom-orders/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(response.data);
      setCustomOrders(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching custom orders:", error);
    }
  };

  const updateOrderStatus = async (
    orderId,
    status,
    adminNotes,
    approvedPrice
  ) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/custom-orders/${orderId}/status`,
        { status, adminNotes, approvedPrice },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCustomOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  if (loading) {
    return <div>Loading custom orders...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Custom Orders Management</h2>
      <div className="overflow-x-auto">
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
                  <p className="text-sm text-gray-500">
                    Expected: ${order.productDetails.expectedPrice}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    className="mr-2 p-1 border rounded"
                    value={order.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      const adminNotes = prompt("Enter admin notes:");
                      const approvedPrice =
                        newStatus === "approved"
                          ? parseFloat(prompt("Enter approved price:"))
                          : order.approvedPrice;

                      if (adminNotes !== null) {
                        updateOrderStatus(
                          order._id,
                          newStatus,
                          adminNotes,
                          approvedPrice
                        );
                      }
                    }}
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="in_production">In Production</option>
                    <option value="completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomOrders;
