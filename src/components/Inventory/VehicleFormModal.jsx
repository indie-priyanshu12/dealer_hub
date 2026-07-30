import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { API_BASE_URL } from '../../config/api';
import { useToast } from '../../context/ToastContext';

const EMPTY_FORM = {
  vehicleId: '',
  make: '',
  model: '',
  category: '',
  year: '',
  price: '',
  currency: '',
  fuelType: '',
  color: '',
  mileage: '',
  stock: '',
  image: '',
  description: '',
  featured: false,
};

const buildFormState = (vehicle) => {
  if (!vehicle) return EMPTY_FORM;

  return {
    vehicleId: vehicle.vehicleId || '',
    make: vehicle.make || '',
    model: vehicle.model || '',
    category: vehicle.category || '',
    year: vehicle.year != null ? String(vehicle.year) : '',
    price: vehicle.price != null ? String(vehicle.price) : '',
    currency: vehicle.currency || '',
    fuelType: vehicle.fuelType || '',
    color: vehicle.color || '',
    mileage: vehicle.mileage != null ? String(vehicle.mileage) : '',
    stock: vehicle.stock != null ? String(vehicle.stock) : '',
    image: vehicle.image || '',
    description: vehicle.description || '',
    featured: !!vehicle.featured,
  };
};

const isNonEmptyNumber = (value) => value !== '' && Number.isFinite(Number(value));

const buildPayload = (form) => {
  const payload = {
    vehicleId: form.vehicleId.trim(),
    make: form.make.trim(),
    model: form.model.trim(),
    category: form.category.trim(),
    price: Number(form.price),
    stock: Number(form.stock),
  };

  if (form.year !== '') payload.year = Number(form.year);
  if (form.currency.trim() !== '') payload.currency = form.currency.trim();
  if (form.fuelType.trim() !== '') payload.fuelType = form.fuelType.trim();
  if (form.color.trim() !== '') payload.color = form.color.trim();
  if (form.mileage !== '') payload.mileage = Number(form.mileage);
  if (form.image.trim() !== '') payload.image = form.image.trim();
  if (form.description.trim() !== '') payload.description = form.description.trim();
  if (form.featured) payload.featured = true;

  return payload;
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 14px',
  borderRadius: '14px',
  border: '1px solid rgba(0,0,0,.12)',
  fontSize: '14px',
  fontFamily: "'Manrope', sans-serif",
};

const disabledInputStyle = {
  ...inputStyle,
  background: 'rgba(0,0,0,.04)',
  color: '#64748B',
  cursor: 'not-allowed',
};

const labelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: '#1a2744',
  marginBottom: '6px',
};

const Field = ({ label, htmlFor, children }) => (
  <div>
    <label style={labelStyle} htmlFor={htmlFor}>{label}</label>
    {children}
  </div>
);

