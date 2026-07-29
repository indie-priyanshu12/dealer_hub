import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MAX_PULL = 4; // px — animation-guidelines.md: "Buttons: Slight magnetic attraction. Maximum movement 4px."
const PULL_SPRING = { stiffness: 150, damping: 15, mass: 0.5 };

// Shared hover-pull used on primary CTAs across the site (Navbar, Auth submit button).
// Uses motion values instead of React state so the mousemove tracking never triggers
// a re-render — the same render-cycle-contention issue that caused jitter elsewhere
// in this app when fast-changing values were pushed through props/state.
const MagneticButton = ({ children, style, disabled, ...props }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, PULL_SPRING);
  const springY = useSpring(y, PULL_SPRING);

  const handleMouseMove = (e) => {
    if (!ref.current || disabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = ref.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(relX * MAX_PULL * 2);
    y.set(relY * MAX_PULL * 2);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      disabled={disabled}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      style={{ x: springX, y: springY, ...style }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default MagneticButton;
