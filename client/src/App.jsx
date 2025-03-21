import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
// import "./App.css";
import { AuthProvider } from "./hooks/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import About from "./pages/About";
import AuthPage from "./pages/AuthPage";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import ProductsPage from "./pages/ProductsPage";
import Profile from "./pages/Profile"; // Added import for Profile page
import CustomOrderForm from "./pages/CustomOrderForm";
import CustomerOrderDetail from "./pages/CustomerOrderDetail";
import CustomOrderDetail from "./pages/CustomOrderDetail";
// Lazy load admin components
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ProductAnalytics = lazy(() => import("./pages/ProductAnalytics"));
const ProductManagement = lazy(() => import("./pages/ProductManagement"));
const ProductForm = lazy(() => import("./pages/ProductForm"));
const CategoryManagement = lazy(() => import("./pages/CategoryManagement"));
const OrderDetail = lazy(() => import("./pages/OrderDetail")); // Added import for OrderDetail

const AppLayout = () => {
  const { pathname } = useLocation();
  return (
    <>
      {pathname !== "/auth" && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password/:token" element={<AuthPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/product/:productId" element={<ProductDetail />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/cart" element={<Cart />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          }
        />
        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <Suspense fallback={<div>Loading...</div>}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/product/:productId"
          element={
            <ProtectedRoute adminOnly={true}>
              <Suspense fallback={<div>Loading...</div>}>
                <ProductAnalytics />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute adminOnly={true}>
              <Suspense fallback={<div>Loading...</div>}>
                <ProductManagement />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute adminOnly={true}>
              <Suspense fallback={<div>Loading...</div>}>
                <ProductForm />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/edit/:productId"
          element={
            <ProtectedRoute adminOnly={true}>
              <Suspense fallback={<div>Loading...</div>}>
                <ProductForm />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute adminOnly={true}>
              <Suspense fallback={<div>Loading...</div>}>
                <CategoryManagement />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders/:orderId"
          element={
            <ProtectedRoute adminOnly={true}>
              <Suspense fallback={<div>Loading...</div>}>
                <OrderDetail />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom-order"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div>Loading...</div>}>
                <CustomOrderForm />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/custom-orders/success"
          element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:orderId"
          element={
            <ProtectedRoute>
              <CustomerOrderDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/custom-orders/:orderId"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div>Loading...</div>}>
                <CustomOrderDetail />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
};

const App = () => (
  <AuthProvider>
    <AppLayout />
  </AuthProvider>
);

export default App;
