import { useState, useContext, useEffect } from "react";
import AuthContext from "../hooks/AuthContext";
import { useNavigate, Link, useParams } from "react-router-dom";

const AuthPage = () => {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [resetPasswordData, setResetPasswordData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [isLoading, setIsLoading] = useState({
    login: false,
    register: false,
    forgotPassword: false,
  });
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [resetToken, setResetToken] = useState(null);
  const { token: routeToken } = useParams();

  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };
  const handleForgotPasswordChange = (e) => {
    setForgotPasswordEmail(e.target.value);
  };

  const handleResetPasswordChange = (e) => {
    setResetPasswordData({
      ...resetPasswordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading({ ...isLoading, login: true });
    setError(null);
    try {
      await login(loginData.email, loginData.password);
      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setIsLoading({ ...isLoading, login: false });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setIsLoading({ ...isLoading, register: true });
    setError(null);
    try {
      await register(
        registerData.email,
        registerData.password,
        registerData.otp
      );
      navigate("/dashboard");
    } catch (error) {
      setError(error.message || "Registration failed");
    } finally {
      setIsLoading({ ...isLoading, register: false });
    }
  };

  const handleGetOTP = async (e) => {
    e.preventDefault();
    setIsLoading({ ...isLoading, register: true });
    setError(null);
    try {
      await requestOtp(registerData.email, registerData.password);
      setOtpSent(true);
    } catch (error) {
      setError(error.message || "Failed to send OTP");
    } finally {
      setIsLoading({ ...isLoading, register: false });
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading({ ...isLoading, forgotPassword: true });
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to request password reset"
        );
      }
      setSuccessMessage(
        "If an account with that email exists, a password reset link has been sent"
      );
      setForgotPasswordEmail("");
    } catch (error) {
      setError(error.message || "Failed to request password reset");
    } finally {
      setIsLoading({ ...isLoading, forgotPassword: false });
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setIsLoading({ ...isLoading, register: true });
    setError(null);
    setSuccessMessage(null);

    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`/api/auth/reset-password/${routeToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: resetPasswordData.password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to reset Password");
      }
      setSuccessMessage("Password has been reset successfully");
      setResetToken(null);
      setIsLogin(true);
      setResetPasswordData({ password: "", confirmPassword: "" });
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading({ ...isLoading, register: false });
    }
  };

  const requestOtp = async (email, password) => {
    try {
      const response = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "OTP request failed");
      }
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    if (routeToken) {
      setResetToken(routeToken);
      setIsLogin(false);
      setIsForgotPassword(false);
    }
  }, [routeToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-playfair font-bold">
              Amrutas Art Gallery
            </h1>
            <p className="text-muted-foreground mt-2">
              Discover unique handmade artworks from talented artists
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-xl w-96 min-h-[450px] flex flex-col">
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {successMessage && (
              <p className="text-green-500 text-sm mb-4">{successMessage}</p>
            )}

            {!isForgotPassword && !resetToken && (
              <>
                <h2 className="text-2xl font-bold text-center mb-4">
                  Welcome Back
                </h2>
                <div className="flex justify-center mb-4">
                  <button
                    className={`py-2 px-4 w-1/2 rounded-l-xl transition-colors duration-200 ${
                      isLogin
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => {
                      setIsLogin(true);
                      setIsForgotPassword(false);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                  >
                    Login
                  </button>
                  <button
                    className={`py-2 px-4 w-1/2 rounded-r-xl transition-colors duration-200 ${
                      !isLogin
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                    onClick={() => {
                      setIsLogin(false);
                      setIsForgotPassword(false);
                      setOtpSent(false);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                  >
                    Register
                  </button>
                </div>

                {isLogin ? (
                  <form
                    onSubmit={handleLoginSubmit}
                    className="flex flex-col space-y-4"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        placeholder="Email Address"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="password"
                        className="block text-sm font-medium"
                      >
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 w-full font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      disabled={isLoading.login}
                    >
                      {isLoading.login ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mx-auto"></div>
                      ) : (
                        "Login"
                      )}
                    </button>
                    <button
                      type="button"
                      className="text-green-500 text-sm hover:underline"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setIsLogin(false);
                        setError(null);
                        setSuccessMessage(null);
                        setResetToken(null);
                      }}
                    >
                      Forgot password?
                    </button>
                  </form>
                ) : (
                  <form
                    onSubmit={otpSent ? handleRegisterSubmit : handleGetOTP}
                    className="flex flex-col space-y-4"
                  >
                    <div className="space-y-2">
                      <label
                        htmlFor="email-reg"
                        className="block text-sm font-medium"
                      >
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email-reg"
                        placeholder="Email Address"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="password-reg"
                        className="block text-sm font-medium"
                      >
                        Password
                      </label>

                      <input
                        type="password"
                        name="password"
                        id="password-reg"
                        placeholder="Password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                    {otpSent && (
                      <div className="space-y-2">
                        <label
                          htmlFor="otp"
                          className="block text-sm font-medium"
                        >
                          OTP
                        </label>
                        <input
                          type="text"
                          name="otp"
                          id="otp"
                          placeholder="Enter OTP"
                          value={registerData.otp}
                          onChange={handleRegisterChange}
                          className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                          required
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 w-full font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                      disabled={isLoading.register}
                    >
                      {isLoading.register ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mx-auto"></div>
                      ) : otpSent ? (
                        "Signup"
                      ) : (
                        "Get OTP"
                      )}
                    </button>
                  </form>
                )}
                <p className="text-center mt-auto">
                  {isLogin ? "Not a member?" : "Already a member?"}
                  <button
                    type="button"
                    className="text-green-500 hover:underline"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setOtpSent(false);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                  >
                    {isLogin ? "Signup now" : "Login now"}
                  </button>
                </p>
              </>
            )}

            {isForgotPassword && (
              <>
                <h2 className="text-2xl font-bold text-center mb-4">
                  Forgot Password
                </h2>
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="flex flex-col space-y-4"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="forgot-email"
                      className="block text-sm font-medium"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="forgot-email"
                      placeholder="Enter your email"
                      value={forgotPasswordEmail}
                      onChange={handleForgotPasswordChange}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 w-full font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    disabled={isLoading.forgotPassword}
                  >
                    {isLoading.forgotPassword ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mx-auto"></div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                  <button
                    type="button"
                    className="text-green-500  text-center"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setIsLogin(true);
                      setError(null);
                      setSuccessMessage(null);
                      setResetToken(null);
                    }}
                  >
                    Back to Login
                  </button>
                </form>
              </>
            )}

            {resetToken && (
              <>
                <h2 className="text-2xl font-bold text-center mb-4">
                  Reset Password
                </h2>
                <form
                  onSubmit={handleResetPasswordSubmit}
                  className="flex flex-col space-y-4"
                >
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Enter new password"
                      value={resetPasswordData.password}
                      onChange={handleResetPasswordChange}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium"
                    >
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      id="confirm-password"
                      placeholder="Confirm new password"
                      value={resetPasswordData.confirmPassword}
                      onChange={handleResetPasswordChange}
                      className="border p-3 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 w-full font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    disabled={isLoading.register}
                  >
                    {isLoading.register ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mx-auto"></div>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <div className="hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1481277542470-605612bd2d61"
            alt="Gallery Space"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
