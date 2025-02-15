import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';  // Import BrowserRouter
import Home from './pages/home';  // Import Home page component

function App() {
  return (
    <BrowserRouter>  {/* Wrap the Routes with BrowserRouter */}
      <div>
        <Routes>
          <Route path="/" element={<Home />} />  {/* Define the route for the home page */}
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
