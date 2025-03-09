
import { useState, useEffect, useContext } from "react";
import { useParams, Navigate } from "react-router-dom";
import AuthContext from "../hooks/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const ProductAnalytics = () => {
  const { productId } = useParams();
  const { user } = useContext(AuthContext);
  const [productData, setProductData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProductAnalytics = async () => {
      try {
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

    if (user && user.role === "admin" && productId) {
      fetchProductAnalytics();
    }
  }, [user, productId]);

  // If user is not admin, redirect to home
  if (user && user.role !== "admin") {
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

  // Mock time-series data for the chart (in a real app, this would come from the backend)
  const timeSeriesData = [
    { date: '2023-01', views: 24, purchases: 4, revenue: 400 },
    { date: '2023-02', views: 37, purchases: 7, revenue: 700 },
    { date: '2023-03', views: 45, purchases: 12, revenue: 1200 },
    { date: '2023-04', views: 52, purchases: 15, revenue: 1500 },
    { date: '2023-05', views: 49, purchases: 10, revenue: 1000 },
    { date: '2023-06', views: 60, purchases: 18, revenue: 1800 },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 font-playfair">
        Product Analytics: {productData?.title || "Unknown Product"}
      </h1>

      {/* Product Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/4 mb-4 md:mb-0">
            {productData?.imageUrl && (
              <img
                src={productData.imageUrl}
                alt={productData.title}
                className="rounded-lg w-full object-cover"
                style={{ maxHeight: "200px" }}
              />
            )}
          </div>
          <div className="md:w-3/4 md:pl-6">
            <h2 className="text-2xl font-bold mb-2">{productData?.title}</h2>
            <p className="text-gray-600 mb-2">{productData?.description}</p>
            <p className="text-xl font-bold text-green-600">${productData?.price?.toFixed(2)}</p>
            <div className="mt-4">
              <p className="text-gray-700">
                <span className="font-semibold">Category:</span> {productData?.category}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">In Stock:</span> {productData?.stock || 0} units
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Views</h2>
          <p className="text-3xl font-bold text-green-600">{analytics?.viewCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Purchases</h2>
          <p className="text-3xl font-bold text-green-600">{analytics?.purchaseCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-700">Total Revenue</h2>
          <p className="text-3xl font-bold text-green-600">
            ${analytics?.revenue?.toFixed(2) || "0.00"}
          </p>
        </div>
      </div>

      {/* Performance Over Time Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Performance Over Time</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="views" stroke="#8884d8" name="Views" />
            <Line type="monotone" dataKey="purchases" stroke="#82ca9d" name="Purchases" />
            <Line type="monotone" dataKey="revenue" stroke="#ff7300" name="Revenue ($)" />
          </LineChart>
        </ResponsiveContainer>
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
