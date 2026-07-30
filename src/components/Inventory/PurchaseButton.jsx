import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const PurchaseButton = ({ vehicleId, stock, onPurchase }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const outOfStock = stock <= 0;
  const disabled = outOfStock || loading;

  const handleClick = async (event) => {
    // The card this button lives on has its own onClick (opens vehicle details) —
    // without this, buying a car would also pop that open underneath it.
    event.stopPropagation();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/purchase`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Unable to complete the purchase. Please try again.');
        toast.error("We couldn't process your request. Please try again.");
        return;
      }

      onPurchase(data.data);
      toast.success('Purchase confirmed.');
    } catch (err) {
      setError('Unable to complete the purchase. Please try again.');
      toast.error("We couldn't process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
      <button
        onClick={handleClick}
        disabled={disabled}
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700,
          fontSize: '14px',
          color: '#fff',
          background: outOfStock ? '#9ca3af' : 'linear-gradient(135deg, #1a2744 0%, #2d4a8f 100%)',
          border: 'none',
          borderRadius: '999px',
          padding: '10px 22px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          boxShadow: outOfStock ? 'none' : '0 4px 12px rgba(26,39,68,0.25)',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        {outOfStock ? 'Out of Stock' : loading ? 'Purchasing…' : 'Purchase'}
      </button>
      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            fontSize: '12px',
            color: '#da3633',
            fontFamily: "'Manrope', sans-serif",
            textAlign: 'right',
            maxWidth: '180px',
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default PurchaseButton;
