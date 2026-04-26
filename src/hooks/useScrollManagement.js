import { useEffect, useMemo, useRef, useState } from 'react';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';

const MAX_SCROLL_SPEED = 250;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const useScrollManagement = ({
  sectionCount = 1,
  horizontalConfig = {}
} = {}) => {
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
  const [scrollMode, setScrollMode] = useState('vertical');
  const [activeHorizontalId, setActiveHorizontalId] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [horizontalXById, setHorizontalXById] = useState(() =>
    Object.fromEntries(
      Object.entries(horizontalConfig).map(([id, bounds]) => [id, bounds.initial ?? 0])
    )
  );
  const [activePageName, setActivePageName] = useState(null);
  const [pageProgress, setPageProgress] = useState(0);

  const modeRef = useRef(scrollMode);
  const activeHorizontalIdRef = useRef(activeHorizontalId);
  const horizontalXRef = useRef(horizontalXById);

  const maxScrollY = useMemo(
    () => Math.max(0, sectionCount * viewportHeight - viewportHeight),
    [sectionCount, viewportHeight]
  );

  useEffect(() => {
    modeRef.current = scrollMode;
  }, [scrollMode]);

  useEffect(() => {
    activeHorizontalIdRef.current = activeHorizontalId;
  }, [activeHorizontalId]);

  useEffect(() => {
    horizontalXRef.current = horizontalXById;
  }, [horizontalXById]);

  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setScrollY((prev) => clamp(prev, 0, maxScrollY));
  }, [maxScrollY]);

  useEffect(() => {
    if (!viewportHeight) return;
    const centerY = scrollY + viewportHeight / 2;
    const activeIndex = clamp(Math.floor(centerY / viewportHeight), 0, Math.max(0, sectionCount - 1));
    const nextPageProgress = ((centerY % viewportHeight) / viewportHeight) * 100;

    setActivePageName(`section-${activeIndex}`);
    setPageProgress(nextPageProgress);
  }, [scrollY, viewportHeight, sectionCount]);

  const enterHorizontal = (id) => {
    if (!id) return;
    setActiveHorizontalId(id);
    setScrollMode('horizontal');
  };

  const exitHorizontal = () => {
    setScrollMode('vertical');
    setActiveHorizontalId(null);
  };

  const toggleHorizontal = (id) => {
    if (modeRef.current === 'horizontal' && activeHorizontalIdRef.current === id) {
      exitHorizontal();
      return;
    }
    enterHorizontal(id);
  };

  const setHorizontalX = (id, nextX) => {
    if (!id) return;
    const bounds = horizontalConfig[id] ?? {};
    const min = bounds.min ?? Number.NEGATIVE_INFINITY;
    const max = bounds.max ?? Number.POSITIVE_INFINITY;

    setHorizontalXById((prev) => ({
      ...prev,
      [id]: clamp(nextX, min, max)
    }));
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';

    const applyDelta = (deltaY) => {
      const cappedDeltaY = clamp(deltaY, -MAX_SCROLL_SPEED, MAX_SCROLL_SPEED);

      if (modeRef.current === 'horizontal' && activeHorizontalIdRef.current) {
        const currentId = activeHorizontalIdRef.current;
        const bounds = horizontalConfig[currentId] ?? {};
        const min = bounds.min ?? Number.NEGATIVE_INFINITY;
        const max = bounds.max ?? Number.POSITIVE_INFINITY;
        const currentX = horizontalXRef.current[currentId] ?? 0;
        const nextX = clamp(currentX - cappedDeltaY, min, max);

        setHorizontalXById((prev) => ({ ...prev, [currentId]: nextX }));
        return;
      }

      setScrollY((prev) => clamp(prev + cappedDeltaY, 0, maxScrollY));
    };

    const handleWheel = (event) => {
      event.preventDefault();
      applyDelta(event.deltaY);
    };

    let touchStartY = 0;
    const handleTouchStart = (event) => {
      touchStartY = event.touches[0].clientY;
    };

    const handleTouchMove = (event) => {
      event.preventDefault();
      const deltaY = touchStartY - event.touches[0].clientY;
      applyDelta(deltaY);
      touchStartY = event.touches[0].clientY;
    };

    const cleanup = setupScrollEventListeners(
      null,
      {
        wheel: handleWheel,
        touchStart: handleTouchStart,
        touchMove: handleTouchMove
      },
      { useWindow: true }
    );

    return () => {
      cleanup();
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [horizontalConfig, maxScrollY]);

  return {
    scrollMode,
    scrollY,
    horizontalXById,
    activeHorizontalId,
    activePageName,
    pageProgress,
    enterHorizontal,
    exitHorizontal,
    toggleHorizontal,
    setHorizontalX
  };
};