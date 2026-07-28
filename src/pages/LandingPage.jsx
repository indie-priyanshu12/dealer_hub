import React, { useEffect, useState } from 'react';
import Lenis from 'lenis';
import CanvasBackground from '../components/Landing/CanvasBackground';
import ScrollOverlay from '../components/Landing/ScrollOverlay';
import Navbar from '../components/Landing/Navbar';

const LandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', (e) => {
      const progress = e.scroll / (e.limit || 1);
      setScrollProgress(progress);
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div style={{ backgroundColor: '#F8F8F6', minHeight: '700vh', position: 'relative', overflowX: 'hidden' }}>

      {/* Fixed Navbar — above everything */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <Navbar />
      </div>

      {/* 3D Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <CanvasBackground scrollProgress={scrollProgress} />
      </div>

      {/* HTML Story Overlay */}
      <div style={{ position: 'relative', zIndex: 1, pointerEvents: 'none' }}>
        <ScrollOverlay scrollProgress={scrollProgress} />
      </div>

    </div>
  );
};

export default LandingPage;

