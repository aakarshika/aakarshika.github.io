import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Portfolio from './Portfolio';
import AnimatedSkillsPage from './AnimatedSkillsPage';

const MainRoutingPage = () => {
  return (
    <Routes>
      <Route path="/animated-skills" element={<AnimatedSkillsPage />} />
      <Route path="/" element={<Portfolio />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default MainRoutingPage; 