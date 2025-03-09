
import React, { useContext, useEffect, useState } from "react";
import { useParams, Navigate, Link } from "react-router-dom";
import { AuthContext } from "../hooks/AuthContext";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ProductAnalytics = () => {
  const { productId } = useParams();
  const { user } = useContext(AuthContext);
  const [productData, setProductData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState("all");

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  useEffect(() => {
    const fetchProductAnalytics = async () => {
      try {
        setLoading(true);
        // Fetch product details
        const productResponse = await fetch(`/api/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!productResponse.ok) {
          throw new Error("Failed to fetch product data");
        }

        const productResult = await productResponse.json();
        setProductData(productResult);

        // Fetch product analytics
        const analyticsResponse = await fetch(`/api/admin/analytics/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!analyticsResponse.ok) {
          throw new Error("Failed to fetch product analytics");
        }

        const analyticsResult = await analyticsResponse.json();
        setAnalytics(analyticsResult);

        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    if (user && user.isAdmin && productId) {
      fetchProductAnalytics();
    }
  }, [user, productId]);

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

  // Prepare data for weekly statistics chart
  const weeklyStats = analytics?.weeklyStats || [];
  const filteredWeeklyStats = timeRange === "all" 
    ? weeklyStats 
    : weeklyStats.slice(-parseInt(timeRange));

  const weeklyChartData = filteredWeeklyStats.map(week => ({
    name: week.week,
    views: week.views,
    purchases: week.purchases,
    revenue: week.revenue
  }));

  // Prepare audience data
  const audienceData = [
    { name: "Direct", value: 45 },
    { name: "Search", value: 30 },
    { name: "Social", value: 15 },
    { name: "Referral", value: 10 }
  ];

  // Calculate conversion rate
  const conversionRate = analytics?.viewCount > 0
    ? ((analytics.purchaseCount / analytics.viewCount) * 100).toFixed(2)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/admin/dashboard" className="text-green-600 hover:text-green-800">
          &larr; Back to Dashboard
        </Link>
      </div>

      {/* Product Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center mb-8">
        <div className="mr-6 mb-4 md:mb-0">
          <img
            src={productData?.imageUrl}
            alt={productData?.title}
            className="w-24 h-24 object-cover rounded-lg shadow-md"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-playfair">{productData?.title}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
              ${productData?.price?.toFixed(2)}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {productData?.category}
            </span>
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
              Stock: {productData?.stockQuantity}
            </span>
          </div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6">
        <label className="mr-2 font-medium text-gray-700">Time Range:</label>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="all">All Time</option>
          <option value="4">Last 4 Weeks</option>
          <option value="12">Last 12 Weeks</option>
          <option value="26">Last 6 Months</option>
          <option value="52">Last Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Views</h2>
          <p className="text-3xl font-bold text-green-600">{analytics?.viewCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Purchases</h2>
          <p className="text-3xl font-bold text-green-600">{analytics?.purchaseCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-green-600">
            ${analytics?.revenue?.toFixed(2) || "0.00"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Conversion Rate</h2>
          <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
        </div>
      </div>

      {/* Weekly Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Weekly Performance</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={weeklyChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
              <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="views"
                name="Views"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="purchases"
                name="Purchases"
                stroke="#FF8042"
                activeDot={{ r: 8 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                name="Revenue ($)"
                stroke="#82ca9d"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Audience Source</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={audienceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {audienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Related Products Performance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Product A", sales: 35, revenue: 420 },
                  { name: "Product B", sales: 28, revenue: 336 },
                  { name: "Product C", sales: 42, revenue: 504 },
                  { name: "Product D", sales: 16, revenue: 192 }
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" name="Sales" fill="#8884d8" />
                <Bar dataKey="revenue" name="Revenue ($)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Conversion Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">View to Purchase Rate</h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics?.viewCount > 0
                ? ((analytics.purchaseCount / analytics.viewCount) * 100).toFixed(2)
                : 0}%
            </p>
            <p className="text-gray-600 mt-1">
              {analytics?.purchaseCount || 0} purchases from {analytics?.viewCount || 0} views
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Average Revenue Per Purchase</h3>
            <p className="text-3xl font-bold text-green-600">
              ${analytics?.purchaseCount > 0
                ? (analytics.revenue / analytics.purchaseCount).toFixed(2)
                : "0.00"}
            </p>
            <p className="text-gray-600 mt-1">
              ${analytics?.revenue?.toFixed(2) || "0.00"} from {analytics?.purchaseCount || 0} purchases
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductAnalytics;
