import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Check } from 'lucide-react';

const SORT_OPTIONS = [
  { value: '', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'year_desc', label: 'Year: Newest' },
  { value: 'year_asc', label: 'Year: Oldest' },
];

const fieldStyle = {
  width: '100%',
  height: '46px',
  padding: '0 14px',
  borderRadius: '12px',
  border: '1px solid rgba(0,0,0,0.08)',
  background: '#fff',
  color: '#1a2744',
  fontFamily: "'Manrope', sans-serif",
  fontSize: '14px',
  fontWeight: 500,
  outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: '6px',
};

const applyButtonStyle = {
  width: '100%',
  height: '46px',
  marginTop: '16px',
  border: 'none',
  borderRadius: '999px',
  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
  color: '#fff',
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 700,
  fontSize: '14px',
  cursor: 'pointer',
};

const panelStyle = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  zIndex: 30,
  background: 'rgba(255,255,255,0.94)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.7)',
  borderRadius: '20px',
  boxShadow: '0 20px 50px rgba(0,0,0,0.14)',
};

const panelTransition = { duration: 0.18, ease: [0.4, 0, 0.2, 1] };

// Always mounted; visibility is purely animate-driven (opacity/y/scale + pointer-events)
// rather than conditional-mount + AnimatePresence. AnimatePresence's exit-then-unmount
// was getting stuck after the exit animation completed (opacity correctly reached 0,
// but the element never actually left the DOM) — this sidesteps that mechanism entirely
// instead of chasing the root cause inside framer-motion's internals.
function panelAnimateProps(open) {
  return {
    animate: {
      opacity: open ? 1 : 0,
      y: open ? 0 : -8,
      scale: open ? 1 : 0.98,
    },
    transition: panelTransition,
  };
}

function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onOutside]);
}

const TriggerButton = ({ label, count, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '8px',
      height: '48px', padding: '0 18px',
      borderRadius: '14px',
      border: `1px solid ${active ? '#2563EB' : 'rgba(0,0,0,0.08)'}`,
      background: active ? 'rgba(37,99,235,0.06)' : 'rgba(255,255,255,0.85)',
      color: active ? '#2563EB' : '#1a2744',
      fontFamily: "'Manrope', sans-serif",
      fontWeight: 700,
      fontSize: '14px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
    }}
  >
    {label}
    {count > 0 && (
      <span style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: '20px', height: '20px', padding: '0 6px',
        borderRadius: '999px', background: '#2563EB', color: '#fff',
        fontSize: '12px', fontWeight: 700,
      }}>
        {count}
      </span>
    )}
  </button>
);

