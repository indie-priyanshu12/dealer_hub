import React, { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import CanvasBackground from '../components/Landing/CanvasBackground';
import ScrollOverlay from '../components/Landing/ScrollOverlay';
import Navbar from '../components/Landing/Navbar';

const LandingPage = () => {
  // The 3D scene reads this every frame via useFrame. Mutating a ref (instead of
  // calling setState on every Lenis tick, which can fire 60+ times/sec) keeps it off
  // React's render cycle entirely — re-rendering the whole tree that often was
  // competing with react-three-fiber's own render loop and is what caused the jitter.
  const scrollProgressRef = useRef(0);
  const [showScrollHint, setShowScrollHint] = useState(true);

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
      scrollProgressRef.current = e.scroll / (e.limit || 1);

      // Only touches React state on the rare threshold crossing, not every tick.
      setShowScrollHint((prev) => {
        const next = scrollProgressRef.current <= 0.05;
        return prev === next ? prev : next;
      });
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
    // Height comes from the overlay's own scenes — no hardcoded page height to drift
    // out of sync with the scene count.
    <div style={{ backgroundColor: '#F8F8F6', position: 'relative', overflowX: 'hidden' }}>

      {/* Fixed Navbar — above everything */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <Navbar />
      </div>

      {/* 3D Background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <CanvasBackground scrollProgressRef={scrollProgressRef} />
      </div>

      {/* HTML Story Overlay — must stay interactive: an earlier version set
          pointer-events:none here, which silently made every CTA unclickable. */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ScrollOverlay showScrollHint={showScrollHint} />
      </div>

    </div>
  );
};

export default LandingPage;

