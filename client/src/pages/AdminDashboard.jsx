
import React, { useContext, useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { AuthContext } from "../hooks/AuthContext";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell 
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState(null);
  const [productAnalytics, setProductAnalytics] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard summary
        const dashboardResponse = await fetch("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!dashboardResponse.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const dashboardResult = await dashboardResponse.json();
        setDashboardData(dashboardResult);

        // Fetch product analytics
        const analyticsResponse = await fetch("/api/admin/analytics/products", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!analyticsResponse.ok) {
          throw new Error("Failed to fetch product analytics");
        }

        const analyticsResult = await analyticsResponse.json();
        setProductAnalytics(analyticsResult);

        // Fetch recent orders
        const ordersResponse = await fetch("/api/admin/recent-orders", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!ordersResponse.ok) {
          throw new Error("Failed to fetch recent orders");
        }

        const ordersResult = await ordersResponse.json();
        setRecentOrders(ordersResult);

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (user && user.isAdmin) {
      fetchDashboardData();
    }
  }, [user]);

  // If user is not admin, redirect to home
  if (user && !user.isAdmin) {
    return <Navigate to="/" />;
  }

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/auth" />;
  }

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

  // Prepare data for charts
  const productViewData = productAnalytics.map(item => ({
    name: item.productId?.title || 'Unknown',
    views: item.viewCount,
    purchases: item.purchaseCount,
    revenue: item.revenue
  })).slice(0, 5);

  const pieData = [
    { name: 'Products', value: dashboardData?.totalProducts || 0 },
    { name: 'Orders', value: dashboardData?.totalOrders || 0 },
    { name: 'Users', value: dashboardData?.totalUsers || 0 },
  ];

  // Format weekly revenue data
  const weeklyRevenueData = dashboardData?.weeklyRevenue?.map(week => ({
    name: `Week ${week._id.week}`,
    revenue: week.revenue,
    orders: week.orders
  })) || [];

  // Format category data
  const categoryData = dashboardData?.salesByCategory?.map(category => ({
    name: category._id || 'Unknown',
    revenue: category.revenue,
    count: category.count
  })) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 font-playfair">Admin Dashboard</h1>
      
      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap border-b border-gray-200 mb-8">
        <button
          className={`mr-4 py-2 px-4 font-medium ${
            activeTab === "overview"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-green-600"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>
        <button
          className={`mr-4 py-2 px-4 font-medium ${
            activeTab === "products"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-green-600"
          }`}
          onClick={() => setActiveTab("products")}
        >
          Products
        </button>
        <button
          className={`mr-4 py-2 px-4 font-medium ${
            activeTab === "orders"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-green-600"
          }`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </button>
        <button
          className={`mr-4 py-2 px-4 font-medium ${
            activeTab === "analytics"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-green-600"
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Total Products</h2>
              <p className="text-3xl font-bold text-green-600">{dashboardData?.totalProducts}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Total Orders</h2>
              <p className="text-3xl font-bold text-green-600">{dashboardData?.totalOrders}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Revenue</h2>
              <p className="text-3xl font-bold text-green-600">
                ${dashboardData?.totalRevenue?.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">Total Users</h2>
              <p className="text-3xl font-bold text-green-600">{dashboardData?.totalUsers}</p>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Recent Orders</h2>
              <Link to="/admin/orders" className="text-green-600 hover:text-green-800">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Order #</th>
                    <th className="px-4 py-2 text-left">Customer</th>
                    <th className="px-4 py-2 text-left">Date</th>
                    <th className="px-4 py-2 text-left">Amount</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b">
                      <td className="px-4 py-2">{order.orderNumber || order._id.substring(0, 8)}</td>
                      <td className="px-4 py-2">{order.userId?.username || "Unknown"}</td>
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
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
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
          </div>

          {/* Weekly Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Weekly Revenue</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyRevenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue ($)"
                    stroke="#00C49F"
                    activeDot={{ r: 8 }}
                  />
                  <Line type="monotone" dataKey="orders" name="Orders" stroke="#0088FE" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Top Products by Views</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productViewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="views" name="Views" fill="#0088FE" />
                    <Bar dataKey="purchases" name="Purchases" fill="#00C49F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">Sales by Category</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Product Management</h2>
            <Link
              to="/admin/products/new"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add New Product
            </Link>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Top Performing Products</h3>
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Product</th>
                    <th className="px-4 py-2 text-left">Views</th>
                    <th className="px-4 py-2 text-left">Purchases</th>
                    <th className="px-4 py-2 text-left">Revenue</th>
                    <th className="px-4 py-2 text-left">Conversion Rate</th>
                    <th className="px-4 py-2 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {productAnalytics.slice(0, 5).map((product) => (
                    <tr key={product._id} className="border-b">
                      <td className="px-4 py-2 flex items-center">
                        <img
                          src={product.productId?.imageUrl}
                          alt={product.productId?.title}
                          className="w-10 h-10 object-cover rounded mr-2"
                        />
                        <span>{product.productId?.title}</span>
                      </td>
                      <td className="px-4 py-2">{product.viewCount}</td>
                      <td className="px-4 py-2">{product.purchaseCount}</td>
                      <td className="px-4 py-2">${product.revenue.toFixed(2)}</td>
                      <td className="px-4 py-2">
                        {product.viewCount > 0
                          ? ((product.purchaseCount / product.viewCount) * 100).toFixed(2)
                          : 0}
                        %
                      </td>
                      <td className="px-4 py-2">
                        <Link
                          to={`/admin/product/${product.productId?._id}`}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                        >
                          Analytics
                        </Link>
                        <Link
                          to={`/admin/products/edit/${product.productId?._id}`}
                          className="text-green-600 hover:text-green-800"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-between">
              <Link to="/admin/products" className="text-green-600 hover:text-green-800">
                View All Products
              </Link>
              <Link to="/admin/products/new" className="text-blue-600 hover:text-blue-800">
                Add New Product
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Order Management</h2>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
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
                      <td className="px-4 py-2">{order.orderNumber || order._id.substring(0, 8)}</td>
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
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {order.trackingNumber ? order.trackingNumber : "Not assigned"}
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
              <Link to="/admin/orders" className="text-green-600 hover:text-green-800">
                View All Orders
              </Link>
            </div>
          </div>
          
          {/* Order Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4">Order Status Overview</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Pending', value: recentOrders.filter(o => o.status === 'pending').length },
                        { name: 'Processing', value: recentOrders.filter(o => o.status === 'processing').length },
                        { name: 'Shipped', value: recentOrders.filter(o => o.status === 'shipped').length },
                        { name: 'Delivered', value: recentOrders.filter(o => o.status === 'delivered').length },
                        { name: 'Cancelled', value: recentOrders.filter(o => o.status === 'cancelled').length }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
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
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4">Order Processing Times</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Average time from order to shipping</p>
                  <p className="text-2xl font-bold text-green-600">2.3 days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Average time from shipping to delivery</p>
                  <p className="text-2xl font-bold text-green-600">4.1 days</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total order fulfillment time</p>
                  <p className="text-2xl font-bold text-green-600">6.4 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sales Analytics</h2>
            <div className="flex space-x-2">
              <select className="border rounded px-3 py-1">
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="year">Last Year</option>
              </select>
              <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">
                Export
              </button>
            </div>
          </div>
          
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Revenue Trends</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyRevenueData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#0088FE" />
                  <YAxis yAxisId="right" orientation="right" stroke="#00C49F" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#0088FE"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue ($)"
                    stroke="#00C49F"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Category and Product Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4">Category Performance</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue ($)" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-medium mb-4">Revenue vs Views</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productViewData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="views" name="Views" fill="#8884d8" />
                    <Bar yAxisId="right" dataKey="revenue" name="Revenue ($)" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Customer Insights */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-medium mb-4">Customer Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">New Customers</p>
                <p className="text-2xl font-bold text-green-600">+12%</p>
                <p className="text-xs text-gray-500">vs. last period</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Repeat Customers</p>
                <p className="text-2xl font-bold text-green-600">42%</p>
                <p className="text-xs text-gray-500">of total customers</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Avg. Order Value</p>
                <p className="text-2xl font-bold text-green-600">$127.85</p>
                <p className="text-xs text-gray-500">+5% vs. last period</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
