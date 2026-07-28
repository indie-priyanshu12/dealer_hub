import React from 'react';
import { motion } from 'framer-motion';

const ViewToggle = ({ viewMode, setViewMode }) => {
  return (
    <div style={{
      display: 'flex',
      background: 'rgba(255, 255, 255, 0.4)',
      backdropFilter: 'blur(10px)',
      padding: '4px',
      borderRadius: '12px',
      border: '1px solid rgba(0,0,0,0.05)'
    }}>
      <button
        onClick={() => setViewMode('list')}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          padding: '8px 16px',
          cursor: 'pointer',
          color: viewMode === 'list' ? '#1a2744' : '#666',
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1
        }}
      >
        {viewMode === 'list' && (
          <motion.div
            layoutId="active-pill"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              zIndex: -1
            }}
          />
        )}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6"></line>
          <line x1="8" y1="12" x2="21" y2="12"></line>
          <line x1="8" y1="18" x2="21" y2="18"></line>
          <line x1="3" y1="6" x2="3.01" y2="6"></line>
          <line x1="3" y1="12" x2="3.01" y2="12"></line>
          <line x1="3" y1="18" x2="3.01" y2="18"></line>
        </svg>
        List
      </button>

      <button
        onClick={() => setViewMode('grid')}
        style={{
          position: 'relative',
          background: 'transparent',
          border: 'none',
          padding: '8px 16px',
          cursor: 'pointer',
          color: viewMode === 'grid' ? '#1a2744' : '#666',
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 600,
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 1
        }}
      >
        {viewMode === 'grid' && (
          <motion.div
            layoutId="active-pill"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              zIndex: -1
            }}
          />
        )}
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        Grid
      </button>
    </div>
  );
};

export default ViewToggle;
