import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../hooks/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
