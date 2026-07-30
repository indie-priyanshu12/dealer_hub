import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { API_BASE_URL } from '../config/api';
import { formatPurchaseDate, formatPaid } from './PurchasesPage';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

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

const AdminPurchasesPage = () => {
  const [user] = useState(getStoredUser);
  const isAdmin = user?.role === 'Admin';
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // The server enforces the Admin gate (403); this guard just avoids a doomed
    // fetch before the <Navigate> below redirects.
    if (!isAdmin) return;
    const controller = new AbortController();

    const fetchAll = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/purchases`, {
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
          setError('We could not load customer orders. Please try again.');
          return;
        }
        setPurchases(data.data);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setError('We could not load customer orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    return () => controller.abort();
  }, [isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/purchases" replace />;
  }

  return (
    <DashboardLayout>
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px', paddingBottom: '100px' }}>
        <h1 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '36px', fontWeight: 800, color: '#1a2744', margin: '0 0 8px', letterSpacing: '-1px' }}>
          Customer Orders
        </h1>
        <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '16px', color: '#666', margin: '0 0 32px' }}>
          Every purchase across all customers — who bought what, when, and for how much.
        </p>

        {loading && (
          <p style={{ fontFamily: "'Manrope', sans-serif", color: '#64748B' }}>Loading customer orders…</p>
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
            <ClipboardList size={36} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1a2744', margin: '0 0 8px' }}>
              No purchases have been made yet
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', margin: 0 }}>
              Customer orders will appear here the moment the first car is bought.
            </p>
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
                    <th style={headCellStyle}>Buyer</th>
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
                        <div style={{ fontWeight: 800 }}>{purchase.userName || '—'}</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{purchase.userEmail || '—'}</div>
                      </td>
                      <td style={{ ...cellStyle, fontWeight: 700 }}>{purchase.make} {purchase.model}</td>
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

export default AdminPurchasesPage;
