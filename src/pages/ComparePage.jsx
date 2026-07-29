import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import PurchaseButton from '../components/Inventory/PurchaseButton';
import { useCompare, MAX_COMPARE } from '../context/CompareContext';
import { API_BASE_URL } from '../config/api';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const formatPrice = (vehicle) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: vehicle.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(vehicle.price);

const SPEC_ROWS = [
  { label: 'Price', render: formatPrice },
  { label: 'Stock', render: (v) => (v.stock > 0 ? `${v.stock} In Stock` : 'Out of Stock') },
  { label: 'Year', render: (v) => v.year || '—' },
  { label: 'Category', render: (v) => v.category || '—' },
  { label: 'Fuel Type', render: (v) => v.fuelType || '—' },
  { label: 'Color', render: (v) => v.color || '—' },
  { label: 'Mileage', render: (v) => (v.mileage ? `${v.mileage.toLocaleString()} km` : 'New') },
  { label: 'Description', render: (v) => v.description || '—' },
];

const cellStyle = { padding: '16px', borderBottom: '1px solid rgba(0,0,0,.06)', fontFamily: "'Manrope', sans-serif", fontSize: '14px', color: '#1a2744', verticalAlign: 'top' };
const labelCellStyle = { ...cellStyle, fontWeight: 700, color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' };

const ComparePage = () => {
  const { compareIds, removeFromCompare } = useCompare();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user] = useState(getStoredUser);
  const isAdmin = user?.role === 'Admin';

  useEffect(() => {
    if (compareIds.length === 0) {
      setVehicles([]);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();

    const fetchAll = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const responses = await Promise.all(
          compareIds.map((id) =>
            fetch(`${API_BASE_URL}/api/vehicles/${id}`, { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal })
          )
        );

        if (responses.some((res) => res.status === 401)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
          return;
        }

        const bodies = await Promise.all(responses.map((res) => res.json()));
        setVehicles(bodies.filter((data) => data.success).map((data) => data.data));
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('A network error occurred while loading your comparison.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    return () => controller.abort();
  }, [compareIds]);

  const handlePurchased = (updatedVehicle) => {
    setVehicles((prev) => prev.map((v) => (v._id === updatedVehicle._id ? updatedVehicle : v)));
  };

  return (
    <DashboardLayout>
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px', paddingBottom: '100px' }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '36px', fontWeight: 800, color: '#1a2744', margin: '0 0 8px', letterSpacing: '-1px' }}>
          Compare Vehicles
        </h1>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '16px', color: '#666', margin: '0 0 32px' }}>
          Comparing {compareIds.length} of {MAX_COMPARE} vehicles.
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh' }}>
            <img src="/loader.svg" alt="Loading..." style={{ width: '80px', height: '80px' }} />
          </div>
        ) : error ? (
          <div style={{ background: 'rgba(218, 54, 51, 0.05)', border: '1px solid rgba(218, 54, 51, 0.2)', borderRadius: '16px', padding: '40px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'Manrope', sans-serif", color: '#1a2744', margin: 0 }}>{error}</p>
          </div>
        ) : vehicles.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: '60px', fontFamily: "'Manrope', sans-serif" }}>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1a2744', margin: '0 0 8px' }}>
              Nothing to compare yet
            </h3>
            <p style={{ fontSize: '15px', color: '#666', margin: '0 0 24px' }}>
              Tap Compare on up to {MAX_COMPARE} vehicles in the inventory to see them side by side.
            </p>
            <Link
              to="/inventory"
              style={{ display: 'inline-block', background: '#1a2744', color: '#fff', textDecoration: 'none', padding: '12px 28px', borderRadius: '999px', fontWeight: 700, fontSize: '15px' }}
            >
              Browse Inventory
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: '20px', border: '1px solid rgba(0,0,0,.08)', background: '#fff' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...labelCellStyle, background: '#F8F8F6' }} />
                  {vehicles.map((vehicle) => (
                    <th key={vehicle._id} style={{ ...cellStyle, minWidth: '220px', textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                        <button
                          onClick={() => removeFromCompare(vehicle._id)}
                          aria-label={`Remove ${vehicle.make} ${vehicle.model} from comparison`}
                          style={{ background: 'rgba(0,0,0,.05)', border: 'none', borderRadius: '999px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div style={{ borderRadius: '14px', overflow: 'hidden', background: '#ececeb', aspectRatio: '4 / 3', marginBottom: '12px' }}>
                        {vehicle.image ? (
                          <img src={vehicle.image} alt={`${vehicle.make} ${vehicle.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0a0a0', fontSize: '13px' }}>
                            {vehicle.make} {vehicle.model}
                          </div>
                        )}
                      </div>
                      <Link to={`/inventory/${vehicle._id}`} style={{ textDecoration: 'none', color: '#1a2744', fontWeight: 800, fontSize: '16px' }}>
                        {vehicle.make} {vehicle.model}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SPEC_ROWS.map((row) => (
                  <tr key={row.label}>
                    <td style={{ ...labelCellStyle, background: '#F8F8F6' }}>{row.label}</td>
                    {vehicles.map((vehicle) => (
                      <td key={vehicle._id} style={cellStyle}>{row.render(vehicle)}</td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td style={{ ...labelCellStyle, background: '#F8F8F6' }}>Actions</td>
                  {vehicles.map((vehicle) => (
                    <td key={vehicle._id} style={{ ...cellStyle, borderBottom: 'none' }}>
                      {!isAdmin && (
                        <PurchaseButton vehicleId={vehicle._id} stock={vehicle.stock} onPurchase={handlePurchased} />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default ComparePage;
