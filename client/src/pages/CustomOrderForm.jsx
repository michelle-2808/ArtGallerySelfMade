import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function CustomOrderForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productDetails: {
      title: "",
      description: "",
      specifications: "",
      customizations: "",
      expectedPrice: "",
      attachments: [],
    },
    customerInfo: {
      name: "",
      phone: "",
      email: "",
    },
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "",
    },
  });
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e, section, field) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: e.target.value,
      },
    }));
  };

  const requestOtp = async () => {
    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      await axios.post(
        "/api/custom-orders/request-otp",
        {
          phone: formData.customerInfo.phone,
          email: formData.customerInfo.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setShowOtpInput(true);
      setError(null);
    } catch (error) {
      console.error("OTP Request Error:", error);
      setError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.productDetails.title ||
      !formData.productDetails.description ||
      !formData.customerInfo.name ||
      !formData.customerInfo.phone ||
      !formData.customerInfo.email ||
      !formData.shippingAddress.street ||
      !formData.shippingAddress.city ||
      !formData.shippingAddress.state ||
      !formData.shippingAddress.zip ||
      !formData.shippingAddress.country
    ) {
      setError("Please fill in all required fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.customerInfo.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate phone number format (assuming 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.customerInfo.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    if (!showOtpInput) {
      requestOtp();
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/custom-orders/submit",
        {
          ...formData,
          otp,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/custom-orders/success");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit order");
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Custom Order Request</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6">
        {/* Left Column */}
        <div className="md:w-1/2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Product Details</h3>
            <input
              type="text"
              placeholder="Product Title"
              onChange={(e) => handleChange(e, "productDetails", "title")}
              className="w-full p-2 border rounded"
              required
            />
            <textarea
              placeholder="Description"
              onChange={(e) => handleChange(e, "productDetails", "description")}
              className="w-full p-2 border rounded h-32"
              required
            />
            <textarea
              placeholder="Specifications"
              onChange={(e) =>
                handleChange(e, "productDetails", "specifications")
              }
              className="w-full p-2 border rounded h-32"
            />
            <input
              type="number"
              placeholder="Expected Price"
              onChange={(e) =>
                handleChange(e, "productDetails", "expectedPrice")
              }
              className="w-full p-2 border rounded"
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Image URLs (Reference images, sketches, etc.)
              </label>
              <div className="space-y-2">
                {formData.productDetails.attachments.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newAttachments = [
                          ...formData.productDetails.attachments,
                        ];
                        newAttachments[index] = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          productDetails: {
                            ...prev.productDetails,
                            attachments: newAttachments,
                          },
                        }));
                      }}
                      placeholder="Enter image URL"
                      className="flex-1 p-2 border rounded"
                    />
                    {url && (
                      <img
                        src={url}
                        alt="Preview"
                        className="h-10 w-10 object-cover rounded"
                        onError={(e) => (e.target.style.display = "none")}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const newAttachments =
                          formData.productDetails.attachments.filter(
                            (_, i) => i !== index
                          );
                        setFormData((prev) => ({
                          ...prev,
                          productDetails: {
                            ...prev.productDetails,
                            attachments: newAttachments,
                          },
                        }));
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      productDetails: {
                        ...prev.productDetails,
                        attachments: [...prev.productDetails.attachments, ""],
                      },
                    }));
                  }}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  + Add Image URL
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Customer Information</h3>
            <input
              type="text"
              placeholder="Full Name"
              onChange={(e) => handleChange(e, "customerInfo", "name")}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              onChange={(e) => handleChange(e, "customerInfo", "phone")}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => handleChange(e, "customerInfo", "email")}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="md:w-1/2 space-y-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Shipping Address</h3>
            <input
              type="text"
              placeholder="Street Address"
              onChange={(e) => handleChange(e, "shippingAddress", "street")}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="City"
              onChange={(e) => handleChange(e, "shippingAddress", "city")}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="State"
              onChange={(e) => handleChange(e, "shippingAddress", "state")}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="ZIP Code"
              onChange={(e) => handleChange(e, "shippingAddress", "zip")}
              className="w-full p-2 border rounded"
              required
            />
            <input
              type="text"
              placeholder="Country"
              onChange={(e) => handleChange(e, "shippingAddress", "country")}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          {showOtpInput ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Verify Phone Number</h3>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                disabled={processing}
              >
                {processing ? "Processing..." : "Submit Order"}
              </button>
            </div>
          ) : (
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              onClick={requestOtp}
              disabled={processing}
            >
              {processing ? "Processing..." : "Continue with OTP"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
