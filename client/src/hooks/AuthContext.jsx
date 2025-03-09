import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data; // Return for consistency
    } catch (error) {
      setAuthError(error.message);
      throw error; // Re-throw
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, otp) => {
    setAuthError(null);
    setLoading(true);
    try {
      let url = "/api/register";
      let body = { email, password, otp };

      if (!otp) {
        url = "/api/request-otp";
        body = { email, password };
      }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration Failed");
      }

      const data = await response.json();
      if (otp) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data; // Return for consistency
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("Logout failed on the server");
      }
      setUser(null);
      localStorage.removeItem("user");
      // NO NAVIGATION HERE!
    } catch (error) {
      console.error("Logout error:", error);
      setAuthError(error.message || "Logout failed");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, authError }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
