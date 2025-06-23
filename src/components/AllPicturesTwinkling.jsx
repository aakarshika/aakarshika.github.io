import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const IMG_SIZE = 58; // px
const GRID_COLS = 10;
const TWINKLE_COUNT = 30; // Number of nodes to twinkle at once
const TWINKLE_OUT_DURATION = 0.35; // seconds
const TWINKLE_IN_DURATION = 0.5; // seconds
const TWINKLE_IDLE_DELAY = 100; // ms between cycles

const getPictureKey = (pic, idx) => {
  if (typeof pic === 'string') return pic;
  if (pic && pic.src) return pic.src;
  return String(idx);
};

function getRandomUniqueIndices(length, count) {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, Math.min(count, length));
}

function getRandomOffset() {
  // Random offset between -20 and 20 px for x and y
  return {
    x: (Math.random() - 0.5) * 40,
    y: (Math.random() - 0.5) * 40,
  };
}

const AllPicturesTwinkling = ({ pictures, progress = 0, size = { width: 210, height: 190 } }) => {
  const [picOrder, setPicOrder] = useState(() => pictures.map((_, i) => i));
  const [twinkleIdxs, setTwinkleIdxs] = useState([]); // array of indices
  const [twinklePhase, setTwinklePhase] = useState('idle'); // 'idle' | 'out' | 'swap' | 'in'
  const [outCompleteCount, setOutCompleteCount] = useState(0);
  const [twinkleOffsets, setTwinkleOffsets] = useState({}); // { idx: {x, y} }

  useEffect(() => {
    setPicOrder(pictures.map((_, i) => i));
    setTwinkleIdxs([]);
    setTwinklePhase('idle');
    setTwinkleOffsets({});
  }, [pictures]);

  // Twinkle loop
  useEffect(() => {
    if (!pictures.length) return;
    if (twinklePhase === 'idle') {
      const timeout = setTimeout(() => {
        const idxs = getRandomUniqueIndices(pictures.length, TWINKLE_COUNT);
        // Generate random offsets for each twinkling node
        const offsets = {};
        idxs.forEach(idx => {
          offsets[idx] = getRandomOffset();
        });
        setTwinkleOffsets(offsets);
        setTwinkleIdxs(idxs);
        setTwinklePhase('out');
      }, TWINKLE_IDLE_DELAY);
      return () => clearTimeout(timeout);
    }
    if (twinklePhase === 'swap') {
      setTwinklePhase('in');
    }
    if (twinklePhase === 'in') {
      const timeout = setTimeout(() => {
        setTwinkleIdxs([]);
        setTwinklePhase('idle');
        setTwinkleOffsets({});
      }, TWINKLE_IDLE_DELAY);
      return () => clearTimeout(timeout);
    }
  }, [twinklePhase, pictures.length]);

  useEffect(() => {
    if (twinklePhase === 'out' && outCompleteCount === twinkleIdxs.length && twinkleIdxs.length > 0) {
      setPicOrder((prev) => {
        const newOrder = [...prev];
        twinkleIdxs.forEach((idx) => {
          let swapIdx = idx;
          while (swapIdx === idx && newOrder.length > 1) {
            swapIdx = Math.floor(Math.random() * newOrder.length);
          }
          [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
        });
        return newOrder;
      });
      setTwinklePhase('swap');
      setOutCompleteCount(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [outCompleteCount, twinklePhase]);

  if (!pictures || pictures.length === 0) {
    return <div className="text-gray-400 text-sm">No pictures yet.</div>;
  }

  return (
    <div className="relative w-full h-full">
      <div className="grid grid-cols-10 gap-4 w-full min-w-[724px]">
        {picOrder.map((picIdx, idx) => {
          const pic = pictures[picIdx];
          const isTwinkle = twinkleIdxs.includes(idx);
          const offset = twinkleOffsets[idx] || { x: 0, y: 0 };
          let animate, transition, initial;
          if (isTwinkle) {
            if (twinklePhase === 'out') {
              animate = { opacity: pic?.src === 'blank' ? 0 : 0, scale: 0.7, x: offset.x, y: offset.y };
              transition = { duration: TWINKLE_OUT_DURATION, ease: 'easeInOut' };
              initial = { opacity: pic?.src === 'blank' ? 0 : 1, scale: 1, x: 0, y: 0 };
            } else if (twinklePhase === 'in') {
              animate = { opacity: pic?.src === 'blank' ? 0 : 1, scale: 1, x: 0, y: 0 };
              transition = { duration: TWINKLE_IN_DURATION, ease: 'easeInOut' };
              initial = { opacity: pic?.src === 'blank' ? 0 : 0, scale: 0.7, x: offset.x, y: offset.y }; // start from invisible, small, and offset
            } else {
              animate = { opacity: pic?.src === 'blank' ? 0 : 1, scale: 1, x: 0, y: 0 };
              transition = { duration: 0.2 };
              initial = { opacity: pic?.src === 'blank' ? 0 : 1, scale: 1, x: 0, y: 0 };
            }
          } else {
            animate = { opacity: pic?.src === 'blank' ? 0 : 1, scale: 1, x: 0, y: 0 };
            transition = { duration: 0.2 };
            initial = { opacity: pic?.src === 'blank' ? 0 : 1, scale: 1, x: 0, y: 0 };
          }
          return (
            <motion.img
              key={idx + '-' + (pic?.src || pic)}
              src={pic?.src}
              alt={`Captured ${idx + 1}`}
              className="rounded-lg shadow-lg border border-gray-700 pointer-events-none"
              style={{ width: IMG_SIZE, height: IMG_SIZE, zIndex: 2, filter: pic?.src === 'blank' ? 'none' : 'drop-shadow(0 0 8px #fff8)' }}
              loading="lazy"
              initial={initial}
              animate={animate}
              transition={transition}
              onAnimationComplete={() => {
                if (isTwinkle && twinklePhase === 'out') {
                  setOutCompleteCount((c) => c + 1);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AllPicturesTwinkling; 