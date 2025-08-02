import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Portfolio from './Portfolio';
import TestScreen from './TestScreen';

const MainRoutingPage = () => {
  return (
    <Routes>
      <Route path="/" element={<TestScreen />} />
      <Route path="/portfolio" element={<Portfolio />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default MainRoutingPage; 