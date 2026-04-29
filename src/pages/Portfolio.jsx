import React from 'react';
import AboutMeSection from '../components/AboutMeSection';
import ProjectsSection from '../components/ProjectsSection';
import HeroSection from '../components/HeroSection';
import ContactSection from '../components/ContactSection';

const Portfolio = React.memo(() => {
  return (
    <div className="bg-black text-white">
      <div className="w-full">
        <HeroSection />
        <AboutMeSection />
        <ProjectsSection />
        <ContactSection />
      </div>
    </div>
  );
});

Portfolio.displayName = 'Portfolio';

export default Portfolio;
