// client/src/components/admin/Analytics.jsx
import React from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Analytics = ({ dashboardData, productAnalytics }) => {
  const productViewData = productAnalytics
    .map((item) => ({
      name: item.productId?.title || "Unknown",
      views: item.viewCount,
      purchases: item.purchaseCount,
      revenue: item.revenue,
    }))
    .slice(0, 5);

  const weeklyRevenueData =
    dashboardData?.weeklyRevenue?.map((week) => ({
      name: `Week ${week._id.week}`,
      revenue: week.revenue,
      orders: week.orders,
    })) || [];

  const categoryData =
    dashboardData?.salesByCategory?.map((category) => ({
      name: category._id || "Unknown",
      revenue: category.revenue,
      count: category.count,
    })) || [];
  return (
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
      <div className="bg-white p-6 rounded-xl shadow-md">
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
        <div className="bg-white p-6 rounded-xl shadow-md">
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

        <div className="bg-white p-6 rounded-xl shadow-md">
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
                <Bar
                  yAxisId="left"
                  dataKey="views"
                  name="Views"
                  fill="#8884d8"
                />
                <Bar
                  yAxisId="right"
                  dataKey="revenue"
                  name="Revenue ($)"
                  fill="#82ca9d"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Customer Insights */}
      <div className="bg-white p-6 rounded-xl shadow-md">
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
  );
};

export default Analytics;
