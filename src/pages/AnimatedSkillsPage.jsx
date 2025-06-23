import React from 'react';
import AnimatedSkillsChart from '../components/AnimatedSkillsChart';

const AnimatedSkillsPage = () => {
  return (
    <div className="min-h-screen">
      <AnimatedSkillsChart 
        isActive={true} 
        onScrollHandoff={(direction) => {
          console.log('AnimatedSkillsPage: Scroll handoff:', direction);
          // For standalone page, we can handle handoff differently or ignore it
        }} 
      />
    </div>
  );
};

export default AnimatedSkillsPage; 