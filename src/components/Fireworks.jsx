import React, { useEffect, useRef, useState } from 'react';

const Fireworks = ({ isActive, onComplete, duration = 10000 }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [particles, setParticles] = useState([]);

  console.log('Fireworks component render:', { isActive, duration });

  useEffect(() => {
    console.log('Fireworks useEffect:', { isActive, duration });
    
    if (!isActive) {
      console.log('Fireworks deactivating');
      setParticles([]);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    console.log('Fireworks activating!');

    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Fireworks: No canvas element found');
      return;
    }

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    console.log('Fireworks canvas setup:', { width, height, canvas: canvas.offsetWidth, canvasHeight: canvas.offsetHeight });

    // Create multiple firework bursts
    const createFirework = (x, y) => {
      const burstParticles = [];
      const particleCount = 50;
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = 3 + Math.random() * 2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        burstParticles.push({
          x: x,
          y: y,
          vx: Math.cos(angle) * velocity,
          vy: Math.sin(angle) * velocity,
          life: 1.0,
          decay: 0.02 + Math.random() * 0.02,
          color: color,
          size: 2 + Math.random() * 3
        });
      }
      return burstParticles;
    };

    // Initialize fireworks
    let currentParticles = [];
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      currentParticles.push(...createFirework(x, y));
    }
    setParticles(currentParticles);

    let startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed > duration) {
        console.log('Fireworks animation complete');
        onComplete?.();
        return;
      }

      // Debug: Log every 2 seconds
      if (Math.floor(elapsed / 2000) !== Math.floor((elapsed - 16) / 2000)) {
        console.log('Fireworks animating:', { elapsed, particles: currentParticles.length });
      }

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Debug: Draw a visible rectangle to confirm canvas is working
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.fillText('Fireworks Active!', 10, 30);

      // Update and draw particles directly
      currentParticles = currentParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // gravity
          life: particle.life - particle.decay
        }))
        .filter(particle => particle.life > 0);

      // Draw particles
      currentParticles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Add new firework bursts randomly
      if (Math.random() < 0.1 && currentParticles.length < 200) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        currentParticles.push(...createFirework(x, y));
      }

      // Update state for debugging
      setParticles([...currentParticles]);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, duration, onComplete]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      width={256}
      height={256}
      className="absolute top-0 left-0 w-full h-full pointer-events-none rounded-lg"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 20,
        mixBlendMode: 'screen',
        border: '2px solid red' // Debug border
      }}
    />
  );
};

export default Fireworks; 