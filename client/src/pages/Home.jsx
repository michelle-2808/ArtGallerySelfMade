import React from "react";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 h-[calc(100vh-4rem)] overflow-auto scrollbar-hide">
      <h1 className="text-4xl font-bold text-gray-800">
        Welcome to the Home Page
      </h1>
      <p className="text-lg text-gray-600 mt-2">
        This is a React app with Tailwind CSS.
      </p>
      <p className="text-lg text-gray-600 mt-2">
        Add more content here to test scrolling...
      </p>
    </div>
  );
};

export default Home;
