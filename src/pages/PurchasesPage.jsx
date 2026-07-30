import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { API_BASE_URL, resolveImageUrl } from '../config/api';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

export const formatPurchaseDate = (iso) =>
  new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });

export const formatPaid = (purchase) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: purchase.currency || 'INR',
    maximumFractionDigits: 0,
  }).format(purchase.pricePaid);

const cellStyle = {
  padding: '16px',
  borderBottom: '1px solid rgba(0,0,0,.06)',
  fontFamily: "'Manrope', sans-serif",
  fontSize: '14px',
  color: '#1a2744',
  verticalAlign: 'middle',
};
const headCellStyle = {
  ...cellStyle,
  fontWeight: 700,
  color: '#64748B',
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  textAlign: 'left',
  whiteSpace: 'nowrap',
};

const PurchasesPage = () => {
  const [user] = useState(getStoredUser);
  const isAdmin = user?.role === 'Admin';
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Admins are redirected to the cross-customer ledger below — skip the fetch.
    if (isAdmin) return;
    const controller = new AbortController();

    const fetchPurchases = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/purchases/mine`, {
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
          setError('We could not load your purchases. Please try again.');
          return;
        }
        setPurchases(data.data);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('We could not load your purchases. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
    return () => controller.abort();
  }, [isAdmin]);

  // Admins don't have a personal buying history here — their view of purchases
  // is the Customer Orders ledger.
  if (isAdmin) {
    return <Navigate to="/admin/purchases" replace />;
  }

  return (
    <DashboardLayout>
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px', paddingBottom: '100px' }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '36px', fontWeight: 800, color: '#1a2744', margin: '0 0 8px', letterSpacing: '-1px' }}>
          My Purchases
        </h1>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '16px', color: '#666', margin: '0 0 32px' }}>
          Every car you've bought, with the price you paid and when.
        </p>

        {loading && (
          <p style={{ fontFamily: "'Manrope', sans-serif", color: '#64748B' }}>Loading your purchases…</p>
        )}

        {error && !loading && (
          <p role="alert" style={{ fontFamily: "'Manrope', sans-serif", color: '#da3633', fontWeight: 600 }}>{error}</p>
        )}

        {!loading && !error && purchases.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            background: 'rgba(255,255,255,0.7)', borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.6)', fontFamily: "'Manrope', sans-serif",
          }}>
            <ShoppingBag size={36} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a2744', margin: '0 0 8px' }}>
              No purchases yet
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 20px' }}>
              When you buy a car, it will show up here with its receipt details.
            </p>
            <Link to="/inventory" style={{
              display: 'inline-block', textDecoration: 'none',
              background: 'linear-gradient(135deg, #1a2744 0%, #2d4a8f 100%)', color: '#fff',
              fontWeight: 700, fontSize: '14px', padding: '12px 26px', borderRadius: '999px',
            }}>
              Browse the Inventory
            </Link>
          </div>
        )}

        {!loading && !error && purchases.length > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.75)', borderRadius: '20px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 12px 40px rgba(0,0,0,0.06)',
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={headCellStyle}>Vehicle</th>
                    <th style={headCellStyle}>Order Ref</th>
                    <th style={headCellStyle}>Price Paid</th>
                    <th style={headCellStyle}>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => (
                    <tr key={purchase._id}>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ width: '72px', height: '48px', borderRadius: '10px', overflow: 'hidden', background: '#ececeb', flexShrink: 0 }}>
                            {purchase.image && (
                              <img
                                src={resolveImageUrl(purchase.image)}
                                alt={`${purchase.make} ${purchase.model}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                            )}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800 }}>{purchase.make} {purchase.model}</div>
                            <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{purchase.category || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...cellStyle, fontWeight: 600, color: '#64748B' }}>{purchase.vehicleId || '—'}</td>
                      <td style={{ ...cellStyle, fontWeight: 800 }}>{formatPaid(purchase)}</td>
                      <td style={cellStyle}>{formatPurchaseDate(purchase.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default PurchasesPage;
