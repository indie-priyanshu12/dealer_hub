import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scale, Star, Users, BadgeCheck, ArrowRight } from 'lucide-react';
import Navbar from '../components/Landing/Navbar';
import MagneticButton from '../components/MagneticButton';

const EASE = [0.4, 0, 0.2, 1];

// The logged-out showcase compares exactly this pair from the public demo JSON —
// two petrol icons with a meaningful price/mileage gap, which makes the "compare
// before you buy" story obvious at a glance. Falls back to the first two demo cars
// if the ids ever change.
const SHOWCASE_IDS = ['CAR001', 'CAR005'];

const formatPrice = (vehicle) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: vehicle.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(vehicle.price);

// A deliberate subset of the real compare table — enough to sell the feature,
// not the full logged-in experience.
const SPEC_ROWS = [
  { label: 'Price', render: formatPrice },
  { label: 'Year', render: (v) => v.year || '—' },
  { label: 'Category', render: (v) => v.category || '—' },
  { label: 'Fuel Type', render: (v) => v.fuelType || '—' },
  { label: 'Mileage', render: (v) => (v.mileage ? `${v.mileage.toLocaleString('en-IN')} km` : 'New') },
];

const SATISFACTION_STATS = [
  { icon: BadgeCheck, value: '94%', label: 'of buyers say comparing first made them more confident' },
  { icon: Star, value: '4.9/5', label: 'average satisfaction from 2,300+ reviews' },
  { icon: Users, value: '12,000+', label: 'drivers found their right car with Dealer Hub' },
];

const cellStyle = {
  padding: '16px',
  borderBottom: '1px solid rgba(0,0,0,.06)',
  fontFamily: "'Manrope', sans-serif",
  fontSize: '14px',
  color: '#1a2744',
  verticalAlign: 'top',
};
const labelCellStyle = {
  ...cellStyle,
  fontWeight: 700,
  color: '#64748B',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  whiteSpace: 'nowrap',
};

const CompareTeaser = () => {
  const navigate = useNavigate();
  const [pair, setPair] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/inventory_data/car_data.json')
      .then((res) => res.json())
      .then((cars) => {
        if (cancelled) return;
        const picked = SHOWCASE_IDS.map((id) => cars.find((c) => c.id === id)).filter(Boolean);
        setPair(picked.length === 2 ? picked : cars.slice(0, 2));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const goToSignIn = () => navigate('/auth');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F8F6' }}>
      <Navbar />

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '140px 48px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          style={{ textAlign: 'center', marginBottom: '40px' }}
        >
          <h1 style={{
            fontFamily: "'Manrope', sans-serif", fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800,
            color: '#1a2744', letterSpacing: '-1.5px', lineHeight: 1.1, margin: '0 0 8px', marginTop: '-26px',
          }}>
            Compare wisely before you buy.
          </h1>
          <p style={{
            fontFamily: "'Manrope', sans-serif", fontSize: '17px', color: '#64748B',
            lineHeight: 1.6, maxWidth: '560px', margin: '0 auto',
          }}>
            A car is one of the biggest purchases you'll make. Here's a taste of how Dealer Hub
            puts any two contenders head-to-head — specs, price, and history in one honest table.
          </p>
        </motion.div>

        {pair.length === 2 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
            style={{
              background: 'rgba(255,255,255,0.75)',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.6)', borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.07)', overflow: 'hidden',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '160px repeat(2, minmax(0, 1fr))' }}>
              <div />
              {pair.map((vehicle) => (
                <div key={vehicle.id} style={{ padding: '20px 16px 0' }}>
                  <div style={{ borderRadius: '16px', overflow: 'hidden', background: '#ececeb', aspectRatio: '16 / 10' }}>
                    <img
                      src={vehicle.image}
                      alt={`${vehicle.make} ${vehicle.model}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </div>
                  <div style={{
                    fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '17px',
                    color: '#1a2744', padding: '12px 4px 4px',
                  }}>
                    {vehicle.make} {vehicle.model}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {SPEC_ROWS.map(({ label, render }) => (
                    <tr key={label}>
                      <td style={{ ...labelCellStyle, width: '160px' }}>{label}</td>
                      {pair.map((vehicle) => (
                        <td key={vehicle.id} style={cellStyle}>{render(vehicle)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Customer-satisfaction band */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px',
            margin: '40px 0',
          }}
        >
          {SATISFACTION_STATS.map(({ icon: Icon, value, label }) => (
            <div key={value} style={{
              background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(255,255,255,0.6)',
              borderRadius: '20px', padding: '22px', textAlign: 'center',
              boxShadow: '0 12px 32px rgba(0,0,0,0.05)', fontFamily: "'Manrope', sans-serif",
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#2563EB', marginBottom: '6px' }}>
                <Icon size={18} />
                <span style={{ fontSize: '26px', fontWeight: 800, color: '#1a2744', letterSpacing: '-0.5px' }}>{value}</span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748B', lineHeight: 1.5 }}>{label}</div>
            </div>
          ))}
        </motion.div>

        <div style={{ textAlign: 'center' }}>
          <MagneticButton
            onClick={goToSignIn}
            whileHover={{ scale: 1.03, boxShadow: '0 24px 48px rgba(26,39,68,0.3)' }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '17px 38px', background: 'linear-gradient(135deg, #1a2744 0%, #2d4a8f 100%)',
              color: '#fff', border: 'none', borderRadius: '999px',
              fontSize: '16px', fontWeight: 700, fontFamily: "'Manrope', sans-serif", cursor: 'pointer',
              boxShadow: '0 20px 40px rgba(26,39,68,0.22)',
            }}
          >
            Sign In to Compare the Full Garage <ArrowRight size={19} />
          </MagneticButton>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: 600, color: '#64748B', marginTop: '16px' }}>
            Free to join · Compare any 3 cars from the live inventory
          </p>
        </div>
      </main>
    </div>
  );
};

export default CompareTeaser;
