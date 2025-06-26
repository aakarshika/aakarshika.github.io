import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Portfolio from './Portfolio';

const MainRoutingPage = () => {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default MainRoutingPage; 