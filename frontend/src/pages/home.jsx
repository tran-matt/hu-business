import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Section */}
      <header className="bg-blue-900 text-white py-20 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Howard University Business Course Tracker
          </h1>
          <p className="mt-4 text-lg md:text-xl">
            Stay on top of your academic journey with our intuitive course tracking system. 
            Effortlessly enroll in courses, manage your schedule, and plan your semesters.
          </p>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold text-gray-800 mb-10">
          Why Use This Platform?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border border-gray-300 rounded-lg shadow-md bg-white hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-700">Track Your Courses</h3>
            <p className="text-gray-600 mt-2">
              Easily view your enrolled courses by semester and ensure you’re on the right path to graduation.
            </p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg shadow-md bg-white hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-700">Plan Your Semesters</h3>
            <p className="text-gray-600 mt-2">
              Check available courses and register seamlessly to avoid last-minute confusion.
            </p>
          </div>
          <div className="p-6 border border-gray-300 rounded-lg shadow-md bg-white hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-700">Stay Organized</h3>
            <p className="text-gray-600 mt-2">
              Manage your academic progress effortlessly with our easy-to-use dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section className="text-center py-16 bg-blue-100">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-gray-800">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mt-3">
            Log in to enroll in courses, track your progress, and take control of your academic success.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-800 transition shadow-md"
          >
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
