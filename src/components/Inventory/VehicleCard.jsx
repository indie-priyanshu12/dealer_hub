import React from 'react';
import { motion } from 'framer-motion';

const VehicleCard = ({ vehicle, viewMode }) => {
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
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
      style={baseStyle}
      onClick={() => alert(`Details for ${vehicle.make} ${vehicle.model} coming soon!`)}
    >
      {/* Image Section */}
      <div style={{
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
        
        {/* Attempt to load the image, it will lay on top of the placeholder text if successful */}
        <img 
          src={`/inventory_data/car_images/${vehicle.model.toLowerCase().replace(/ /g, '_')}/img (1).png`}
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
      </div>

      {/* Content Section */}
      <div style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexGrow: 1,
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h3 style={{
              margin: 0,
              fontSize: isGrid ? '20px' : '28px',
              fontWeight: 800,
              color: '#1a2744',
              fontFamily: "'Manrope', sans-serif",
            }}>
              {vehicle.make} {vehicle.model}
            </h3>
            <span style={{
              fontSize: isGrid ? '18px' : '24px',
              fontWeight: 700,
              color: '#1a2744',
              fontFamily: "'Manrope', sans-serif",
            }}>
              {formattedPrice}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '12px', color: '#666', fontSize: '14px', fontFamily: "'Manrope', sans-serif", marginBottom: '16px' }}>
            <span>{vehicle.year}</span> • 
            <span>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'New'}</span> • 
            <span>{vehicle.fuelType}</span>
          </div>

          {!isGrid && (
            <p style={{
              color: '#555',
              fontSize: '15px',
              lineHeight: 1.5,
              fontFamily: "'Manrope', sans-serif",
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {vehicle.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: isGrid ? '20px' : '0' }}>
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
      </div>
    </motion.div>
  );
};

export default VehicleCard;
