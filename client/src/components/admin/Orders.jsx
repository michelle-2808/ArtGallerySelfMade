// client/src/components/admin/Orders.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const Orders = ({ recentOrders }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Order Management</h2>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-medium mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left">Order #</th>
                <th className="px-4 py-2 text-left">Customer</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Tracking</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id} className="border-b">
                  <td className="px-4 py-2">
                    {order.orderNumber || order._id.substring(0, 8)}
                  </td>
                  <td className="px-4 py-2">{order.userId?.username}</td>
                  <td className="px-4 py-2">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">${order.totalAmount.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {order.trackingNumber
                      ? order.trackingNumber
                      : "Not assigned"}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      to={`/admin/orders/${order._id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-right">
          <Link
            to="/admin/orders"
            className="text-green-600 hover:text-green-800"
          >
            View All Orders
          </Link>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-medium mb-4">Order Status Overview</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Pending",
                      value: recentOrders.filter((o) => o.status === "pending")
                        .length,
                    },
                    {
                      name: "Processing",
                      value: recentOrders.filter(
                        (o) => o.status === "processing"
                      ).length,
                    },
                    {
                      name: "Shipped",
                      value: recentOrders.filter((o) => o.status === "shipped")
                        .length,
                    },
                    {
                      name: "Delivered",
                      value: recentOrders.filter(
                        (o) => o.status === "delivered"
                      ).length,
                    },
                    {
                      name: "Cancelled",
                      value: recentOrders.filter(
                        (o) => o.status === "cancelled"
                      ).length,
                    },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-medium mb-4">Order Processing Times</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">
                Average time from order to shipping
              </p>
              <p className="text-2xl font-bold text-green-600">2.3 days</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Average time from shipping to delivery
              </p>
              <p className="text-2xl font-bold text-green-600">4.1 days</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                Total order fulfillment time
              </p>
              <p className="text-2xl font-bold text-green-600">6.4 days</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
