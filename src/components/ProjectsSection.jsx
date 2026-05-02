import React, { useEffect, useRef } from "react";
import { useMotionValue } from "framer-motion";
import {
  ProjectTitle,
  DaywiseProject,
  TwirlyProject,
  ProcureWinProject,
  WriterverseProject,
  OutgoingProject,
  NotAResumeProject,
  PortfolioProject,
} from "./ProjectCards";

const ProjectsSection = () => {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const horizontalProgress = useMotionValue(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const HORIZONTAL_SCROLL_SPEED = 1;
    const ENABLE_HORIZONTAL_SNAP = false;

    if (!section || !track) {
      return undefined;
    }

    let maxHorizontalScroll = 0;
    let currentX = 0;
    let targetX = 0;
    let animationFrameId;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
    const updateProgress = (x) => {
      const normalized = maxHorizontalScroll > 0 ? (x / maxHorizontalScroll) * 100 : 0;
      horizontalProgress.set(clamp(normalized, 0, 100));
    };

    const updateMeasurements = () => {
      maxHorizontalScroll = Math.max(track.scrollWidth - window.innerWidth, 0);
      section.style.height = `${
        window.innerHeight + maxHorizontalScroll / HORIZONTAL_SCROLL_SPEED
      }px`;
    };

    const setTargetHorizontalPosition = () => {
      const rect = section.getBoundingClientRect();
      const scrollRange = section.offsetHeight - window.innerHeight;
      const snapWidth = window.innerWidth;

      if (scrollRange <= 0 || maxHorizontalScroll <= 0) {
        targetX = 0;
        currentX = 0;
        track.style.transform = "translate3d(0px, 0px, 0px)";
        updateProgress(0);
        return;
      }

      const progress = clamp(-rect.top / scrollRange, 0, 1);
      const rawX = progress * maxHorizontalScroll;
      const snappedX = clamp(Math.round(rawX / snapWidth) * snapWidth, 0, maxHorizontalScroll);
      targetX = ENABLE_HORIZONTAL_SNAP ? snappedX : rawX;

      if (!ENABLE_HORIZONTAL_SNAP) {
        currentX = targetX;
        track.style.transform = `translate3d(-${currentX}px, 0px, 0px)`;
        updateProgress(currentX);
      }
    };

    const animateToTarget = () => {
      // Smoothly interpolate toward each snapped section.
      currentX += (targetX - currentX) * 0.10;

      if (Math.abs(targetX - currentX) < 0.9) {
        currentX = targetX;
      }

      track.style.transform = `translate3d(-${currentX}px, 0px, 0px)`;
      updateProgress(currentX);
      animationFrameId = window.requestAnimationFrame(animateToTarget);
    };

    const onScroll = () => {
      setTargetHorizontalPosition();
    };

    const onResize = () => {
      updateMeasurements();
      setTargetHorizontalPosition();
    };

    updateMeasurements();
    setTargetHorizontalPosition();
    if (ENABLE_HORIZONTAL_SNAP) {
      animateToTarget();
    }

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(track);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      if (ENABLE_HORIZONTAL_SNAP) {
        window.cancelAnimationFrame(animationFrameId);
      }
      resizeObserver.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-black">
      <div className="sticky top-0 left-0 h-screen overflow-hidden">
        <div ref={trackRef} className="flex h-full w-max will-change-transform">
          <ProjectTitle />
          <TwirlyProject progressMotionValue={horizontalProgress} />
          <ProcureWinProject progressMotionValue={horizontalProgress} />
          <DaywiseProject progressMotionValue={horizontalProgress} />
          <WriterverseProject progressMotionValue={horizontalProgress} />
          <OutgoingProject progressMotionValue={horizontalProgress} />
          <NotAResumeProject progressMotionValue={horizontalProgress} />
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;