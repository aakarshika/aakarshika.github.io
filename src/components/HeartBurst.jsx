import React, { useEffect, useRef } from 'react';
import { CAMERA_CONFIG } from '../utils/cameraConfig';

const HeartBurst = ({ isActive, onComplete, duration = 5000, color = '#ff69b4' }) => {
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

    // Initialize heart particles
    const createHearts = () => {
      const hearts = [];
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      for (let i = 0; i < 25; i++) {
        const angle = (Math.PI * 2 * i) / 25;
        const speed = Math.random() * 2 + 1;
        
        hearts.push({
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          decay: Math.random() * 0.01 + 0.005,
          color: color,
          size: Math.random() * 8 + 4,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1
        });
      }
      
      return hearts;
    };

    particlesRef.current = createHearts();
    startTimeRef.current = Date.now();

    const drawHeart = (ctx, x, y, size) => {
      ctx.beginPath();
      ctx.moveTo(x, y + size * 0.3);
      
      // Left curve
      ctx.bezierCurveTo(
        x - size * 0.5, y - size * 0.3,
        x - size * 0.5, y - size * 0.8,
        x, y - size * 0.8
      );
      
      // Right curve
      ctx.bezierCurveTo(
        x + size * 0.5, y - size * 0.8,
        x + size * 0.5, y - size * 0.3,
        x, y + size * 0.3
      );
      
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

      // Update and draw hearts
      particlesRef.current.forEach((heart, index) => {
        heart.x += heart.vx;
        heart.y += heart.vy;
        heart.life -= heart.decay;
        heart.rotation += heart.rotationSpeed;

        if (heart.life > 0) {
          ctx.save();
          ctx.globalAlpha = heart.life;
          ctx.fillStyle = heart.color;
          ctx.translate(heart.x, heart.y);
          ctx.rotate(heart.rotation);
          
          drawHeart(ctx, 0, 0, heart.size);
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

export default HeartBurst; 