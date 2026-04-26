import React from 'react';
import AboutMeSection from '../components/AboutMeSection';
import ProjectsSection from '../components/ProjectsSection';
import ContactSection from '../components/ContactSection';
import HeroSection from '../components/HeroSection';

const Portfolio = React.memo(() => {
  return (
    <div className="bg-black text-white overflow-hidden">
      <div className="w-full">
        <HeroSection />
        <AboutMeSection />
        <ProjectsSection />
      </div>
    </div>
  );
});

Portfolio.displayName = 'Portfolio';

export default Portfolio;
