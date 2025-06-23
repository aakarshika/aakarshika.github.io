import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';
// Placeholder for AllPicturesTwinkling (to be implemented)
import AllPicturesTwinkling from './AllPicturesTwinkling';
// import ImageFilters from 'react-image-filters'; // Not needed for live preview


const FILTERS = {
  none: { label: 'None', setup: (seriously, src, target) => { target.source = src; } },
  blur: {
    label: 'Blur',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('blur');
      effect.amount = 0.7;
      effect.source = src;
      target.source = effect;
    }
  },
  sepia: {
    label: 'Sepia',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('sepia');
      effect.source = src;
      target.source = effect;
    }
  },
  tvglitch: {
    label: 'TV Glitch',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('tvglitch');
      effect.source = src;
      target.source = effect;
    }
  },
  edge: {
    label: 'Edge Detect',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('edge');
      effect.source = src;
      target.source = effect;
    }
  },
  vignette: {
    label: 'Vignette',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('vignette');
      effect.amount = 1.0;
      effect.source = src;
      target.source = effect;
    }
  },
  filmgrain: {
    label: 'Film Grain',
    setup: (seriously, src, target) => {
      const effect = seriously.effect('filmgrain');
      effect.amount = 0.7;
      effect.source = src;
      target.source = effect;
    }
  },
};

function getPictureKey(pic, idx) {
  if (typeof pic === 'string') return pic;
  if (pic && pic.src) return pic.src;
  return String(idx);
}

// Utility: Convert dataURL to Blob
function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
  return new Blob([u8arr], { type: mime });
}

const TandLPictureSection = ({ progress, pictures, onCapture }) => {
    const [cameraOpen, setCameraOpen] = useState(false);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [filter, setFilter] = useState('sepia');
    const seriouslyInstance = useRef(null);
    const videoSource = useRef(null);
    const targetNode = useRef(null);

    // Setup Seriously.js pipeline for live preview
    useEffect(() => {
        if (!cameraOpen) return;
        if (!window.Seriously) return;
        if (!webcamRef.current || !canvasRef.current) return;
        if (!webcamRef.current.video) return;

        // Clean up previous instance
        if (seriouslyInstance.current) {
            seriouslyInstance.current.destroy();
            seriouslyInstance.current = null;
        }

        const seriously = new window.Seriously();
        seriouslyInstance.current = seriously;
        const video = webcamRef.current.video;
        const src = seriously.source(video);
        const target = seriously.target(canvasRef.current);
        videoSource.current = src;
        targetNode.current = target;

        // Setup selected filter
        FILTERS[filter].setup(seriously, src, target);
        seriously.go();

        return () => {
            seriously.destroy();
            seriouslyInstance.current = null;
        };
    }, [cameraOpen, filter]);

    // Capture from canvas (filtered) and call onCapture
    const handleCapture = useCallback(() => {
        if (canvasRef.current) {
            requestAnimationFrame(() => {
                const imageSrc = canvasRef.current.toDataURL('image/jpeg');
                if (onCapture) onCapture(imageSrc, filter);
                setTimeout(() => setCameraOpen(false), 120);
            });
        }
    }, [filter, onCapture]);

    return (
        <div className="tstart relative h-full w-full items-center justify-center">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none p-12">
        <AllPicturesTwinkling pictures={pictures} progress={progress} />
        </div>
            {cameraOpen ? (
                <div className="p-12 h-96 flex flex-col items-center justify-center gap-4 relative z-10">
                    <div className="mb-4 flex gap-2">
                        <label className="text-white">Filter:</label>
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="rounded px-2 py-1 bg-gray-700 text-white"
                        >
                            {Object.entries(FILTERS).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                    </div>
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        className="rounded-lg w-64 h-64 object-cover absolute opacity-0 pointer-events-none"
                        style={{ zIndex: 0 }}
                        videoConstraints={{ width: 256, height: 256 }}
                    />
                    <canvas
                        ref={canvasRef}
                        width={256}
                        height={256}
                        className="rounded-lg w-64 h-64 object-cover"
                        style={{ zIndex: 1 }}
                    />
                    <button
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition cursor-pointer"
                        onClick={handleCapture}
                    >
                        Capture
                    </button>
                    <button
                        className="mt-2 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition cursor-pointer"
                        onClick={() => setCameraOpen(false)}
                    >
                        Cancel
                    </button>
                </div>
            ) : (
                <div className="p-12 h-96 flex items-center justify-center gap-4 z-10" onClick={() => setCameraOpen(true)}>
                  <div className='flex flex-col items-center justify-center bg-gradient-to-b from-black to-gray-900 rounded-lg p-12 gap-4 z-10'>
                    <Camera className="w-10 h-10" />
                </div>
                </div>
            )}
        </div>
    );
};

export default TandLPictureSection; 