import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./hooks/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute"; // Assumed existence
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import AuthPage from "./pages/AuthPage";

// Lazy load admin components
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ProductAnalytics = lazy(() => import("./pages/ProductAnalytics"));
const ProductManagement = lazy(() => import("./pages/ProductManagement"));
const ProductForm = lazy(() => import("./pages/ProductForm"));
const CategoryManagement = lazy(() => import("./pages/CategoryManagement"));

const AppLayout = () => {
  const { pathname } = useLocation();
  return (
    <>
      {pathname !== "/auth" && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/reset-password/:token" element={<AuthPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div>Loading...</div>}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/product/:productId"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div>Loading...</div>}>
                <ProductAnalytics />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div>Loading...</div>}>
                <ProductManagement />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div>Loading...</div>}>
                <ProductForm />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/edit/:productId"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div>Loading...</div>}>
                <ProductForm />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div>Loading...</div>}>
                <CategoryManagement />
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
    <Router>
      <AppLayout />
    </Router>
  </AuthProvider>
);

export default App;