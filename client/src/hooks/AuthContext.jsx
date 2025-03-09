import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Good practice to have a loading state
  const [authError, setAuthError] = useState(null); // Add error state

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        localStorage.removeItem("user"); // Remove invalid data
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    setAuthError(null); // Clear any previous errors
    setLoading(true); // Set loading state
    try {
      const response = await fetch("/api/login", {
        // Replace with your actual login endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed"); // Use more specific error messages if your API provides them
      }

      const data = await response.json();
      setUser(data.user); // Assuming your API returns the user object
      localStorage.setItem("user", JSON.stringify(data.user)); // Store user data
      return data; // Return data on success (optional, but useful)
    } catch (error) {
      setAuthError(error.message); // Store error message
      throw error; // Re-throw the error to be caught by the component
    } finally {
      setLoading(false); // Reset loading state
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
      return data;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
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
