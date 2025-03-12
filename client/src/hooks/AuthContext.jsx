import { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialize user as undefined to indicate "not yet determined"
  // This way, components can differentiate between "no user" (null) and "still loading" (undefined)
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const validateAuth = async () => {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (storedUser && token) {
        try {
          // Validate the token by making a request to the server
          const response = await fetch("/api/auth/validate-token", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            setUser(JSON.parse(storedUser));
          } else {
            console.warn("Token validation failed, logging out user");
            localStorage.removeItem("user");
            localStorage.removeItem("token");
            setUser(null);
          }
        } catch (error) {
          console.error("Error validating authentication:", error);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } else if (storedUser && !token) {
        console.warn("User data found but token missing, logging out");
        localStorage.removeItem("user");
        setUser(null);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    validateAuth();
  }, []);

  // Add axios interceptor to add token to all requests
  useEffect(() => {
    // This could be used to set up a global axios interceptor if needed
    console.log("Auth context initialized");
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Include cookies in the request
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();
      console.log("Login response:", data); // Debug login response

      // Store the token in localStorage for API requests
      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log(
          "Token stored successfully:",
          data.token.substring(0, 15) + "..."
        );
      } else {
        console.warn("No token received from server");
      }

      // Make sure user has isAdmin property if it exists in the response
      const userToStore = {
        ...data.user,
        token: data.token || null, // Add token to user object for redundancy
      };

      setUser(userToStore);
      localStorage.setItem("user", JSON.stringify(userToStore));
      return data;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, otp) => {
    setAuthError(null);
    setLoading(true);
    try {
      let url = "/api/auth/register";
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
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      // Remove token from localStorage on logout
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        authError,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
