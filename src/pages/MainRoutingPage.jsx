import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home';
import SkillsTimelinePage from './SkillsTimelinePage';
import AnimatedSkillsPage from './AnimatedSkillsPage';

const MainRoutingPage = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/skills-timeline" element={<SkillsTimelinePage />} />
      <Route path="/animated-skills" element={<AnimatedSkillsPage />} />
      {/* Add more routes as needed */}
    </Routes>
  );
};

export default MainRoutingPage; 