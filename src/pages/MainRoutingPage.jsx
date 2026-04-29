import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Portfolio from './Portfolio';
import ResumePage from './ResumePage';

const MainRoutingPage = () => {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/resume" element={<ResumePage />} />
    </Routes>
  );
};

export default MainRoutingPage; 