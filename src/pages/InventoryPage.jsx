import React, { useState, useEffect } from 'react';
import Navbar from '../components/Landing/Navbar';
import VehicleCard from '../components/Inventory/VehicleCard';
import ViewToggle from '../components/Inventory/ViewToggle';
import { motion } from 'framer-motion';

const InventoryPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles');
        
        if (!response.ok) {
          throw new Error(`Server returned a ${response.status} status. The backend API might be down or missing this route.`);
        }
        
        // Sometimes non-JSON is returned (e.g., 404 HTML pages)
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response. The backend server might need to be restarted to register the new routes.");
        }

        const data = await response.json();
        
        setTimeout(() => {
          if (data.success) {
            if (data.data.length === 0) {
              setError("No vehicles found in the database. Did you run the seed script?");
            } else {
              setVehicles(data.data);
            }
          } else {
            setError(data.error || "Failed to fetch vehicles from the server.");
          }
          setLoading(false);
        }, 1500);
      } catch (err) {
        console.error("Failed to fetch vehicles", err);
        setError(err.message || "A network error occurred while connecting to the backend.");
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F8F6', paddingBottom: '100px' }}>
      <Navbar />

      <main style={{ paddingTop: '120px', maxWidth: '1400px', margin: '0 auto', paddingLeft: '48px', paddingRight: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '48px',
              fontWeight: 800,
              color: '#1a2744',
              letterSpacing: '-1px',
              margin: '0 0 8px 0'
            }}>
              Inventory
            </h1>
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '18px',
              color: '#666',
              margin: 0
            }}>
              Explore our premium collection of exceptional vehicles.
            </p>
          </div>

          <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <img src="/loader.svg" alt="Loading..." style={{ width: '80px', height: '80px' }} />
          </div>
        ) : error ? (
          <div style={{
            background: 'rgba(218, 54, 51, 0.05)',
            border: '1px solid rgba(218, 54, 51, 0.2)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            marginTop: '40px'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#da3633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '24px', fontWeight: 700, color: '#1a2744', margin: '0 0 12px 0' }}>
              Oops! Something went wrong.
            </h3>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '16px', color: '#666', maxWidth: '600px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: '#1a2744',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : (
          <motion.div 
            layout
            style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : '1fr',
              gap: '24px'
            }}
          >
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.vehicleId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <VehicleCard vehicle={vehicle} viewMode={viewMode} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default InventoryPage;
