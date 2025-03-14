// client/src/components/admin/Products.jsx
import React from "react";
import { Link } from "react-router-dom";

const Products = ({ productAnalytics }) => {
  return (
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

      <div className="bg-white p-6 rounded-xl shadow-md">
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
                      ? (
                          (product.purchaseCount / product.viewCount) *
                          100
                        ).toFixed(2)
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
          <Link
            to="/admin/products"
            className="text-green-600 hover:text-green-800"
          >
            View All Products
          </Link>
          <Link
            to="/admin/products/new"
            className="text-blue-600 hover:text-blue-800"
          >
            Add New Product
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Products;
