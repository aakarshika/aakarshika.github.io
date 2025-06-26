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
      effect.amount = 0.07;
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

const TandLPictureSection = ({ progress, pictures, onCapture, currentFingerprint, onDelete }) => {
    const [cameraOpen, setCameraOpen] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isCountingDown, setIsCountingDown] = useState(false);
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [filter, setFilter] = useState('sepia');
    const [message, setMessage] = useState('');
    const seriouslyInstance = useRef(null);
    const videoSource = useRef(null);
    const targetNode = useRef(null);
    const ownImage = currentFingerprint && pictures.some(pic => pic?.fingerprint === currentFingerprint);

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

    // Start countdown and capture after 3 seconds
    const startCountdown = useCallback(() => {
        setIsCountingDown(true);
        setCountdown(3);
        
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsCountingDown(false);
                    setCountdown(0);
                    // Auto-capture after countdown
                    if (canvasRef.current) {
                        requestAnimationFrame(() => {
                            const imageSrc = canvasRef.current.toDataURL('image/jpeg');
                            if (onCapture) onCapture(imageSrc, filter, message);
                            setTimeout(() => {
                                setCameraOpen(false);
                                setMessage(''); // Reset message after capture
                            }, 120);
                        });
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [filter, message, onCapture]);

    // Capture from canvas (filtered) and call onCapture
    const handleCapture = useCallback(() => {
        if (isCountingDown) return; // Prevent multiple captures during countdown
        startCountdown();
    }, [isCountingDown, startCountdown]);

    return (
        <div className="tstart relative h-full w-full items-center justify-center mb-60">
        <div className="absolute top-0 left-0 w-full h-full p-12 pt-60">
        <AllPicturesTwinkling 
          pictures={pictures} 
          progress={progress} 
          currentFingerprint={currentFingerprint}
          onDelete={onDelete}
        />
        </div>
            {cameraOpen && !ownImage && (
                <div className="p-12 pt-60 h-full flex flex-col items-center justify-center gap-4 relative z-10">
                    <div className="mb-4 flex gap-2">
                        <label className="text-white">Filter:</label>
                        <select
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            className="rounded px-2 py-1 bg-gray-700 text-white"
                            disabled={isCountingDown}
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
                    
                    {/* Countdown overlay */}
                    {isCountingDown && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                            <div className="bg-black bg-opacity-50 rounded-full w-32 h-32 flex items-center justify-center">
                                <span className="text-6xl font-bold text-white">{countdown}</span>
                            </div>
                        </div>
                    )}
                    
                    <div className="flex flex-col gap-2 w-64">
                        <label className="text-white text-sm">Message (optional):</label>
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, 100))}
                            placeholder="Add a message..."
                            maxLength={100}
                            className="rounded px-3 py-2 bg-gray-700 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isCountingDown}
                        />
                        <div className="text-xs text-white text-right">
                            {message.length}/100
                        </div>
                    </div>
                    <button
                        className={`mt-4 px-4 py-2 rounded transition cursor-pointer ${
                            isCountingDown 
                                ? 'bg-gray-500 cursor-not-allowed' 
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                        onClick={handleCapture}
                        disabled={isCountingDown}
                    >
                        {isCountingDown ? 'Capturing...' : 'Capture'}
                    </button>
                    <button
                        className="mt-2 px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition cursor-pointer"
                        onClick={() => {
                            setCameraOpen(false);
                            setMessage(''); // Reset message when canceling
                            setIsCountingDown(false);
                            setCountdown(0);
                        }}
                        disabled={isCountingDown}
                    >
                        Cancel
                    </button>
                </div>
            )}
            {!cameraOpen && !ownImage && (
                <div className="p-12 pt-60 h-full flex items-center justify-center gap-4  z-2" onClick={() => setCameraOpen(true)}>
                  <div className=' items-center justify-center bg-gradient-to-b from-black to-gray-900 rounded-lg p-20 gap-4 z-10'>
                    <Camera className="w-10 h-10" />
                </div>
                </div>
            )}
        </div>
    );
};

export default TandLPictureSection; 