const VehicleFormModal = ({ vehicle, onSaved }) => {
  const isEditMode = !!vehicle;
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(() => buildFormState(vehicle));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  const isFormValid =
    form.vehicleId.trim() !== '' &&
    form.make.trim() !== '' &&
    form.model.trim() !== '' &&
    form.category.trim() !== '' &&
    isNonEmptyNumber(form.price) && Number(form.price) > 0 &&
    isNonEmptyNumber(form.stock) && Number(form.stock) >= 0;

  const openModal = () => {
    setForm(buildFormState(vehicle));
    setError(null);
    setOpen(true);
  };

  const closeModal = () => setOpen(false);

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const url = isEditMode ? `${API_BASE_URL}/api/vehicles/${vehicle._id}` : `${API_BASE_URL}/api/vehicles`;
      const method = isEditMode ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildPayload(form)),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || `Unable to ${isEditMode ? 'save changes to' : 'add'} this vehicle. Please try again.`);
        toast.error("We couldn't process your request. Please try again.");
        return;
      }

      onSaved(data.data);
      toast.success(isEditMode ? 'Changes saved.' : 'Vehicle successfully added.');
      setOpen(false);
    } catch (err) {
      setError(`Unable to ${isEditMode ? 'save changes to' : 'add'} this vehicle. Please try again.`);
      toast.error("We couldn't process your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={openModal}
        style={
          isEditMode
            ? {
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
              }
            : {
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: '14px',
                color: '#fff',
                background: 'linear-gradient(135deg, #1a2744 0%, #2d4a8f 100%)',
                border: 'none',
                borderRadius: '999px',
                padding: '10px 22px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }
        }
      >
        {isEditMode ? 'Edit' : '+ Add Vehicle'}
      </button>

      {open && createPortal(
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(26, 39, 68, 0.35)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              borderRadius: '24px',
              boxShadow: '0 25px 60px rgba(0,0,0,.12)',
              padding: '32px',
              width: '560px',
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 48px)',
              overflowY: 'auto',
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            <h3 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 800, color: '#1a2744' }}>
              {isEditMode ? `Edit ${vehicle.make} ${vehicle.model}` : 'Add Vehicle'}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <Field label="Vehicle ID" htmlFor="vehicleId">
                <input
                  id="vehicleId"
                  name="vehicleId"
                  style={isEditMode ? disabledInputStyle : inputStyle}
                  value={form.vehicleId}
                  onChange={handleChange}
                  disabled={isEditMode}
                />
              </Field>
              <Field label="Category" htmlFor="category">
                <input id="category" name="category" style={inputStyle} value={form.category} onChange={handleChange} />
              </Field>
              <Field label="Make" htmlFor="make">
                <input id="make" name="make" style={inputStyle} value={form.make} onChange={handleChange} />
              </Field>
              <Field label="Model" htmlFor="model">
                <input id="model" name="model" style={inputStyle} value={form.model} onChange={handleChange} />
              </Field>
              <Field label="Year" htmlFor="year">
                <input id="year" name="year" type="number" style={inputStyle} value={form.year} onChange={handleChange} />
              </Field>
              <Field label="Fuel Type" htmlFor="fuelType">
                <input id="fuelType" name="fuelType" style={inputStyle} value={form.fuelType} onChange={handleChange} />
              </Field>
              <Field label="Price" htmlFor="price">
                <input id="price" name="price" type="number" style={inputStyle} value={form.price} onChange={handleChange} />
              </Field>
              <Field label="Currency" htmlFor="currency">
                <input id="currency" name="currency" placeholder="INR" style={inputStyle} value={form.currency} onChange={handleChange} />
              </Field>
              <Field label="Stock" htmlFor="stock">
                <input id="stock" name="stock" type="number" style={inputStyle} value={form.stock} onChange={handleChange} />
              </Field>
              <Field label="Mileage" htmlFor="mileage">
                <input id="mileage" name="mileage" type="number" style={inputStyle} value={form.mileage} onChange={handleChange} />
              </Field>
              <Field label="Color" htmlFor="color">
                <input id="color" name="color" style={inputStyle} value={form.color} onChange={handleChange} />
              </Field>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '22px' }}>
                <input id="featured" name="featured" type="checkbox" checked={form.featured} onChange={handleChange} />
                <label htmlFor="featured" style={{ fontSize: '13px', fontWeight: 600, color: '#1a2744' }}>Featured</label>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <Field label="Image URL" htmlFor="image">
                <input id="image" name="image" style={inputStyle} value={form.image} onChange={handleChange} />
              </Field>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle} htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
                value={form.description}
                onChange={handleChange}
              />
            </div>

            {error && (
              <p role="alert" style={{ margin: '0 0 16px', fontSize: '13px', color: '#da3633' }}>
                {error}
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
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
                onClick={handleSubmit}
                disabled={!isFormValid || loading}
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: '14px',
                  color: '#fff',
                  background: !isFormValid || loading ? '#9ca3af' : 'linear-gradient(135deg, #1a2744 0%, #2d4a8f 100%)',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '10px 22px',
                  cursor: !isFormValid || loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading
                  ? (isEditMode ? 'Saving…' : 'Adding…')
                  : (isEditMode ? 'Save Changes' : 'Add Vehicle')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default VehicleFormModal;
