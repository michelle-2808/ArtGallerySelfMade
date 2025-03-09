import React, { useState, useEffect } from "react";
import HeroSection from "../components/HeroSection";
import ProductCard from "../components/ProductCard";
import axios from "axios";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Query parameters
      const params = {};
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      const response = await axios.get("/api/products", { params });

      // Extract products from the response structure
      const productsData = response.data.products || [];

      // Filter featured products
      const featured = productsData.filter((product) => product.featured);

      // Get unique categories
      const uniqueCategories = [
        ...new Set(productsData.map((product) => product.category)),
      ];

      setProducts(productsData);
      setFeaturedProducts(featured);
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <HeroSection />

      <div className="container mx-auto px-4 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Browse Art by Category</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === "all"
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              All
            </button>

            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && selectedCategory === "all" && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 font-playfair">
              Featured Artworks
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* All Products Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8 font-playfair">
            {selectedCategory === "all"
              ? "All Artworks"
              : `${selectedCategory} Artworks`}
          </h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner">Loading...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No artworks found in this category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
