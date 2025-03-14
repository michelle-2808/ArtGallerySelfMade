import React, { useState, useEffect, useRef } from "react";
import HeroSection from "../components/HeroSection";
import ProductCard from "../components/ProductCard";
import axios from "axios";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const productContainerRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const initialResponse = await axios.get("/api/products");
        const initialProductsData = initialResponse.data.products || [];
        const uniqueCategories = [
          ...new Set(initialProductsData.map((product) => product.category)),
        ];
        setAllCategories(uniqueCategories);
        setProducts(initialProductsData); // All products initially
        setFeaturedProducts(
          initialProductsData.filter((product) => product.featured)
        );
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    if (initialLoad) {
      fetchInitialData();
    }
  }, [initialLoad]);

  useEffect(() => {
    if (!initialLoad) {
      fetchProducts();
    }
  }, [selectedCategories, initialLoad]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let newProducts = [];

      if (selectedCategories.length === 0) {
        // Fetch all products if no categories are selected
        const response = await axios.get("/api/products");
        newProducts = response.data.products || [];
        // Remove duplicates
        const uniqueNewProducts = Array.from(
          new Set(newProducts.map((product) => product._id))
        ).map((id) => newProducts.find((product) => product._id === id));

        setProducts(uniqueNewProducts); // Replace, don't append, when fetching all
        setFeaturedProducts(
          uniqueNewProducts.filter((product) => product.featured)
        );
      } else {
        // Fetch products for selected categories
        const categoryPromises = selectedCategories.map((category) =>
          axios.get("/api/products", { params: { category } })
        );
        const categoryResponses = await Promise.all(categoryPromises);

        categoryResponses.forEach((response) => {
          newProducts = newProducts.concat(response.data.products || []);
        });

        // Remove duplicates
        const uniqueNewProducts = Array.from(
          new Set(newProducts.map((product) => product._id))
        ).map((id) => newProducts.find((product) => product._id === id));

        setProducts(uniqueNewProducts); // Replace, don't append, when categories are selected
        setFeaturedProducts(
          uniqueNewProducts.filter((product) => product.featured)
        );
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const getHeadingText = () => {
    if (selectedCategories.length === 0) {
      return "All Artworks";
    } else if (selectedCategories.length === 1) {
      return `${selectedCategories[0]} Artworks`;
    } else {
      return "Selected Artworks";
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen page-container">
      <HeroSection />

      <div className=" container mx-auto px-8 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 font-playfair">Browse Art by Category</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategories([])}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategories.length === 0
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              All
            </button>

            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategories.includes(category)
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Products (only when no categories selected) */}
        {featuredProducts.length > 0 && selectedCategories.length === 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 font-playfair">
              Featured Artworks
            </h2>
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              ref={productContainerRef}
            >
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}

        {/* All Products Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8 font-playfair">
            {getHeadingText()}
          </h2>

          {loading && (
            <div className="flex justify-center py-12">
              <div className="spinner">Loading...</div>
            </div>
          )}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            ref={productContainerRef}
          >
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {!loading && products.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No artworks found in this category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
