import React, { useEffect, useRef } from 'react';
import { CAMERA_CONFIG } from '../utils/cameraConfig';

const StarBurst = ({ isActive, onComplete, duration = 4000, color = '#ffd700' }) => {
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

    // Initialize star particles
    const createStars = () => {
      const stars = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 * i) / 20;
        const speed = Math.random() * 2 + 1.5;
        
        stars.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          decay: Math.random() * 0.008 + 0.003,
          color: color,
          size: Math.random() * 6 + 3,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          points: 5 + Math.floor(Math.random() * 3) // 5-7 point stars
        });
      }
      
      return stars;
    };

    particlesRef.current = createStars();
    startTimeRef.current = Date.now();

    const drawStar = (ctx, x, y, size, points) => {
      ctx.beginPath();
      const outerRadius = size;
      const innerRadius = size * 0.4;
      
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.closePath();
    };

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = elapsed / duration;

      if (progress >= 1) {
        onComplete?.();
        return;
      }

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw stars
      particlesRef.current.forEach((star, index) => {
        star.x += star.vx;
        star.y += star.vy;
        star.life -= star.decay;
        star.rotation += star.rotationSpeed;

        if (star.life > 0) {
          ctx.save();
          ctx.globalAlpha = star.life;
          ctx.fillStyle = star.color;
          ctx.translate(star.x, star.y);
          ctx.rotate(star.rotation);
          
          drawStar(ctx, 0, 0, star.size, star.points);
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
  }, [isActive, duration, onComplete, color]);

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

export default StarBurst; 