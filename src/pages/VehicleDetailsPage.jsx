import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import PurchaseButton from '../components/Inventory/PurchaseButton';
import DeleteVehicleButton from '../components/Inventory/DeleteVehicleButton';
import RestockModal from '../components/Inventory/RestockModal';
import VehicleFormModal from '../components/Inventory/VehicleFormModal';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const Spec = ({ label, value }) => (
  <div>
    <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
      {label}
    </div>
    <div style={{ fontSize: '16px', fontWeight: 600, color: '#1a2744', fontFamily: "'Manrope', sans-serif" }}>
      {value || '—'}
    </div>
  </div>
);

const VehicleDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useState(getStoredUser);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    const controller = new AbortController();

    const fetchVehicle = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          setError(data.error || 'This vehicle could not be found.');
          setVehicle(null);
        } else {
          setVehicle(data.data);
          setError(null);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('A network error occurred while loading this vehicle.');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
    return () => controller.abort();
  }, [id]);

  const handleUpdated = (updatedVehicle) => setVehicle(updatedVehicle);
  const handleDeleted = () => navigate('/inventory');

  const formattedPrice = vehicle
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: vehicle.currency || 'INR',
        maximumFractionDigits: 0,
      }).format(vehicle.price)
    : null;

  return (
    <DashboardLayout>
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px', paddingBottom: '100px' }}>
        <Link
          to="/inventory"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: '#3d4a6b',
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            marginBottom: '32px',
          }}
        >
          <ArrowLeft size={16} /> Back to Inventory
        </Link>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <img src="/loader.svg" alt="Loading..." style={{ width: '80px', height: '80px' }} />
          </div>
        ) : error || !vehicle ? (
          <div style={{
            background: 'rgba(218, 54, 51, 0.05)',
            border: '1px solid rgba(218, 54, 51, 0.2)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
          }}>
            <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '24px', fontWeight: 700, color: '#1a2744', margin: '0 0 12px 0' }}>
              {error || 'This vehicle could not be found.'}
            </h3>
            <Link
              to="/inventory"
              style={{
                display: 'inline-block',
                marginTop: '12px',
                background: '#1a2744',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: '15px',
              }}
            >
              Back to Inventory
            </Link>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>
            <div style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: '#ececeb',
              aspectRatio: '4 / 3',
            }}>
              {vehicle.image ? (
                <img
                  src={vehicle.image}
                  alt={`${vehicle.make} ${vehicle.model}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#a0a0a0', fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: '20px',
                }}>
                  {vehicle.make} {vehicle.model}
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
            </div>

            <div>
              <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '36px', fontWeight: 800, color: '#1a2744', margin: '0 0 8px', letterSpacing: '-1px' }}>
                {vehicle.make} {vehicle.model}
              </h1>
              <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '28px', fontWeight: 700, color: '#1a2744', marginBottom: '16px' }}>
                {formattedPrice}
              </div>
              <span style={{
                display: 'inline-block',
                color: vehicle.stock > 0 ? '#2ea043' : '#da3633',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: "'Manrope', sans-serif",
                background: vehicle.stock > 0 ? 'rgba(46, 160, 67, 0.1)' : 'rgba(218, 54, 51, 0.1)',
                padding: '6px 14px',
                borderRadius: '12px',
                marginBottom: '32px',
              }}>
                {vehicle.stock > 0 ? `${vehicle.stock} In Stock` : 'Out of Stock'}
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                <Spec label="Year" value={vehicle.year} />
                <Spec label="Category" value={vehicle.category} />
                <Spec label="Fuel Type" value={vehicle.fuelType} />
                <Spec label="Color" value={vehicle.color} />
                <Spec label="Mileage" value={vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : 'New'} />
                <Spec label="Last Updated" value={vehicle.updatedAt ? new Date(vehicle.updatedAt).toLocaleDateString() : null} />
              </div>

              {vehicle.description && (
                <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#3d4a6b', fontFamily: "'Manrope', sans-serif", marginBottom: '32px' }}>
                  {vehicle.description}
                </p>
              )}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {!isAdmin && (
                  <PurchaseButton vehicleId={vehicle._id} stock={vehicle.stock} onPurchase={handleUpdated} />
                )}
                {isAdmin && (
                  <>
                    <VehicleFormModal vehicle={vehicle} onSaved={handleUpdated} />
                    <RestockModal
                      vehicleId={vehicle._id}
                      vehicleLabel={`${vehicle.make} ${vehicle.model}`}
                      currentStock={vehicle.stock}
                      onRestocked={handleUpdated}
                    />
                    <DeleteVehicleButton
                      vehicleId={vehicle._id}
                      vehicleLabel={`${vehicle.make} ${vehicle.model}`}
                      onDeleted={handleDeleted}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default VehicleDetailsPage;
