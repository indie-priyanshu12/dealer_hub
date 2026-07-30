import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { resolveImageUrl } from '../../config/api';

const EASE = [0.4, 0, 0.2, 1];
// Photos 2 and 3 get their own thumbnails; everything beyond collapses into the +N tile.
const THUMB_COUNT = 2;

const navButtonStyle = {
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  border: '1px solid rgba(255,255,255,0.25)',
  background: 'rgba(255,255,255,0.12)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  flexShrink: 0,
};

const VehicleGallery = ({ vehicle }) => {
  const label = `${vehicle.make} ${vehicle.model}`;

  const galleryImages = useMemo(() => {
    const list = vehicle.images && vehicle.images.length > 0 ? vehicle.images : [vehicle.image];
    return list.filter(Boolean);
  }, [vehicle.images, vehicle.image]);

  const total = galleryImages.length;
  const extraCount = Math.max(0, total - (1 + THUMB_COUNT));

  // null when closed | { index, dir } — dir (-1/0/1) drives the slide-in direction.
  // Deliberately plain conditional rendering (no AnimatePresence): this project has
  // been bitten by exit-then-unmount leaving invisible full-screen overlays behind,
  // and a lightbox that blocks clicks while invisible is the worst case of that.
  const [lightbox, setLightbox] = useState(null);

  const openAt = (index) => setLightbox({ index, dir: 0 });
  const close = () => setLightbox(null);
  const step = (delta) =>
    setLightbox((prev) => prev && { index: (prev.index + delta + total) % total, dir: delta });

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // total is stable for a given vehicle; lightbox presence is the on/off switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [!lightbox]);

  const mainImage = (
    <>
      {galleryImages[0] ? (
        <img
          src={resolveImageUrl(galleryImages[0])}
          alt={label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#a0a0a0', fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: '20px',
        }}>
          {label}
        </div>
      )}
      {vehicle.featured && (
        <div style={{
          position: 'absolute', top: '20px', left: '20px', background: '#1a2744', color: 'white',
          padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 700,
          fontFamily: "'Manrope', sans-serif",
        }}>
          FEATURED
        </div>
      )}
    </>
  );

  const mainFrameStyle = {
    position: 'relative',
    borderRadius: '24px',
    overflow: 'hidden',
    background: '#ececeb',
    aspectRatio: '4 / 3',
    width: '100%',
    padding: 0,
    border: 'none',
    display: 'block',
  };

  return (
    <div>
      {total > 1 ? (
        <button
          type="button"
          aria-label={`Photo 1 of ${total}`}
          onClick={() => openAt(0)}
          style={{ ...mainFrameStyle, cursor: 'zoom-in' }}
        >
          {mainImage}
        </button>
      ) : (
        <div style={mainFrameStyle}>{mainImage}</div>
      )}

      {total > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', marginTop: '12px' }}>
          {galleryImages.slice(1, 1 + THUMB_COUNT).map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Photo ${i + 2} of ${total}`}
              onClick={() => openAt(i + 1)}
              style={{
                position: 'relative', height: '90px', borderRadius: '16px', overflow: 'hidden',
                border: 'none', padding: 0, cursor: 'pointer', background: '#ececeb',
              }}
            >
              <img
                src={resolveImageUrl(src)}
                alt={`${label} photo ${i + 2}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </button>
          ))}

          {extraCount > 0 && (
            <button
              type="button"
              aria-label={`${extraCount} more photos`}
              onClick={() => openAt(1 + THUMB_COUNT)}
              style={{
                position: 'relative', height: '90px', borderRadius: '16px', overflow: 'hidden',
                border: 'none', padding: 0, cursor: 'pointer', background: '#1a2744',
              }}
            >
              <img
                src={resolveImageUrl(galleryImages[1 + THUMB_COUNT])}
                alt=""
                aria-hidden="true"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'blur(2px)', opacity: 0.45 }}
              />
              <span style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '22px',
                letterSpacing: '0.5px',
              }}>
                +{extraCount}
              </span>
            </button>
          )}
        </div>
      )}

      {lightbox && createPortal(
        <motion.div
          role="dialog"
          aria-label="Photo gallery"
          onClick={close}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: EASE }}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(10, 14, 25, 0.85)',
            backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          <div style={{
            position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)',
            color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: 700, letterSpacing: '1px',
          }}>
            {lightbox.index + 1} / {total}
          </div>

          <button
            type="button"
            aria-label="Close gallery"
            onClick={(e) => { e.stopPropagation(); close(); }}
            style={{ ...navButtonStyle, position: 'absolute', top: '20px', right: '24px', width: '44px', height: '44px' }}
          >
            <X size={20} />
          </button>

          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => { e.stopPropagation(); step(-1); }}
            style={navButtonStyle}
          >
            <ChevronLeft size={24} />
          </button>

          {/* The gallery stage — roughly 70% of the screen in both axes */}
          <div style={{ width: '70vw', height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              key={lightbox.index}
              initial={{ x: lightbox.dir * 90, opacity: lightbox.dir === 0 ? 1 : 0.25 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.28, ease: EASE }}
              style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <img
                data-testid="gallery-slide-image"
                onClick={(e) => e.stopPropagation()}
                src={resolveImageUrl(galleryImages[lightbox.index])}
                alt={`${label} photo ${lightbox.index + 1}`}
                style={{
                  maxWidth: '100%', maxHeight: '100%', objectFit: 'contain',
                  borderRadius: '18px', boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
                }}
              />
            </motion.div>
          </div>

          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => { e.stopPropagation(); step(1); }}
            style={navButtonStyle}
          >
            <ChevronRight size={24} />
          </button>
        </motion.div>,
        document.body
      )}
    </div>
  );
};

export default VehicleGallery;
