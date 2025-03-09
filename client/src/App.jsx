import React, { Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./hooks/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Contact from "./pages/Contact";
import AuthPage from "./pages/AuthPage";

// Lazy load admin components
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const ProductAnalytics = React.lazy(() => import("./pages/ProductAnalytics"));

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
              <React.Suspense fallback={<div>Loading...</div>}>
                <AdminDashboard />
              </React.Suspense>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/product/:productId"
          element={
            <ProtectedRoute>
              <React.Suspense fallback={<div>Loading...</div>}>
                <ProductAnalytics />
              </React.Suspense>
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
// In your App.jsx or router configuration, add these routes
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/product/:productId" element={<ProductAnalytics />} />
