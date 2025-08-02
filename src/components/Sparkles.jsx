import React, { useEffect, useRef } from 'react';
import { CAMERA_CONFIG } from '../utils/cameraConfig';

const Sparkles = ({ isActive, onComplete, duration = 3000, color = '#ffd700' }) => {
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
      
      for (let i = 0; i < 40; i++) {
        sparkles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          life: 1.0,
          decay: Math.random() * 0.01 + 0.005,
          color: color,
          size: Math.random() * 3 + 1,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.3,
          twinkle: Math.random() * Math.PI * 2
        });
      }
      
      return sparkles;
    };

    particlesRef.current = createSparkles();
    startTimeRef.current = Date.now();

    const drawSparkle = (ctx, x, y, size, rotation, twinkle) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      
      // Create twinkling effect
      const twinkleAlpha = 0.5 + 0.5 * Math.sin(twinkle);
      ctx.globalAlpha *= twinkleAlpha;
      
      // Draw cross shape
      ctx.strokeStyle = ctx.fillStyle;
      ctx.lineWidth = 2;
      
      // Vertical line
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.stroke();
      
      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(size, 0);
      ctx.stroke();
      
      // Diagonal lines
      ctx.beginPath();
      ctx.moveTo(-size * 0.7, -size * 0.7);
      ctx.lineTo(size * 0.7, size * 0.7);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(-size * 0.7, size * 0.7);
      ctx.lineTo(size * 0.7, -size * 0.7);
      ctx.stroke();
      
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

      // Update and draw sparkles
      particlesRef.current.forEach((sparkle, index) => {
        sparkle.x += sparkle.vx;
        sparkle.y += sparkle.vy;
        sparkle.life -= sparkle.decay;
        sparkle.rotation += sparkle.rotationSpeed;
        sparkle.twinkle += 0.1;

        // Bounce off edges
        if (sparkle.x <= 0 || sparkle.x >= canvas.width) sparkle.vx *= -1;
        if (sparkle.y <= 0 || sparkle.y >= canvas.height) sparkle.vy *= -1;

        if (sparkle.life > 0) {
          ctx.save();
          ctx.globalAlpha = sparkle.life;
          ctx.fillStyle = sparkle.color;
          
          drawSparkle(ctx, sparkle.x, sparkle.y, sparkle.size, sparkle.rotation, sparkle.twinkle);
          
          ctx.restore();
        } else {
          particlesRef.current.splice(index, 1);
        }
      });

      // Add new sparkles if needed
      if (particlesRef.current.length < 20) {
        const newSparkles = createSparkles().slice(0, 5);
        particlesRef.current.push(...newSparkles);
      }

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

export default Sparkles; 