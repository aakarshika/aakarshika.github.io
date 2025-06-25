// Utility functions extracted from Portfolio.jsx

// Calculate animation values for the photo
export function calculateAnimation(elementKey, progress, photoAnimationSequence, viewHeight) {
  const config = photoAnimationSequence[elementKey];
  if (!config || progress === undefined) return {
    opacity: 0,
    scale: config?.initialScale || 1,
    y: 0
  };

  const { start, duration, initialScale, scaleIncrement } = config;
  const minOpacity = elementKey === 'clock' ? 0.3 : 0.7;
  // Fade-in logic
  const cappedProgress = Math.min(progress, 50);
  const elementProgress = cappedProgress >= start ? Math.min((cappedProgress - start) / duration, 1) : 0;
  const easedProgress = minOpacity - Math.pow(1 - elementProgress, 3);

  let opacity = easedProgress;

  const progressThreshold = 30;
  // Fade-out logic for progress > 50
  if (progress > progressThreshold) {
    const fadeOutDuration =  elementKey === 'clock' ? 40 : 30; // 80 - 50
    const fadeOutProgress = Math.min((progress - progressThreshold) / fadeOutDuration, 1);
    opacity = minOpacity - fadeOutProgress;
  }

  const scale = cappedProgress >= start ? initialScale + (easedProgress * scaleIncrement) : initialScale;
  const y = (progress / 100) * (viewHeight - 240); // 240 is h-60

  return { opacity, scale, y };
}


// Check which section is currently visible on screen
export function checkVisibleSection(stoppersConfig) {
  const windowHeight = window.innerHeight;
  const visibleSections = [];

  for (const section of stoppersConfig) {
    if (!section.ref.current) continue;

    const rect = section.ref.current.getBoundingClientRect();

    // Calculate how much of the section is visible
    const visibleTop = Math.max(0, Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0));
    const visibleHeight = Math.max(0, visibleTop);
    const sectionHeight = rect.height;
    const visibilityRatio = visibleHeight / sectionHeight;

    // If more than 0% of the section is visible, include it in the list
    if (visibilityRatio > 0) {
      // Calculate cumulative progress for this section (0-100)
      let cumulativeProgress = 0;

      // Calculate progress based on section's journey through the viewport
      // Start from 0 when section top enters viewport, reach 100 when section bottom leaves viewport
      const sectionTop = rect.top;
      const sectionBottom = rect.bottom;
      const viewportHeight = windowHeight;

      if (sectionTop < viewportHeight && sectionBottom > 0) {
        // Section is in viewport
        if (sectionTop <= 0) {
          // Section top has passed viewport top - calculate progress from 0 to 100
          const totalJourney = viewportHeight + rect.height;
          const distanceTraveled = Math.abs(sectionTop) + rect.height;
          cumulativeProgress = Math.min(100, (distanceTraveled / totalJourney) * 100);
        } else {
          // Section is entering - calculate progress from 0 to 100
          const totalJourney = viewportHeight + rect.height;
          const distanceTraveled = rect.height - sectionTop;
          cumulativeProgress = Math.max(0, (distanceTraveled / totalJourney) * 100);
        }
      }

      // Ensure cumulative progress is between 0 and 100
      cumulativeProgress = Math.max(0, Math.min(100, cumulativeProgress));

      visibleSections.push({
        id: section.id,
        top: rect.top,
        sectionHeight: visibleHeight,
        visibilityPercentage: Math.round(visibilityRatio * 100),
        cumulativeProgress: Math.round(cumulativeProgress)
      });
    }
  }

  // Sort by visibility percentage (highest first)
  return visibleSections.sort((a, b) => b.visibilityPercentage - a.visibilityPercentage);
}

// Helper to check if contact section is fully visible
export function isContactFullyVisible() {
  return false;
  // const contactSection = visibleSections.find(
  //   (section) => section.id === 'contact'
  // );
  // // Allow a small tolerance for floating point errors
  // return contactSection && contactSection.visibilityPercentage >= 99;
} 