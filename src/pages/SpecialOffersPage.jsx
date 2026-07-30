import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Fuel, Gauge, Tag } from 'lucide-react';
import Navbar from '../components/Landing/Navbar';
import DashboardLayout from '../components/Dashboard/DashboardLayout';

const EASE = [0.4, 0, 0.2, 1];

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

// Marketing showcase only — fixed discounts per demo car, applied on the frontend.
// The purchase flow still charges the real DB price; nothing here touches the API.
export const OFFER_PERCENTS = {
  CAR001: 8,
  CAR002: 12,
  CAR003: 9,
  CAR004: 10,
  CAR005: 6,
  CAR006: 15,
};

// Showroom prices should stay clean — round the discounted figure to the nearest thousand.
export const discountedPrice = (price, percent) =>
  Math.round((price * (1 - percent / 100)) / 1000) * 1000;

const formatPrice = (value, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

const specItemStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '7px',
  fontFamily: "'Manrope', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  color: '#1a2744',
  padding: '14px 4px',
};

const OfferCard = ({ vehicle, index }) => {
  const percent = OFFER_PERCENTS[vehicle.id] ?? 10;
  const newPrice = discountedPrice(vehicle.price, percent);

  // Cursor-tracked specular highlight: the card's sheen follows the pointer.
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      className="dh-offer-card"
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: EASE }}
    >
      <div className="dh-offer-card-body">
        <div style={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', background: '#ececeb', height: '210px' }}>
          <img
            src={vehicle.image}
            alt={`${vehicle.make} ${vehicle.model}`}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', top: '14px', left: '14px',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            background: '#1a2744', color: '#fff',
            padding: '6px 12px', borderRadius: '8px',
            fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px',
          }}>
            <Tag size={12} /> -{percent}%
          </div>
        </div>

        <div style={{ padding: '16px 6px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '17px', color: '#1a2744', lineHeight: 1.3 }}>
                {vehicle.make} {vehicle.model}
              </div>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: '13px', color: '#94A3B8', marginTop: '3px' }}>
                {vehicle.category} · Certified Pre-Owned
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <s style={{ display: 'block', fontFamily: "'Manrope', sans-serif", fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>
                {formatPrice(vehicle.price, vehicle.currency)}
              </s>
              <span style={{
                display: 'inline-block', marginTop: '4px',
                background: 'rgba(34,197,94,0.12)', color: '#16A34A',
                padding: '6px 14px', borderRadius: '999px',
                fontFamily: "'Manrope', sans-serif", fontSize: '14px', fontWeight: 800,
              }}>
                {formatPrice(newPrice, vehicle.currency)}
              </span>
            </div>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            borderTop: '1px solid rgba(0,0,0,0.07)', marginTop: '16px',
          }}>
            <div style={specItemStyle}>
              <Calendar size={15} color="#64748B" /> {vehicle.year}
            </div>
            <div style={{ ...specItemStyle, borderLeft: '1px solid rgba(0,0,0,0.07)', borderRight: '1px solid rgba(0,0,0,0.07)' }}>
              <Fuel size={15} color="#64748B" /> {vehicle.fuelType}
            </div>
            <div style={specItemStyle}>
              <Gauge size={15} color="#64748B" /> {vehicle.mileage ? `${vehicle.mileage.toLocaleString('en-IN')} km` : 'New'}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const SpecialOffersPage = () => {
  const [user] = useState(getStoredUser);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/inventory_data/car_data.json')
      .then((res) => res.json())
      .then((cars) => { if (!cancelled) setVehicles(cars); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const content = (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: user ? '48px' : '140px 48px 80px' }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{ textAlign: 'center', marginBottom: '44px' }}
      >
        <h1 style={{
          fontFamily: "'Manrope', sans-serif", fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: 800,
          color: '#1a2744', letterSpacing: '-1.5px', lineHeight: 1.1, margin: '0 0 14px',
        }}>
          Special Offers
        </h1>
        <p style={{
          fontFamily: "'Manrope', sans-serif", fontSize: '17px', color: '#64748B',
          lineHeight: 1.6, maxWidth: '540px', margin: '0 auto',
        }}>
          Hand-picked deals from the showroom floor — same certified cars,
          same 150-point inspection, better price for a limited time.
        </p>
      </motion.div>

      <div className="dh-offers-grid">
        {vehicles.map((vehicle, i) => (
          <OfferCard key={vehicle.id} vehicle={vehicle} index={i} />
        ))}
      </div>

      {/* Specular glow shell: a soft drifting halo behind each card plus a
          cursor-tracked sheen on the card surface. */}
      <style>{`
        .dh-offers-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 28px;
        }
        .dh-offer-card {
          position: relative;
          border-radius: 20px;
          --mx: 50%;
          --my: 0%;
        }
        .dh-offer-card::before {
          content: '';
          position: absolute;
          inset: -3px;
          border-radius: 24px;
          background: linear-gradient(120deg, rgba(37,99,235,0.55), rgba(124,58,237,0.4), rgba(34,211,238,0.45), rgba(37,99,235,0.55));
          background-size: 300% 300%;
          filter: blur(16px);
          opacity: 0.35;
          animation: dh-offer-glow-drift 7s ease-in-out infinite;
          transition: opacity 0.35s ease;
        }
        .dh-offer-card:hover::before { opacity: 0.7; }
        .dh-offer-card-body {
          position: relative;
          background: #ffffff;
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 20px;
          padding: 12px 12px 16px;
          overflow: hidden;
        }
        .dh-offer-card-body::after {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(260px circle at var(--mx) var(--my), rgba(255,255,255,0.5), transparent 65%);
          mix-blend-mode: overlay;
        }
        @keyframes dh-offer-glow-drift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @media (max-width: 1000px) {
          .dh-offers-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }
        @media (max-width: 680px) {
          .dh-offers-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );

  // Same dual-shell convention as the Contact page: dashboard sidebar for
  // logged-in users, the landing navbar for visitors.
  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F8F6' }}>
      <Navbar />
      {content}
    </div>
  );
};

export default SpecialOffersPage;
