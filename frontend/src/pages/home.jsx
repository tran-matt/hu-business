// src/pages/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/login'); // Navigate to the Login page when the user clicks "Get Started"
  };

  return (
    <div className="container mx-auto p-4">
      <header className="text-center py-10">
        <h1 className="text-4xl font-bold">Welcome to Our Website</h1>
        <p className="mt-4 text-lg">This is a simple homepage built with React and Tailwind CSS!</p>
      </header>
      <section className="text-center mt-10">
        <button
          onClick={handleGetStarted}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Get Started
        </button>
      </section>
    </div>
  );
}

export default Home;
