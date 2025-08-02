import React, { useEffect, useRef } from 'react';
import { CAMERA_CONFIG } from '../utils/cameraConfig';

const Confetti = ({ isActive, onComplete, duration = 4000, colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'] }) => {
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

    // Initialize confetti particles
    const createConfetti = () => {
      const confetti = [];
      
      for (let i = 0; i < 100; i++) {
        confetti.push({
          x: Math.random() * canvas.width,
          y: -10 - Math.random() * 100, // Start above canvas
          vx: (Math.random() - 0.5) * 3,
          vy: Math.random() * 2 + 1,
          life: 1.0,
          decay: Math.random() * 0.005 + 0.002,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 8 + 4,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
          shape: Math.floor(Math.random() * 3) // 0: square, 1: circle, 2: triangle
        });
      }
      
      return confetti;
    };

    particlesRef.current = createConfetti();
    startTimeRef.current = Date.now();

    const drawShape = (ctx, x, y, size, rotation, shape) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      switch (shape) {
        case 0: // Square
          ctx.fillRect(-size/2, -size/2, size, size);
          break;
        case 1: // Circle
          ctx.beginPath();
          ctx.arc(0, 0, size/2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 2: // Triangle
          ctx.beginPath();
          ctx.moveTo(0, -size/2);
          ctx.lineTo(-size/2, size/2);
          ctx.lineTo(size/2, size/2);
          ctx.closePath();
          ctx.fill();
          break;
      }
      
      ctx.restore();
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

      // Update and draw confetti
      particlesRef.current.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // gravity
        particle.life -= particle.decay;
        particle.rotation += particle.rotationSpeed;

        if (particle.life > 0 && particle.y < canvas.height + 50) {
          ctx.save();
          ctx.globalAlpha = particle.life;
          ctx.fillStyle = particle.color;
          
          drawShape(ctx, particle.x, particle.y, particle.size, particle.rotation, particle.shape);
          
          ctx.restore();
        } else {
          particlesRef.current.splice(index, 1);
        }
      });

      // Add new confetti if needed
      if (particlesRef.current.length < 50 && Math.random() < 0.3) {
        const newConfetti = createConfetti().slice(0, 10);
        particlesRef.current.push(...newConfetti);
      }

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

export default Confetti; 