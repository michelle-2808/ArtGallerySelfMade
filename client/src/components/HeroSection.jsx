import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section
      id="hero-section"
      className="relative text-white py-20 md:py-20" //Keep this.
      style={{
        backgroundImage: `
      linear-gradient(to right, rgba(34, 218, 102, 0.75), rgba(232, 243, 78, 0.67), rgba(249, 215, 22, 0.69)),
      url('https://images.unsplash.com/photo-1517697471339-4aa32003c11a?q=80&w=2076&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')
    `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100vw",
        height: "400px",
        position: "relative",
        left: "calc(-50vw + 50%)",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-40"></div>
      <div className="container mx-auto px-2 relative z-10">
        {/* Main change is here: */}
        <div className="max-w-3xl ml-auto pr-4 md:pr-4">
          {" "}
          {/* Right-align and padding */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-playfair">
            Amruta's Art Gallery
          </h1>
          <p className="text-lg md:text-xl mb-10 leading-relaxed">
            Explore a collection of unique, handmade artworks, crafted with
            passion and care. Each piece tells a story and brings beauty to your
            space.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="bg-white hover:bg-gray-100 text-green-700 font-semibold py-3 px-8 rounded-full text-base transition duration-300 ease-in-out"
            >
              Browse Collection
            </Link>
            <Link
              to="/about"
              className="bg-transparent hover:bg-white text-white hover:text-green-700 font-semibold py-3 px-8 rounded-full border-2 border-white hover:border-gray-100 transition duration-300 ease-in-out text-base"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
