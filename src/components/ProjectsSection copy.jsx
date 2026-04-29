import React, { useEffect, useRef } from "react";
import ContactSection from "./ContactSection";
import {
  ProjectTitle,
  DaywiseProject,
  TwirlyProject,
  PortfolioProject,
} from "./ProjectCards";

const ProjectsSection = () => {
  const containerRef = useRef(null);
  const containerRefV = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    const elV = containerRefV.current;
    if (!el || !elV) return;

    const handleWheel = (e) => {
      e.preventDefault();
      el.scrollLeft += ((e.deltaY)*6);
      elV.scrollTop += ((e.deltaY)/8);
      console.log("handleWheel", e);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", handleWheel);
    };
  }, []);
  
  return (
    <section ref={containerRefV} className="overflow-y">
      <div
      ref={containerRef}
        className="flex w-full h-full overflow-x-auto "
      >
          <ProjectTitle />
          <TwirlyProject />
          <DaywiseProject />
          <PortfolioProject />
        </div>

      <ContactSection />
    </section>
  );
};

export default ProjectsSection; 