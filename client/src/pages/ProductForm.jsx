import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CATEGORIES = [
  "Painting",
  "Sculpture",
  "Photography",
  "Digital Art",
  "Prints",
  "Mixed Media",
  "Other",
];

const ProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!productId;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "Painting",
    tags: "",
    stockQuantity: "",
    featured: false,
    width: "",
    height: "",
    depth: "",
    unit: "cm",
    artist: "",
    creationYear: "",
    imageUrl: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }
      const response = await axios.get(`/api/admin/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const product = response.data;

      setFormData({
        title: product.title,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        tags: product.tags?.join(", ") || "",
        stockQuantity: product.stockQuantity.toString(),
        featured: product.featured || false,
        width: product.dimensions?.width?.toString() || "",
        height: product.dimensions?.height?.toString() || "",
        depth: product.dimensions?.depth?.toString() || "",
        unit: product.dimensions?.unit || "cm",
        artist: product.artist || "",
        creationYear: product.creationYear?.toString() || "",
        imageUrl: product.imageUrl || "",
      });

      setImagePreview(product.imageUrl);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.response?.data?.message || "Failed to load product data");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, imageUrl: "" })); // Clear remote URL when file is selected
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.category ||
      !formData.stockQuantity
    ) {
      setError("Please fill all required fields");
      return;
    }

    if (!imageFile && !formData.imageUrl && !imagePreview) {
      setError("Please provide an image");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "") {
          submitData.append(key, formData[key]);
        }
      });

      if (imageFile) {
        submitData.append("image", imageFile);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      let response;
      if (isEditMode) {
        response = await axios.put(
          `/api/admin/products/${productId}`,
          submitData,
          config
        );
      } else {
        response = await axios.post("/api/admin/products", submitData, config);
      }

      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      setError(error.response?.data?.message || "Failed to save product");
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="text-center py-8">Loading product data...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? "Edit Product" : "Add New Product"}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="title"
              >
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full py-2 px-3"
                required
              />
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="description"
              >
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="border border-gray-300 rounded w-full py-2 px-3"
                required
              ></textarea>
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="price"
              >
                Price ($) *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full py-2 px-3"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="category"
              >
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full py-2 px-3"
                required
              >
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="tags"
              >
                Tags (Comma separated)
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full py-2 px-3"
                placeholder="abstract, colorful, modern"
              />
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="stockQuantity"
              >
                Stock Quantity *
              </label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full py-2 px-3"
                min="0"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600"
              />
              <label className="ml-2 block text-gray-700" htmlFor="featured">
                Featured Product
              </label>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Product Image *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="mb-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto h-32 w-auto object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="mt-2 text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}

                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="image"
                        name="image"
                        type="file"
                        className="sr-only"
                        onChange={handleImageChange}
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>
              </div>

              <div className="mt-3">
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="imageUrl"
                >
                  Or Image URL
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="border border-gray-300 rounded w-full py-2 px-3"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="width"
                >
                  Width
                </label>
                <input
                  type="number"
                  id="width"
                  name="width"
                  value={formData.width}
                  onChange={handleChange}
                  className="border border-gray-300 rounded w-full py-2 px-3"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="height"
                >
                  Height
                </label>
                <input
                  type="number"
                  id="height"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="border border-gray-300 rounded w-full py-2 px-3"
                  min="0"
                  step="0.1"
                />
              </div>

              <div>
                <label
                  className="block text-gray-700 font-medium mb-2"
                  htmlFor="depth"
                >
                  Depth
                </label>
                <input
                  type="number"
                  id="depth"
                  name="depth"
                  value={formData.depth}
                  onChange={handleChange}
                  className="border border-gray-300 rounded w-full py-2 px-3"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className="mt-2">
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="unit"
              >
                Unit
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full py-2 px-3"
              >
                <option value="cm">Centimeters (cm)</option>
                <option value="in">Inches (in)</option>
              </select>
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="artist"
              >
                Artist
              </label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full py-2 px-3"
              />
            </div>

            <div>
              <label
                className="block text-gray-700 font-medium mb-2"
                htmlFor="creationYear"
              >
                Creation Year
              </label>
              <input
                type="number"
                id="creationYear"
                name="creationYear"
                value={formData.creationYear}
                onChange={handleChange}
                className="border border-gray-300 rounded w-full py-2 px-3"
                min="1"
                max={new Date().getFullYear()}
              />
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEditMode
              ? "Update Product"
              : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
