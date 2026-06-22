'use client';

import { SparklesCore } from './ui/sparkles';

export default function SparklesBackground() {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: -2, background: 'radial-gradient(circle at 50% 0%, #151e33 0%, #090d16 60%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', zIndex: -1, pointerEvents: 'none' }}>
        <SparklesCore
          id="tsparticlesbackground"
          background="transparent"
          minSize={0.6}
          maxSize={1.2}
          particleDensity={60}
          className="w-full h-full"
          particleColor="#6366f1"
          speed={0.5}
        />
      </div>
    </>
  );
}
