import React, { useEffect, useRef, useState } from 'react';

const TRACK_MARGIN = 8; // px gap from top/bottom of viewport
const THUMB_MIN_HEIGHT = 32;
const IDLE_HIDE_DELAY = 1200;
const MOBILE_BREAKPOINT = 768;

// Global, route-agnostic custom scrollbar. Tracks the real window scroll position
// directly (not Lenis) so it works identically whether or not the current page runs
// Lenis smooth-scroll — Lenis animates the native scrollTop under the hood, so a plain
// `scroll` listener already sees its smoothed position.
const CustomScrollbar = () => {
  const trackRef = useRef(null);
  const thumbRef = useRef(null);
  const draggingRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const hideTimeoutRef = useRef(null);

  const [metrics, setMetrics] = useState({ height: 0, top: 0, hasScroll: false });
  const [visible, setVisible] = useState(true);
  const [hovering, setHovering] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= MOBILE_BREAKPOINT);

  useEffect(() => {
    const updateMetrics = () => {
      setIsDesktop(window.innerWidth >= MOBILE_BREAKPOINT);

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const viewportHeight = window.innerHeight;
      const trackHeight = viewportHeight - TRACK_MARGIN * 2;
      const maxScroll = scrollHeight - viewportHeight;

      if (maxScroll <= 1) {
        setMetrics({ height: 0, top: 0, hasScroll: false });
        return;
      }

      const rawHeight = (viewportHeight / scrollHeight) * trackHeight;
      const height = Math.max(THUMB_MIN_HEIGHT, rawHeight);
      const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
      const top = progress * (trackHeight - height);

      setMetrics({ height, top, hasScroll: true });
    };

    const scheduleHide = () => {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => {
        if (!draggingRef.current) setVisible(false);
      }, IDLE_HIDE_DELAY);
    };

    const onScroll = () => {
      updateMetrics();
      setVisible(true);
      scheduleHide();
    };

    updateMetrics();
    scheduleHide();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateMetrics);

    // Catches content-height changes that aren't a window resize or scroll: route
    // changes (this component lives above <Routes>, so it never unmounts) and async
    // content loading (e.g. the inventory list arriving after its initial empty render).
    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateMetrics);
      resizeObserver.disconnect();
      clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const scrollToProgress = (progress, smooth) => {
    const scrollHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const maxScroll = scrollHeight - viewportHeight;
    window.scrollTo({ top: progress * maxScroll, behavior: smooth ? 'smooth' : 'auto' });
  };

  const handleThumbPointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    draggingRef.current = true;
    setDragging(true);
    setVisible(true);
    clearTimeout(hideTimeoutRef.current);

    dragOffsetRef.current = e.clientY - thumbRef.current.getBoundingClientRect().top;

    const handlePointerMove = (moveEvent) => {
      if (!trackRef.current || !thumbRef.current) return;
      const trackRect = trackRef.current.getBoundingClientRect();
      const thumbHeight = thumbRef.current.offsetHeight;
      const rawTop = moveEvent.clientY - trackRect.top - dragOffsetRef.current;
      const clampedTop = Math.min(Math.max(rawTop, 0), trackRect.height - thumbHeight);
      const progress = clampedTop / (trackRect.height - thumbHeight || 1);
      scrollToProgress(progress, false);
    };

    const handlePointerUp = () => {
      draggingRef.current = false;
      setDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      hideTimeoutRef.current = setTimeout(() => setVisible(false), IDLE_HIDE_DELAY);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  const handleTrackClick = (e) => {
    if (e.target !== trackRef.current || !trackRef.current || !thumbRef.current) return;
    const trackRect = trackRef.current.getBoundingClientRect();
    const thumbHeight = thumbRef.current.offsetHeight;
    const clickTop = e.clientY - trackRect.top - thumbHeight / 2;
    const clampedTop = Math.min(Math.max(clickTop, 0), trackRect.height - thumbHeight);
    const progress = clampedTop / (trackRect.height - thumbHeight || 1);
    scrollToProgress(progress, true);
  };

  if (!isDesktop || !metrics.hasScroll) return null;

  const expanded = hovering || dragging;

  return (
    <div
      ref={trackRef}
      onClick={handleTrackClick}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{
        position: 'fixed',
        top: TRACK_MARGIN,
        bottom: TRACK_MARGIN,
        right: 6,
        width: expanded ? 10 : 6,
        borderRadius: 999,
        background: 'rgba(0,0,0,0.04)',
        zIndex: 300,
        opacity: visible || expanded ? 1 : 0,
        transition: 'opacity 0.25s ease, width 0.15s ease',
        cursor: 'pointer',
      }}
    >
      <div
        ref={thumbRef}
        onPointerDown={handleThumbPointerDown}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: metrics.height,
          transform: `translateY(${metrics.top}px)`,
          borderRadius: 999,
          background: expanded
            ? 'linear-gradient(180deg, #3B82F6, #2563EB)'
            : 'rgba(37, 99, 235, 0.5)',
          boxShadow: expanded ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
          cursor: dragging ? 'grabbing' : 'grab',
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
        }}
      />
    </div>
  );
};

export default CustomScrollbar;
