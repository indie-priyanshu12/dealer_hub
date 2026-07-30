import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, ArrowRight } from 'lucide-react';
import Navbar from '../components/Landing/Navbar';
import VehicleCard from '../components/Inventory/VehicleCard';
import MagneticButton from '../components/MagneticButton';

const VISIBLE_COUNT = 3;
const BLURRED_COUNT = 3;

// The static seed JSON predates the DB transform, so stock is still a label —
// map it to a number so VehicleCard's "X In Stock" / "Out of Stock" badge works.
const STOCK_LABEL_TO_COUNT = {
  'In Stock': 5,
  'Limited Stock': 2,
  'Sold Out': 0,
};

const normalizeVehicle = (raw) => ({
  ...raw,
  vehicleId: raw.id,
  _id: raw.id, // synthetic — not a real Mongo id, so card clicks are intercepted below
  stock: STOCK_LABEL_TO_COUNT[raw.stock] ?? 0,
});

// Everything on these cards (the card itself, Compare, Purchase) points at a
// synthetic id that doesn't exist in the database, so any click here should mean
// "go sign in" rather than attempt a real (and broken) action.
const GatedCard = ({ vehicle, onGate }) => (
  <div onClickCapture={(e) => { e.stopPropagation(); onGate(); }} style={{ cursor: 'pointer' }}>
    <VehicleCard vehicle={vehicle} viewMode="grid" />
  </div>
);

const InventoryTeaser = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/inventory_data/car_data.json')
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setVehicles(data.map(normalizeVehicle));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const goToSignIn = () => navigate('/auth');

  const visible = vehicles.slice(0, VISIBLE_COUNT);
  const blurredRow = vehicles.slice(VISIBLE_COUNT, VISIBLE_COUNT + BLURRED_COUNT);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F8F6', paddingBottom: '100px' }}>
      <Navbar />

      <main style={{ paddingTop: '96px', maxWidth: '1400px', margin: '0 auto', paddingLeft: '48px', paddingRight: '48px' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '48px',
            fontWeight: 800,
            color: '#1a2744',
            letterSpacing: '-1px',
            margin: '0 0 8px 0',
          }}>
            Inventory
          </h1>
          <p style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '18px',
            color: '#666',
            margin: 0,
          }}>
            A glimpse of our current collection — sign in to explore the full showroom.
          </p>
        </div>

        {!loading && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px', marginBottom: '24px' }}>
              {visible.map((vehicle) => (
                <GatedCard key={vehicle.vehicleId} vehicle={vehicle} onGate={goToSignIn} />
              ))}
            </div>

            <div style={{ position: 'relative' }}>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '24px',
                filter: 'blur(10px)', opacity: 0.55, pointerEvents: 'none', userSelect: 'none',
              }} aria-hidden="true">
                {blurredRow.map((vehicle) => (
                  <VehicleCard key={vehicle.vehicleId} vehicle={vehicle} viewMode="grid" />
                ))}
              </div>

              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(248,248,246,0) 0%, #F8F8F6 80%)',
              }} />

              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
                  style={{
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.6)',
                    borderRadius: '24px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                    padding: '40px 48px',
                    textAlign: 'center',
                    maxWidth: '440px',
                  }}
                >
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 20px',
                    background: 'rgba(37,99,235,0.1)', color: '#2563EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Lock size={24} />
                  </div>
                  <h2 style={{
                    fontFamily: "'Manrope', sans-serif", fontSize: '24px', fontWeight: 800,
                    color: '#1a2744', margin: '0 0 10px', letterSpacing: '-0.5px',
                  }}>
                    Please sign in to take a tour of our garage
                  </h2>
                  <p style={{
                    fontFamily: "'Manrope', sans-serif", fontSize: '15px', color: '#64748B',
                    lineHeight: 1.6, margin: '0 0 28px',
                  }}>
                    Unlock the full collection, compare favorites, and start your next purchase.
                  </p>
                  <MagneticButton
                    onClick={goToSignIn}
                    style={{
                      height: '52px', padding: '0 32px', border: 'none', borderRadius: '999px',
                      background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', color: '#fff',
                      fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '15px',
                      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px',
                      boxShadow: '0 12px 32px rgba(37,99,235,0.25)',
                    }}
                  >
                    Sign In <ArrowRight size={18} />
                  </MagneticButton>
                </motion.div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default InventoryTeaser;
