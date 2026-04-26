import { useState, useRef, useEffect } from 'react';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';
import { 
  isContactFullyVisible 
} from '../utils/portfolioUtils';

export const useScrollManagement = ({stoppersConfig}) => {
  // Custom scroll state
  const [hovered, setHovered] = useState(true);
  const [hoveredSection, setHoveredSection] = useState('projects');
    const sectionCount = stoppersConfig.length;
    const viewHeight = window.innerHeight;
    const maxScrollY = sectionCount * window.innerHeight - window.innerHeight;
  const [scrollY, setScrollY] = useState(0);
  const [storedYY, setStoredYY] = useState(0);
  const [activeStopperId, setActiveStopperId] = useState(null);
  const activeStopperIdRef = useRef(activeStopperId);
  const [activePageName, setActivePageName] = useState(null);
  const [pageProgress, setPageProgress] = useState(0);
  const [handoffsReceived, setHandoffsReceived] = useState([]);
  const [centerStuck, setCenterStuck] = useState(null);
  const [direction, setDirection] = useState(null);
  // Refs so wheel handler always sees latest values (avoids stale closure after handoff)
  const handoffsReceivedRef = useRef(handoffsReceived);
  const centerStuckRef = useRef(centerStuck);
  const hoveredRef = useRef(hovered);
  const hoveredSectionRef = useRef(hoveredSection);
  const centerOfEachPage = [];
    for(let i = 0; i < stoppersConfig.length; i++) {
      const stopper = stoppersConfig[i];
      const top = (i * viewHeight);
      const bottom = ((i + 1) * viewHeight );
      const center = (top + bottom)/2;
      centerOfEachPage.push({
        ...stopper,
        id: stopper.id,
        center: center,
        top: top,
        bottom: bottom
      });
    }

  
  useEffect(() => {
    activeStopperIdRef.current = activeStopperId;
  }, [activeStopperId]);

  useEffect(() => {
    handoffsReceivedRef.current = handoffsReceived;
    centerStuckRef.current = centerStuck;
    hoveredRef.current = hovered;
    hoveredSectionRef.current = hoveredSection;
  }, [handoffsReceived, centerStuck, hovered, hoveredSection]);

  useEffect(() => {
    // // console.log("scrollY", scrollY);

    const matlabKaY = scrollY + viewHeight/2;
    const activePageProgress = 100*((matlabKaY%viewHeight)/viewHeight);
    setPageProgress(activePageProgress);

    const ovrAllPage = centerOfEachPage.find(page => matlabKaY > page.top && matlabKaY < page.bottom);
    const activePage = centerOfEachPage.find(page => matlabKaY > page.top && matlabKaY < page.bottom);
    const neighbors = centerOfEachPage.filter(page => matlabKaY > page.top-100 && matlabKaY < page.bottom+100 && page.id !== activePage?.id);

    var interimName = null;
    if(activePage) {
      setActivePageName(activePage?.id);
      interimName = activePage.id;
    } else {
      setActivePageName(null); 
      interimName = neighbors[0]?.id+'-'+neighbors[1]?.id;
    }
    // Active horizontal zone: middle 60% of section (not just center ±100px) so scroll works regardless of mouse position
    const activeZoneMargin = viewHeight * 0.2;
    if (
      activePage &&
      matlabKaY > activePage.top + activeZoneMargin && matlabKaY < activePage.bottom - activeZoneMargin &&
      ['horizontalStopper', 'customHorizontalStopper'].some(it=> it == activePage.componentType) 
    ) {
      setActiveStopperId(activePage.id);
    } else {
      setActiveStopperId(null);
    }
    if(((direction == 'next' && activePageProgress >= 45 ) || (direction == 'previous' && activePageProgress <= 55 ))
      && !handoffsReceived.find(h => h.direction == direction && h.stopperId == ovrAllPage?.id)
      && ['horizontalStopper', 'customHorizontalStopper'].some(it=> it == ovrAllPage?.componentType) 
      && hovered && hoveredSection == ovrAllPage.id
    ){
      setCenterStuck(ovrAllPage);
    } else {
      setCenterStuck(null);
    }

  }, [scrollY, hovered]);


  const handleHover = (isHovered, section) => {
    setHovered(isHovered);
    setHoveredSection(section);
  };

  const handleScrollHandoff = (direction, stopperId) => {
    const nextHandoffs = [{ direction, stopperId }];
    setHandoffsReceived(nextHandoffs);
    setCenterStuck(null);
    setActiveStopperId(null);
    // Sync refs immediately so next wheel event sees handoff (avoids one-frame stick)
    handoffsReceivedRef.current = nextHandoffs;
    centerStuckRef.current = null;
  };

  // Custom scroll handler
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.height = '100vh';
    
    const MAX_SCROLL_SPEED = 250;    
    const handleScroll = (deltaY) => {
      setDirection(deltaY > 0 ? "next" : "previous");
      if (deltaY > 0 && isContactFullyVisible()) {
        return;
      }
      const cappedDeltaY = Math.max(-MAX_SCROLL_SPEED, Math.min(MAX_SCROLL_SPEED, deltaY));
      setScrollY(prev => {

        const newDirection = deltaY > 0 ? "next" : "previous";
        const nextY = prev + cappedDeltaY;
        const matlabKaY = nextY + viewHeight/2;
        const prevCenter = prev + viewHeight/2;
        const ovrAllPage = centerOfEachPage.find(page => matlabKaY > page.top && matlabKaY < page.bottom);

        const currentHandoffs = handoffsReceivedRef.current;
        const currentCenterStuck = centerStuckRef.current;
        const currentHovered = hoveredRef.current;
        const currentHoveredSection = hoveredSectionRef.current;

        const canStick = (page) => {
          const isHorizontal = ['horizontalStopper', 'customHorizontalStopper'].some(it => it === page.componentType);
          const noRecentHandoff = !currentHandoffs.find(h => h.direction === newDirection && h.stopperId === page?.id);
          const hoveredThisSection = currentHovered && currentHoveredSection === page.id;
          return isHorizontal && noRecentHandoff && hoveredThisSection;
        };

        // Stick when viewport center is inside a horizontal section (no progress threshold)
        const alreadyStuckHere = currentCenterStuck && ovrAllPage && ovrAllPage.id === currentCenterStuck.id;
        if (ovrAllPage && (alreadyStuckHere || canStick(ovrAllPage))) {
          return ovrAllPage.top;
        }

        // Momentum/fast scroll can overshoot in one frame: we end up past the section.
        // If we're crossing a horizontal section this frame, land at its top instead of skipping it.
        if (deltaY > 0) {
          const crossed = centerOfEachPage.find(
            page => ['horizontalStopper', 'customHorizontalStopper'].includes(page.componentType)
              && matlabKaY >= page.bottom
              && prevCenter < page.bottom
              && canStick(page)
          );
          if (crossed) return crossed.top;
        } else if (deltaY < 0) {
          const crossed = centerOfEachPage.find(
            page => ['horizontalStopper', 'customHorizontalStopper'].includes(page.componentType)
              && matlabKaY <= page.top
              && prevCenter > page.top
              && canStick(page)
          );
          if (crossed) return crossed.top;
        }

        return Math.max(0, Math.min(nextY, maxScrollY));
      });
    };

    const handleWheel = (e) => {
      handleScroll(e.deltaY);
    };

    // Touch events for mobile
    let startY = 0;
    
    const handleTouchStart = (e) => {
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      const deltaY = startY - e.touches[0].clientY;
      handleScroll(deltaY);
      startY = e.touches[0].clientY;
    };

    // Use the utility function to set up event listeners
    const cleanup = setupScrollEventListeners(
      null, // Use window as target
      {
        wheel: handleWheel,
        touchStart: handleTouchStart,
        touchMove: handleTouchMove
      },
      {
        useWindow: true
      }
    );

    return () => {
      cleanup();
      // Restore browser scroll
      document.body.style.overflow = '';
      document.body.style.height = '';
    };
  }, [activeStopperId, stoppersConfig, hovered]);

  return {
    scrollY,
    activeStopperId,
    activePageName,
    pageProgress,
    handleScrollHandoff,
    handoffsReceived,
    handleHover
  };
}; 