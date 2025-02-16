import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';  // Import BrowserRouter
import Home from './pages/home';  // Import Home page component
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import { UserProvider } from './context/userContext';
function App() {
  return (
    <UserProvider>
    <BrowserRouter>  {/* Wrap the Routes with BrowserRouter */}
      <div>
        <Routes>
          <Route path="/" element={<Home />} />  {/* Define the route for the home page */}
          <Route path="/login" element={<Login />} /> {/* Login page route */}
          <Route path="/register" element={<Register />} /> {/* Register page route */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* Dashboard page route */}
        </Routes>
      </div>
    </BrowserRouter>
    </UserProvider>
  );
}

export default App;
