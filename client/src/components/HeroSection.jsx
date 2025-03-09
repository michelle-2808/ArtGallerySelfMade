import React from "react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section
      id="hero-section"
      className="relative text-white py-32 md:py-40 overflow-hidden"
      style={{
        backgroundImage: `
          linear-gradient(to right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.4)), 
          url('https://images.unsplash.com/photo-1517697471339-4aa32003c11a?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100vw",
        height: "550px",
        position: "relative",
        left: "calc(-50vw + 50%)",
      }}
    >
      <div className="absolute top-0 right-0 bottom-0 w-3/4 md:w-2/3 bg-gradient-to-l from-green-600/50 via-green-500/30 to-transparent"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl ml-auto pr-4 md:pr-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 font-playfair leading-tight">
            Amruta's <span className="text-green-300">Art Gallery</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 leading-relaxed text-gray-100 max-w-2xl">
            Discover a world of artistic expression through our curated
            collection of handcrafted artworks, each piece telling a unique
            story and bringing beauty to your space.
          </p>
          <div className="flex flex-col sm:flex-row gap-5">
            <Link
              to="/products"
              className="bg-white hover:bg-gray-100 text-green-700 font-semibold py-3.5 px-8 rounded-full text-base transition duration-300 ease-in-out shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-flex items-center justify-center"
            >
              <span>Browse Collection</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
            <Link
              to="/about"
              className="bg-transparent hover:bg-white/20 text-white font-semibold py-3.5 px-8 rounded-full border-2 border-white hover:border-white/80 transition duration-300 ease-in-out text-base backdrop-blur-sm inline-flex items-center justify-center"
            >
              <span>Learn More</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent"></div>
    </section>
  );
};

export default HeroSection;
