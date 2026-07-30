import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const RestockModal = ({ vehicleId, vehicleLabel, currentStock, onRestocked }) => {
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const parsedQuantity = Number(quantity);
  const isValidQuantity = quantity !== '' && Number.isInteger(parsedQuantity) && parsedQuantity > 0;

  const openModal = (event) => {
    event.stopPropagation();
    setQuantity('');
    setError(null);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/restock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: parsedQuantity }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Unable to restock this vehicle. Please try again.');
        toast.error("We couldn't process your request. Please try again.");
        return;
      }

      onRestocked(data.data);
      toast.success('Inventory restocked successfully.');
      setOpen(false);
    } catch {
      setError('Unable to restock this vehicle. Please try again.');
      toast.error("We couldn't process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700,
          fontSize: '13px',
          color: '#1a2744',
          background: 'rgba(26, 39, 68, 0.06)',
          border: '1px solid rgba(26, 39, 68, 0.18)',
          borderRadius: '999px',
          padding: '8px 18px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Restock
      </button>

      {open && createPortal(
        <div
          onClick={(e) => { e.stopPropagation(); closeModal(); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 39, 68, 0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(0,0,0,.12)',
              padding: '32px',
              width: '360px',
              maxWidth: 'calc(100vw - 48px)',
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 800, color: '#1a2744' }}>
              Restock {vehicleLabel}
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#64748B' }}>
              Current Stock: {currentStock}
            </p>

            <label htmlFor="restock-quantity" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1a2744', marginBottom: '8px' }}>
              Quantity to add
            </label>
            <input
              id="restock-quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '12px 16px',
                borderRadius: '18px',
                border: '1px solid rgba(0,0,0,.12)',
                fontSize: '15px',
                fontFamily: "'Manrope', sans-serif",
                marginBottom: '8px',
              }}
            />

            {error && (
              <p role="alert" style={{ margin: '0 0 12px', fontSize: '13px', color: '#da3633' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <button
                onClick={closeModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontWeight: 700,
                  fontSize: '14px',
                  fontFamily: "'Manrope', sans-serif",
                  cursor: 'pointer',
                  padding: '10px 16px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={!isValidQuantity || loading}
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#fff',
                  background: !isValidQuantity || loading ? '#9ca3af' : 'linear-gradient(135deg, #1a2744 0%, #2d4a8f 100%)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '10px 22px',
                  cursor: !isValidQuantity || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Restocking…' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default RestockModal;
