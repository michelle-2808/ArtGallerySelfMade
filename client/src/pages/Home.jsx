
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured products
        const featuredResponse = await fetch('/api/products?featured=true&limit=4');
        if (!featuredResponse.ok) throw new Error('Failed to fetch featured products');
        const featuredData = await featuredResponse.json();
        
        // Fetch new arrivals
        const newArrivalsResponse = await fetch('/api/products?sort=createdAt&limit=4');
        if (!newArrivalsResponse.ok) throw new Error('Failed to fetch new products');
        const newArrivalsData = await newArrivalsResponse.json();
        
        // Fetch categories
        const categoriesResponse = await fetch('/api/products/categories');
        if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
        const categoriesData = await categoriesResponse.json();
        
        setFeaturedProducts(featuredData);
        setNewArrivals(newArrivalsData);
        setCategories(categoriesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching home page data:', error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto my-8 max-w-6xl">
        <p>Failed to load products. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with artistic background */}
      <section className="relative py-32 bg-gradient-to-r from-purple-700 via-indigo-500 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-playfair font-bold mb-8">Amruta's Art Gallery</h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
              Discover unique artistic masterpieces that bring life and soul to your space
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products" className="bg-white text-indigo-700 hover:bg-opacity-90 py-3 px-8 rounded-full font-medium text-lg transition duration-300">
                Explore Gallery
              </Link>
              <Link to="/about" className="bg-transparent border-2 border-white hover:bg-white hover:text-indigo-700 py-3 px-8 rounded-full font-medium text-lg transition duration-300">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">Featured Masterpieces</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Handpicked artworks that exemplify creativity, passion, and artistic excellence
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product) => (
            <Link 
              to={`/products/${product._id}`} 
              key={product._id}
              className="group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">{product.category}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Link 
            to="/products" 
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-8 rounded-full font-medium transition duration-300"
          >
            View All Artworks
          </Link>
        </div>
      </section>

      {/* Art Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">Explore Art Categories</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dive into our diverse collection of artistic styles and expressions
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link 
                to={`/products?category=${category}`} 
                key={index}
                className="group"
              >
                <div className="relative h-60 rounded-lg overflow-hidden shadow-md">
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-70"></div>
                  <img 
                    src={`/images/categories/${category.toLowerCase().replace(' ', '-')}.jpg`} 
                    alt={category}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/categories/default.jpg';
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-xl font-bold">{category}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">New Arrivals</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The latest additions to our exclusive art collection
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {newArrivals.map((product) => (
            <Link 
              to={`/products/${product._id}`} 
              key={product._id}
              className="group"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-lg transition-transform duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
                <div className="relative">
                  <div className="h-64 overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">New</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{product.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-indigo-600">${product.price.toFixed(2)}</span>
                    <div className="flex items-center">
                      <span className="mr-1 text-yellow-500">★</span>
                      <span className="text-sm text-gray-600">4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-playfair font-bold text-gray-900 mb-4">What Our Customers Say</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover why art enthusiasts choose our gallery for their artistic needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Interior Designer",
                quote: "The quality of art pieces I've purchased from Amruta's Gallery has transformed my clients' spaces. Exceptional curation and service!",
                avatar: "/images/testimonials/avatar-1.jpg"
              },
              {
                name: "Michael Chen",
                role: "Art Collector",
                quote: "I've been collecting art for over 15 years, and Amruta's Gallery consistently impresses me with their unique selections and artist stories.",
                avatar: "/images/testimonials/avatar-2.jpg"
              },
              {
                name: "Priya Sharma",
                role: "Home Owner",
                quote: "The painting I purchased has become the centerpiece of my living room. Everyone who visits comments on its beauty and uniqueness.",
                avatar: "/images/testimonials/avatar-3.jpg"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-6">
                  <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/48';
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic mb-4">"{testimonial.quote}"</blockquote>
                <div className="flex text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-playfair font-bold mb-6">Join Our Art Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Subscribe to receive updates on new arrivals, exclusive offers, and art inspiration
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-grow px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300"
              required
            />
            <button
              type="submit"
              className="bg-white text-indigo-700 hover:bg-opacity-90 px-6 py-3 rounded-full font-medium transition duration-300"
            >
              Subscribe
            </button>
          </form>
          <p className="text-sm mt-4 opacity-80">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
