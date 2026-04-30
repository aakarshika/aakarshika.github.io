import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Portfolio from './Portfolio';
import ResumePage from './ResumePage';
import CustomResumePage from './CustomResumePage';

const MainRoutingPage = () => {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/resume" element={<ResumePage />} />
      <Route path="/custom-resume" element={<CustomResumePage />} />
    </Routes>
  );
};

export default MainRoutingPage; 