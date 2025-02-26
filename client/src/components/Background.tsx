import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Flower {
  id: number;
  x: number;
  delay: number;
  duration: number;
  scale: number;
  rotate: number;
}

export function Background() {
  const [flowers, setFlowers] = useState<Flower[]>([]);

  useEffect(() => {
    const createFlower = () => ({
      id: Math.random(),
      x: Math.random() * window.innerWidth,
      delay: Math.random() * 2,
      duration: 6 + Math.random() * 4,
      scale: 0.3 + Math.random() * 0.7,
      rotate: Math.random() * 360,
    });

    // Initial flowers
    setFlowers(Array.from({ length: 20 }, () => createFlower()));

    // Add new flowers periodically
    const interval = setInterval(() => {
      setFlowers(prev => [...prev.slice(-19), createFlower()]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {flowers.map(flower => (
        <motion.div
          key={flower.id}
          initial={{ 
            y: -20, 
            x: flower.x,
            opacity: 0,
            scale: flower.scale,
            rotate: flower.rotate 
          }}
          animate={{ 
            y: window.innerHeight + 20,
            opacity: [0, 1, 1, 0],
            rotate: flower.rotate + 360
          }}
          transition={{ 
            duration: flower.duration,
            delay: flower.delay,
            ease: "linear",
            repeat: Infinity
          }}
          className="absolute top-0"
        >
          <div className="dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] rounded-full">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary/40 dark:text-primary/60"
            >
              <path
                d="M12 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm4 4a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM6 6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4z"
                fill="currentColor"
              />
            </svg>
          </div>
        </motion.div>
      ))}
    </div>
  );
}