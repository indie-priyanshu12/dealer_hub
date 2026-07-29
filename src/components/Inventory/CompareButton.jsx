import React from 'react';
import { useCompare, MAX_COMPARE } from '../../context/CompareContext';

const CompareButton = ({ vehicleId }) => {
  const { compareIds, isInCompare, toggleCompare } = useCompare();
  const selected = isInCompare(vehicleId);
  const disabled = !selected && compareIds.length >= MAX_COMPARE;

  const handleClick = (event) => {
    event.stopPropagation();
    toggleCompare(vehicleId);
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      aria-pressed={selected}
      style={{
        fontFamily: "'Manrope', sans-serif",
        fontWeight: 700,
        fontSize: '13px',
        color: selected ? '#fff' : disabled ? '#9ca3af' : '#1a2744',
        background: selected ? '#1a2744' : 'transparent',
        border: `1px solid ${selected ? '#1a2744' : disabled ? 'rgba(0,0,0,.12)' : 'rgba(26, 39, 68, 0.25)'}`,
        borderRadius: '999px',
        padding: '8px 18px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
      }}
    >
      {selected ? '✓ ' : ''}Compare ({compareIds.length}/{MAX_COMPARE})
    </button>
  );
};

export default CompareButton;