// Search stays live (auto-searches as you type, debounced by the parent).
// Filters and sort are staged in local drafts and only take effect once their
// own "Apply" button is pressed, per the requested interaction.
const SearchFilterBar = ({
  searchValue,
  onSearchChange,
  committedFilters,
  onApplyFilters,
  committedSort,
  onApplySort,
  onReset,
  hasActiveFilters,
  categoryOptions,
  fuelTypeOptions,
}) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(committedFilters);
  const [draftSort, setDraftSort] = useState(committedSort);

  const filterRef = useRef(null);
  const sortRef = useRef(null);
  useClickOutside(filterRef, () => setFilterOpen(false));
  useClickOutside(sortRef, () => setSortOpen(false));

  const openFilters = () => {
    setDraftFilters(committedFilters); // discard any un-applied edits from last time it was open
    setSortOpen(false);
    setFilterOpen((o) => !o);
  };
  const openSort = () => {
    setDraftSort(committedSort);
    setFilterOpen(false);
    setSortOpen((o) => !o);
  };

  const handleApplyFilters = () => {
    onApplyFilters(draftFilters);
    setFilterOpen(false);
  };
  const handleApplySort = () => {
    onApplySort(draftSort);
    setSortOpen(false);
  };

  const activeFilterCount = ['category', 'fuelType', 'minPrice', 'maxPrice'].filter((k) => committedFilters[k]).length;
  const activeSortLabel = SORT_OPTIONS.find((o) => o.value === committedSort)?.label;
  const sortIsActive = Boolean(committedSort);

  return (
    // position:relative so that on mobile (where the trigger wrappers turn static)
    // the popovers anchor to this whole row instead of a mid-row trigger.
    <div className="dh-sfb-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', position: 'relative' }}>
      <div className="dh-sfb-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
        <div style={{
          flex: '1 1 260px',
          display: 'flex', alignItems: 'center', gap: '10px',
          height: '48px', padding: '0 16px',
          borderRadius: '14px',
          border: '1px solid rgba(0,0,0,0.08)',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}>
          <Search size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by make or model..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none', background: 'transparent',
              fontFamily: "'Manrope', sans-serif", fontSize: '14px', fontWeight: 500, color: '#1a2744',
            }}
          />
        </div>

        <div ref={filterRef} className="dh-sfb-anchor" style={{ position: 'relative' }}>
          <TriggerButton label="Filters" count={activeFilterCount} active={filterOpen || activeFilterCount > 0} onClick={openFilters} />
          <motion.div
            {...panelAnimateProps(filterOpen)}
            className="dh-sfb-panel"
            style={{ ...panelStyle, width: '320px', padding: '20px', pointerEvents: filterOpen ? 'auto' : 'none' }}
          >
            <div className="dh-sfb-panel-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Category</label>
                <select
                  value={draftFilters.category}
                  onChange={(e) => setDraftFilters((d) => ({ ...d, category: e.target.value }))}
                  style={{ ...fieldStyle, cursor: 'pointer' }}
                >
                  <option value="">All</option>
                  {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Fuel Type</label>
                <select
                  value={draftFilters.fuelType}
                  onChange={(e) => setDraftFilters((d) => ({ ...d, fuelType: e.target.value }))}
                  style={{ ...fieldStyle, cursor: 'pointer' }}
                >
                  <option value="">All</option>
                  {fuelTypeOptions.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Min Price</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="₹0"
                  value={draftFilters.minPrice}
                  onChange={(e) => setDraftFilters((d) => ({ ...d, minPrice: e.target.value }))}
                  style={fieldStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Max Price</label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="Any"
                  value={draftFilters.maxPrice}
                  onChange={(e) => setDraftFilters((d) => ({ ...d, maxPrice: e.target.value }))}
                  style={fieldStyle}
                />
              </div>
            </div>

            <button onClick={handleApplyFilters} style={applyButtonStyle}>
              Apply Filters
            </button>
          </motion.div>
        </div>

        <div ref={sortRef} className="dh-sfb-anchor" style={{ position: 'relative' }}>
          <TriggerButton
            label={sortIsActive ? activeSortLabel : 'Sort'}
            count={0}
            active={sortOpen || sortIsActive}
            onClick={openSort}
          />
          <motion.div
            {...panelAnimateProps(sortOpen)}
            className="dh-sfb-panel"
            style={{ ...panelStyle, width: '240px', padding: '12px', pointerEvents: sortOpen ? 'auto' : 'none' }}
          >
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDraftSort(opt.value)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '10px', border: 'none',
                  background: draftSort === opt.value ? 'rgba(37,99,235,0.08)' : 'transparent',
                  color: draftSort === opt.value ? '#2563EB' : '#1a2744',
                  fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                {opt.label}
                {draftSort === opt.value && <Check size={16} />}
              </button>
            ))}
            <button onClick={handleApplySort} style={{ ...applyButtonStyle, marginTop: '10px' }}>
              Apply Sort
            </button>
          </motion.div>
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={onReset}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            height: '48px', padding: '0 16px', flexShrink: 0,
            borderRadius: '14px', border: 'none',
            background: 'rgba(239,68,68,0.1)', color: '#EF4444',
            fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <X size={16} /> Reset
        </button>
      )}

      <style>{`
        @media (max-width: 768px) {
          /* Search + trigger buttons can't share one phone-width row — wrap instead
             of shoving the triggers (and their popovers) past the viewport edge. */
          .dh-sfb-row { flex-wrap: wrap; }
          /* Un-position the trigger wrappers so the popovers anchor to the whole
             row (the nearest positioned ancestor) and span the content width,
             instead of hanging off a mid-row trigger and past the viewport. */
          .dh-sfb-anchor { position: static !important; }
          .dh-sfb-panel { width: min(320px, calc(100vw - 48px)) !important; left: 0 !important; right: auto !important; }
          .dh-sfb-panel-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default SearchFilterBar;
