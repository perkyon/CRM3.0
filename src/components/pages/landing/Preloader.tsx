import { motion, AnimatePresence } from 'motion/react';
import { useEffect, useState } from 'react';

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState<'loading' | 'complete' | 'exit'>('loading');

  useEffect(() => {
    // Плавная загрузка за 5 секунд (5000ms)
    const duration = 5000; // 5 секунд
    const fps = 60; // 60 кадров в секунду
    const totalFrames = (duration / 1000) * fps;
    const incrementPerFrame = 100 / totalFrames;
    
    const interval = setInterval(() => {
      setCount((prev) => {
        const next = prev + incrementPerFrame;
        if (next >= 100) {
          clearInterval(interval);
          setStage('complete');
          setTimeout(() => {
            setStage('exit');
            setTimeout(onComplete, 800);
          }, 300);
          return 100;
        }
        return next;
      });
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {stage !== 'exit' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
          }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
        >
          {/* Sky-like Base Gradient - soft and airy */}
          <div 
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse at 50% 30%, #f0f9ff 0%, #e0f2fe 25%, #bae6fd 50%, #93c5fd 75%, #7dd3fc 100%)
              `,
            }}
          />
          
          {/* Soft Cloud-like Blobs */}
          <motion.div
            animate={{
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 800px 600px at 20% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
                radial-gradient(ellipse 900px 700px at 80% 70%, rgba(255, 255, 255, 0.6) 0%, transparent 55%),
                radial-gradient(ellipse 600px 500px at 60% 40%, rgba(255, 255, 255, 0.7) 0%, transparent 50%)
              `,
              filter: 'blur(60px)',
            }}
          />

          <motion.div
            animate={{
              opacity: [0.4, 0.6, 0.4],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(ellipse 700px 550px at 40% 60%, rgba(255, 255, 255, 0.7) 0%, transparent 52%),
                radial-gradient(ellipse 650px 600px at 90% 30%, rgba(186, 230, 253, 0.4) 0%, transparent 50%),
                radial-gradient(ellipse 800px 650px at 10% 80%, rgba(224, 242, 254, 0.5) 0%, transparent 55%)
              `,
              filter: 'blur(70px)',
            }}
          />

          {/* Fine Grain Texture for depth */}
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '200px 200px',
              mixBlendMode: 'soft-light',
            }}
          />

          {/* Content */}
          <div className="relative z-10 text-center">
            {/* Smaller Rotating Circle */}
            <div className="relative w-14 h-14 mx-auto mb-8">
              <motion.div
                animate={{ 
                  rotate: 360,
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-0 border-[3px] border-black/80 border-t-transparent rounded-full"
              />
            </div>

            {/* Smaller Counter Display */}
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-baseline justify-center gap-1.5"
            >
              <div
                className="text-4xl md:text-5xl text-black/90 tabular-nums"
                style={{ fontFamily: 'Unbounded, sans-serif', fontWeight: 500 }}
              >
                {Math.floor(count)}
              </div>
              <div 
                className="text-2xl md:text-3xl text-black/60"
                style={{ fontFamily: 'Unbounded, sans-serif', fontWeight: 400 }}
              >
                %
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

