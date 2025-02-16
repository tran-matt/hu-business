// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Corrected import

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // For navigation after login

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Supabase login
      const { user, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      console.log('Logged in user:', user);

      // After login, navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during login:', error.message);
      // Optionally, handle error (show error message to user)
    }
  };

  const handleRegisterRedirect = () => {
    // Navigate to the register page when "Register" is clicked
    navigate('/register');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-md mx-auto bg-white p-8 rounded shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        
        {/* Login Form */}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              type="password"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={handleRegisterRedirect}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
