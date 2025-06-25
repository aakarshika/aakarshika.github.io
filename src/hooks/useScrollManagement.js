import { useState, useRef, useEffect } from 'react';
import { setupScrollEventListeners } from '../utils/scrollEventUtils';
import { 
  isContactFullyVisible 
} from '../utils/portfolioUtils';

export const useScrollManagement = (stoppersConfig) => {
  // Custom scroll state
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
        bottom: bottom,
        stopAtY: stopper.componentType === 'horizontalStopper' ? top-100 : null
      });
    }

  const [scrollParallelly, setScrollParallelly] = useState(false);
  
  useEffect(() => {
    activeStopperIdRef.current = activeStopperId;
  }, [activeStopperId]);

  useEffect(() => {
    console.log("scrollY", scrollY);

    const matlabKaY = scrollY + viewHeight/2;
    const activePageProgress = 100*((matlabKaY%viewHeight)/viewHeight);
    setPageProgress(activePageProgress);

    const ovrAllPage = centerOfEachPage.find(page => matlabKaY > page.top && matlabKaY < page.bottom);
    const activePage = centerOfEachPage.find(page => matlabKaY > page.top+100 && matlabKaY < page.bottom-100);
    const neighbors = centerOfEachPage.filter(page => matlabKaY > page.top-100 && matlabKaY < page.bottom+100 && page.id !== activePage?.id);

    var interimName = null;
    if(activePage) {
      setActivePageName(activePage?.id);
      interimName = activePage.id;
    } else {
      setActivePageName(null); 
      interimName = neighbors[0]?.id+'-'+neighbors[1]?.id;
    }
    if (
      activePage &&
      activePage.componentType === 'horizontalStopper' 
    ) {
      setActiveStopperId(activePage.id);
    } else {
      setActiveStopperId(null);
    }
    if(direction == 'next' && activePageProgress >= 45 
      && !handoffsReceived.find(h => h.direction == 'next')
      && ovrAllPage?.componentType === 'horizontalStopper' ){
      setCenterStuck(ovrAllPage);
    }
    else if(direction == 'previous' && activePageProgress <= 55 
      && !handoffsReceived.find(h => h.direction == 'previous')
      && ovrAllPage?.componentType === 'horizontalStopper' ){
      setCenterStuck(ovrAllPage);
    } else {
      setCenterStuck(null);
    }

    if(!activePage) {
      console.log("--------------------------------");
    } else {
      console.log(pageProgress.toFixed(), `\"${activePage?.id}\"`,
    centerStuck ? "centerStuck": ""  ,
    direction,
    handoffsReceived.length,
    handoffsReceived.find(h => h.direction == direction) ? "found": ""
    );
    }
  }, [scrollY]);


  const handleScrollHandoff = (direction, stopperId) => {
    console.log("handleScrollHandoff recieved", direction, stopperId);
    setHandoffsReceived([{ direction, stopperId }]);
    setCenterStuck(null);
    setActiveStopperId(null);
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
        const ovrAllPage = centerOfEachPage.find(page => matlabKaY > page.top && matlabKaY < page.bottom);

        if(ovrAllPage){
          const activePageProgress = 100*((matlabKaY%viewHeight)/viewHeight);
          
          let shouldCenterStuck = false;
          if(newDirection == 'next' && activePageProgress >= 50 
            && !handoffsReceived.find(h => h.direction == 'next')
            && ovrAllPage.componentType === 'horizontalStopper' ){
            shouldCenterStuck = true;
          }
          else if(newDirection == 'previous' && activePageProgress <= 40 
            && !handoffsReceived.find(h => h.direction == 'previous')
            && ovrAllPage.componentType === 'horizontalStopper' ){
            shouldCenterStuck = true;
          }
          
          if(shouldCenterStuck || centerStuck){
            return ovrAllPage.top;
          }
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
  }, [activeStopperId, scrollParallelly, stoppersConfig]);

  return {
    scrollY,
    activeStopperId,
    activePageName,
    pageProgress,
    handleScrollHandoff,
    handoffsReceived,
  };
}; 