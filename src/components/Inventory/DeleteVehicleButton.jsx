import React, { useState } from 'react';
import { API_BASE_URL } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const DeleteVehicleButton = ({ vehicleId, vehicleLabel, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const handleClick = async (event) => {
    event.stopPropagation();

    if (!window.confirm(`Delete ${vehicleLabel}? This cannot be undone.`)) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
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
        setError(data.error || 'Unable to delete this vehicle. Please try again.');
        toast.error("We couldn't process your request. Please try again.");
        return;
      }

      onDeleted(vehicleId);
      toast.success('Vehicle deleted.');
    } catch {
      setError('Unable to delete this vehicle. Please try again.');
      toast.error("We couldn't process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
      <button
        onClick={handleClick}
        disabled={loading}
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontWeight: 700,
          fontSize: '13px',
          color: '#da3633',
          background: 'rgba(218, 54, 51, 0.08)',
          border: '1px solid rgba(218, 54, 51, 0.25)',
          borderRadius: '999px',
          padding: '8px 18px',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? 'Deleting…' : 'Delete'}
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

export default DeleteVehicleButton;
