import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/home';
import Login from './pages/login';
import Register from './pages/register';
import Dashboard from './pages/dashboard';
import Admin from './pages/admin';
import { UserProvider, useUser } from './context/userContext';
import Navbar from "./components/navbar";  // ✅ Ensure correct case
import Footer from "./components/footer";  // ✅ Fixed import

// ✅ Private Route: Ensures the user is logged in
const PrivateRoute = ({ children }) => {
  const { user } = useUser();
  if (user === undefined) return null; // Prevents flickering before user state loads
  return user ? children : <Navigate to="/login" />;
};

// ✅ Admin Route: Ensures the user is an admin
const AdminRoute = ({ children }) => {
  const { user } = useUser();
  if (user === undefined) return null;
  return user?.isAdmin ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Navbar /> {/* ✅ Navbar appears on all pages */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ✅ Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } 
          />
          
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
        </Routes>
        <Footer /> {/* ✅ Use Footer component correctly */}
      </BrowserRouter>
    </UserProvider>
  );
}

export default App;
