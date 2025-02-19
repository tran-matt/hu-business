import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useUser } from "../context/userContext";
import hulogo from "../assets/hulogo.png"; // ✅ Correct logo import

const Navbar = () => {
  const { user, logoutUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="bg-gray-800 text-white py-4 shadow-md"> {/* ✅ Gray Navbar */}
      <div className="container mx-auto flex justify-between items-center px-6">
        {/* ✅ Logo Section */}
        <Link to="/" className="flex items-center space-x-3">
          <img src={hulogo} alt="HU Business Logo" className="h-10 w-auto" />
          <span className="text-lg font-bold hidden sm:block">HU Business</span>
        </Link>

        {/* ✅ Mobile Menu Toggle */}
        <button
          className="sm:hidden text-white focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "✖" : "☰"}
        </button>

        {/* ✅ Nav Links - Responsive */}
        <div
          className={`sm:flex sm:space-x-6 absolute sm:static top-16 left-0 w-full sm:w-auto bg-gray-800 sm:bg-transparent transition-all duration-300 ease-in-out ${
            menuOpen ? "block" : "hidden"
          }`}
        >
          <Link to="/" className="block sm:inline-block px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent rounded">Home</Link>
          {user && <Link to="/dashboard" className="block sm:inline-block px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent rounded">Dashboard</Link>}
          {user?.isAdmin && <Link to="/admin" className="block sm:inline-block px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent rounded">Admin</Link>}
          {!user ? (
            <>
              <Link to="/login" className="block sm:inline-block px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent rounded">Login</Link>
              <Link to="/register" className="block sm:inline-block px-4 py-2 hover:bg-gray-700 sm:hover:bg-transparent rounded">Register</Link>
            </>
          ) : (
            <button
              onClick={logoutUser}
              className="block sm:inline-block px-4 py-2 bg-red-500 hover:bg-red-700 text-white rounded transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
