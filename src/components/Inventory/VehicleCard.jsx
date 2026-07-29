import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PurchaseButton from './PurchaseButton';
import DeleteVehicleButton from './DeleteVehicleButton';

// Shared easing for every layout (FLIP) transition in this card, so the image, content
// block, and outer slot all settle in lockstep instead of drifting at different rates.
const LAYOUT_TRANSITION = { duration: 0.35, ease: [0.4, 0, 0.2, 1] };

const VehicleCard = ({ vehicle, viewMode, isAdmin, onPurchase, onDelete }) => {
  const isGrid = viewMode === 'grid';
  
  // Format currency
  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: vehicle.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  // A glassmorphism wrapper
  const baseStyle = {
    background: 'rgba(255, 255, 255, 0.65)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: isGrid ? 'column' : 'row',
    height: isGrid ? '100%' : '280px',
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
      transition={{ layout: LAYOUT_TRANSITION, default: { duration: 0.2 } }}
      style={baseStyle}
      onClick={() => alert(`Details for ${vehicle.make} ${vehicle.model} coming soon!`)}
    >
      {/* Image Section */}
      <motion.div
        layout
        transition={LAYOUT_TRANSITION}
        style={{
          width: isGrid ? '100%' : '40%',
          height: isGrid ? '220px' : '100%',
          background: '#ececeb', // placeholder color
          position: 'relative',
          flexShrink: 0,
        }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a0a0a0',
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 600
        }}>
          {vehicle.make} {vehicle.model}
        </div>
        
        {/* Only load the image if it is provided directly from the database */}
        {vehicle.image && (
          <img 
            src={vehicle.image}
            alt={`${vehicle.make} ${vehicle.model}`}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 1,
              transition: 'opacity 0.3s'
            }}
            onError={(e) => {
              // Hide the image if it fails to load so the placeholder text underneath is visible
              e.target.style.opacity = '0';
            }}
          />
        )}
        
        {vehicle.featured && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            background: '#1a2744',
            color: 'white',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 700,
            fontFamily: "'Manrope', sans-serif",
          }}>
            FEATURED
          </div>
        )}
      </motion.div>

      {/* Content Section */}
      <motion.div
        layout
        transition={LAYOUT_TRANSITION}
        style={{
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flexGrow: 1,
        }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <motion.h3
              layout="position"
              animate={{ fontSize: isGrid ? 20 : 28 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                margin: 0,
                fontWeight: 800,
                color: '#1a2744',
                fontFamily: "'Manrope', sans-serif",
              }}>
              {vehicle.make} {vehicle.model}
            </motion.h3>
            <motion.span
              layout="position"
              animate={{ fontSize: isGrid ? 18 : 24 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              style={{
                fontWeight: 700,
                color: '#1a2744',
                fontFamily: "'Manrope', sans-serif",
              }}>
              {formattedPrice}
            </motion.span>
          </div>

          <div style={{ display: 'flex', gap: '12px', color: '#666', fontSize: '14px', fontFamily: "'Manrope', sans-serif", marginBottom: '16px' }}>
            <span>{vehicle.year}</span> •
            <span>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'New'}</span> •
            <span>{vehicle.fuelType}</span>
          </div>

          <AnimatePresence initial={false}>
            {!isGrid && (
              <motion.p
                key="description"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  color: '#555',
                  fontSize: '15px',
                  lineHeight: 1.5,
                  fontFamily: "'Manrope', sans-serif",
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  margin: 0,
                }}>
                {vehicle.description}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: isGrid ? '20px' : '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{
              color: vehicle.stock > 0 ? '#2ea043' : '#da3633',
              fontSize: '14px',
              fontWeight: 700,
              fontFamily: "'Manrope', sans-serif",
              background: vehicle.stock > 0 ? 'rgba(46, 160, 67, 0.1)' : 'rgba(218, 54, 51, 0.1)',
              padding: '4px 12px',
              borderRadius: '12px'
            }}>
              {vehicle.stock > 0 ? `${vehicle.stock} In Stock` : 'Out of Stock'}
            </span>

            <button style={{
              background: 'transparent',
              border: 'none',
              color: '#1a2744',
              fontWeight: 700,
              fontSize: '14px',
              fontFamily: "'Manrope', sans-serif",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              View Details
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', gap: '10px' }}>
            {isAdmin && (
              <DeleteVehicleButton
                vehicleId={vehicle._id}
                vehicleLabel={`${vehicle.make} ${vehicle.model}`}
                onDeleted={onDelete}
              />
            )}
            <PurchaseButton vehicleId={vehicle._id} stock={vehicle.stock} onPurchase={onPurchase} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VehicleCard;
