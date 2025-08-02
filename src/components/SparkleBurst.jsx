import React, { useEffect, useRef } from 'react';
import { CAMERA_CONFIG } from '../utils/cameraConfig';

const SparkleBurst = ({ isActive, onComplete, duration = 3500, colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4'] }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      particlesRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize sparkle particles
    const createSparkles = () => {
      const sparkles = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < 30; i++) {
        const angle = (Math.PI * 2 * i) / 30;
        const speed = Math.random() * 3 + 2;
        
        sparkles.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          decay: Math.random() * 0.015 + 0.005,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 4 + 2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2
        });
      }
      
      return sparkles;
    };

    particlesRef.current = createSparkles();
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = elapsed / duration;

      if (progress >= 1) {
        onComplete?.();
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw sparkles
      particlesRef.current.forEach((sparkle, index) => {
        sparkle.x += sparkle.vx;
        sparkle.y += sparkle.vy;
        sparkle.life -= sparkle.decay;
        sparkle.rotation += sparkle.rotationSpeed;

        if (sparkle.life > 0) {
          ctx.save();
          ctx.globalAlpha = sparkle.life;
          ctx.fillStyle = sparkle.color;
          ctx.translate(sparkle.x, sparkle.y);
          ctx.rotate(sparkle.rotation);
          
          // Draw star shape
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * Math.PI * 2) / 5;
            const x = Math.cos(angle) * sparkle.size;
            const y = Math.sin(angle) * sparkle.size;
            
            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.closePath();
          ctx.fill();
          
          ctx.restore();
        } else {
          particlesRef.current.splice(index, 1);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, duration, onComplete, colors]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      width={CAMERA_CONFIG.VIDEO_WIDTH}
      height={CAMERA_CONFIG.VIDEO_HEIGHT}
      className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 20,
        mixBlendMode: 'screen'
      }}
    />
  );
};

export default SparkleBurst; 