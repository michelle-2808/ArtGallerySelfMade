// client/src/pages/AdminDashboard.jsx
import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../hooks/AuthContext";
import Overview from "../components/admin/Overview";
import Products from "../components/admin/Products";
import Orders from "../components/admin/Orders";
import Analytics from "../components/admin/Analytics";
// Added CustomOrders component import
import CustomOrders from "../components/admin/CustomOrders";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState(null);
  const [productAnalytics, setProductAnalytics] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [customOrders, setCustomOrders] = useState([]); // State for custom orders
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        let token = localStorage.getItem("token");

        if (!token && user && user.token) {
          token = user.token;
          localStorage.setItem("token", token);
        }

        if (!token) {
          setError("Authentication token not found. Please login again.");
          setLoading(false);
          return;
        }

        const dashboardResponse = await fetch("/api/admin/dashboard", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!dashboardResponse.ok) {
          if (dashboardResponse.status === 401) {
            throw new Error("Authentication failed. Please login again.");
          }
          throw new Error("Failed to fetch dashboard data");
        }

        const dashboardResult = await dashboardResponse.json();
        setDashboardData(dashboardResult);

        const analyticsResponse = await fetch("/api/admin/analytics/products", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!analyticsResponse.ok) {
          throw new Error("Failed to fetch product analytics");
        }

        const analyticsResult = await analyticsResponse.json();
        setProductAnalytics(analyticsResult);

        const ordersResponse = await fetch("/api/admin/recent-orders", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!ordersResponse.ok) {
          throw new Error("Failed to fetch recent orders");
        }

        const ordersResult = await ordersResponse.json();
        setRecentOrders(ordersResult);

        // Custom orders are now fetched directly in the CustomOrders component

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

  if (user && !user.isAdmin) {
    return <Navigate to="/" />;
  }

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

  return (
    <div className=" mx-auto px-48 py-16">
      <h1 className="text-3xl font-bold mb-8 font-playfair">Admin Dashboard</h1>
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
        <button
          className={`mr-4 py-2 px-4 font-medium ${
            activeTab === "customOrders"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-600 hover:text-green-600"
          }`}
          onClick={() => setActiveTab("customOrders")}
        >
          Custom Orders
        </button>
      </div>
      {/* Conditionally render the selected tab's component */}
      {activeTab === "overview" && (
        <Overview
          dashboardData={dashboardData}
          recentOrders={recentOrders}
          productAnalytics={productAnalytics}
        />
      )}
      {activeTab === "products" && (
        <Products productAnalytics={productAnalytics} />
      )}
      {activeTab === "orders" && <Orders recentOrders={recentOrders} />}
      {activeTab === "analytics" && (
        <Analytics
          dashboardData={dashboardData}
          productAnalytics={productAnalytics}
        />
      )}
      {activeTab === "customOrders" && (
        <CustomOrders customOrders={customOrders} />
      )}{" "}
      {/* Added CustomOrders tab */}
    </div>
  );
};

export default AdminDashboard;
