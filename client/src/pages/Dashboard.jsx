import React, { useState, useEffect, useContext } from "react";
import AuthContext from "../hooks/AuthContext";
import { Link } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [userOrders, setUserOrders] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [favoriteCategory, setFavoriteCategory] = useState("N/A");
  const [orderFrequency, setOrderFrequency] = useState("0/month");
  const [loyaltyStatus, setLoyaltyStatus] = useState("Bronze");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
          return;
        }

        // Fetch user orders
        const ordersResponse = await axios.get("/api/orders/my-orders", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserOrders(ordersResponse.data);

        // Fetch user dashboard stats
        const statsResponse = await axios.get("/api/users/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserStats(statsResponse.data.stats);
        setFavoriteCategory(statsResponse.data.favoriteCategory || "N/A");
        setOrderFrequency(statsResponse.data.orderFrequency || "0/month");
        setLoyaltyStatus(statsResponse.data.loyaltyStatus || "Bronze");

        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto px-48 py-16">
      <h1 className="text-3xl font-bold mb-8 font-playfair">My Dashboard</h1>

      {/* User Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
          <p className="text-3xl font-bold text-green-600">
            {userStats?.totalOrders || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Spent</h2>
          <p className="text-3xl font-bold text-green-600">
            ${userStats?.totalSpent?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Avg. Order Value</h2>
          <p className="text-3xl font-bold text-green-600">
            ${userStats?.averageOrderValue?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Items</h2>
          <p className="text-3xl font-bold text-green-600">
            {userStats?.totalItems || 0}
          </p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Orders</h2>
        {userOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {userOrders.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Processing"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        to={`/orders/${order._id}`}
                        className="text-green-600 hover:text-green-900"
                      >
                        View Order
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">You haven't placed any orders yet.</p>
            <Link
              to="/products"
              className="inline-block mt-4 px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>

      {/* Customer Insights */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-medium mb-4">Your Shopping Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Order Frequency</p>
            <p className="text-2xl font-bold text-green-600">
              {orderFrequency}
            </p>
            <p className="text-xs text-gray-500">estimated</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Favorite Category</p>
            <p className="text-2xl font-bold text-green-600">
              {favoriteCategory}
            </p>
            <p className="text-xs text-gray-500">based on purchases</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Loyalty Status</p>
            <p className="text-2xl font-bold text-green-600">{loyaltyStatus}</p>
            <p className="text-xs text-gray-500">based on order history</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
