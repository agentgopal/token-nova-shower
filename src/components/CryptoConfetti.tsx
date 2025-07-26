import { useEffect, useRef, useState } from 'react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  phase: 'floating' | 'exploded' | 'scattered';
  opacity: number;
  scale: number;
  life: number;
  maxLife: number;
}

export const CryptoConfetti = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number>();
  const particleIdRef = useRef(0);
  const bitcoinImageRef = useRef<HTMLImageElement>();

  const createParticle = (x?: number): Particle => {
    const startX = x ?? Math.random() * window.innerWidth;
    
    return {
      id: particleIdRef.current++,
      x: startX,
      y: window.innerHeight + 50,
      vx: (Math.random() - 0.5) * 2,
      vy: -2 - Math.random() * 3,
      size: 40 + Math.random() * 20,
      rotation: 0,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
      phase: 'floating',
      opacity: 1,
      scale: 1,
      life: 0,
      maxLife: 60 + Math.random() * 60,
    };
  };

  const explodeParticle = (particle: Particle): Particle[] => {
    const fragments: Particle[] = [];
    const fragmentCount = 15 + Math.random() * 20;
    
    for (let i = 0; i < fragmentCount; i++) {
      const angle = (Math.PI * 2 * i) / fragmentCount + (Math.random() - 0.5) * 0.5;
      const speed = 5 + Math.random() * 15;
      
      fragments.push({
        id: particleIdRef.current++,
        x: particle.x,
        y: particle.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: particle.size * (0.3 + Math.random() * 0.4),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.4,
        
        phase: 'exploded',
        opacity: 1,
        scale: 1,
        life: 0,
        maxLife: 180 + Math.random() * 120,
      });
    }
    
    return fragments;
  };

  const updateParticle = (particle: Particle): Particle | null => {
    const updated = { ...particle };
    updated.life++;

    if (updated.phase === 'floating') {
      updated.x += updated.vx;
      updated.y += updated.vy;
      updated.rotation += updated.rotationSpeed;
      
      // Check if particle should explode
      const explodeHeight = window.innerHeight * (0.2 + Math.random() * 0.4);
      if (updated.y <= explodeHeight) {
        updated.phase = 'exploded';
        return updated;
      }
    } else if (updated.phase === 'exploded' || updated.phase === 'scattered') {
      // Apply physics
      updated.x += updated.vx;
      updated.y += updated.vy;
      updated.vy += 0.3; // gravity
      updated.vx *= 0.995; // air resistance
      updated.rotation += updated.rotationSpeed;
      
      // Fade out over time
      const lifeProgress = updated.life / updated.maxLife;
      updated.opacity = Math.max(0, 1 - lifeProgress);
      updated.scale = Math.max(0.1, 1 - lifeProgress * 0.7);
      
      // Remove if too old or off screen
      if (updated.life >= updated.maxLife || 
          updated.y > window.innerHeight + 100 ||
          updated.x < -100 || updated.x > window.innerWidth + 100) {
        return null;
      }
    }

    return updated;
  };

  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    if (!bitcoinImageRef.current) return;
    
    ctx.save();
    ctx.globalAlpha = particle.opacity;
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.scale(particle.scale, particle.scale);
    
    // Add glow effect
    if (particle.phase === 'floating') {
      ctx.shadowColor = '#F7931A';
      ctx.shadowBlur = 15;
    }
    
    // Draw Bitcoin SVG
    const size = particle.size;
    ctx.drawImage(bitcoinImageRef.current, -size/2, -size/2, size, size);
    
    ctx.restore();
  };

  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with slight trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all particles
    particles.forEach(particle => {
      drawParticle(ctx, particle);
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  // Separate effect for particle updates
  useEffect(() => {
    const updateLoop = () => {
      setParticles(prevParticles => {
        let newParticles: Particle[] = [];
        const toExplode: Particle[] = [];

        // Update existing particles
        prevParticles.forEach(particle => {
          const updated = updateParticle(particle);
          if (updated) {
            if (updated.phase === 'exploded' && particle.phase === 'floating') {
              // This particle just exploded
              toExplode.push(updated);
            } else {
              newParticles.push(updated);
            }
          }
        });

        // Create explosion fragments
        toExplode.forEach(particle => {
          const fragments = explodeParticle(particle);
          newParticles.push(...fragments);
        });

        // Remove automatic spawning - only spawn on click/hover

        return newParticles;
      });
    };

    const updateInterval = setInterval(updateLoop, 16); // ~60fps
    return () => clearInterval(updateInterval);
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const clickX = event.clientX - rect.left;
    
    // Create multiple particles at click position
    const newParticles: Particle[] = [];
    for (let i = 0; i < 3; i++) {
      newParticles.push(createParticle(clickX + (Math.random() - 0.5) * 100));
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    // Create particles on hover with some probability to avoid too many
    if (Math.random() < 0.05) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const x = event.clientX - rect.left;
      setParticles(prev => [...prev, createParticle(x)]);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Load Bitcoin SVG
    const img = new Image();
    img.onload = () => {
      bitcoinImageRef.current = img;
    };
    img.src = '/src/assets/bitcoin.svg';

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start animation loop
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [particles]);

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      className="fixed inset-0 pointer-events-auto cursor-pointer"
      style={{ zIndex: 10 }}
    />
  );
};