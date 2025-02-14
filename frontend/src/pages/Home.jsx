// src/pages/Home.jsx
import React from 'react';

const Home = () => {
  return (
    <div className="flex h-screen bg-howard-gray text-howard-navy">
      <div className="m-auto text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to the Howard University School of Business</h1>
        <p className="text-xl mb-8">Track your courses, monitor progress, and ensure you stay on track to graduate!</p>
        <a
          href="/login"
          className="px-6 py-3 bg-howard-red text-white rounded-lg text-xl hover:bg-red-700 transition"
        >
          Get Started
        </a>
      </div>
    </div>
  );
};

export default Home;
