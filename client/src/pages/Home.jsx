import React from "react";
import HeroSection from "../components/HeroSection";

const Home = () => {
  return (
    <div className=" items-center justify-center bg-gray-100 h-[calc(100vh-4rem)] overflow-auto scrollbar-hide">
      <HeroSection />
      
    </div>
  );
};

export default Home;
