import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import VehicleFormModal from './VehicleFormModal';

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText(/vehicle id/i), { target: { value: 'CAR099' } });
  fireEvent.change(screen.getByLabelText(/^make/i), { target: { value: 'Audi' } });
  fireEvent.change(screen.getByLabelText(/^model/i), { target: { value: 'Q7' } });
  fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'SUV' } });
  fireEvent.change(screen.getByLabelText(/^price/i), { target: { value: '6500000' } });
  fireEvent.change(screen.getByLabelText(/^stock/i), { target: { value: '4' } });
};

const existingVehicle = {
  _id: 'abc123',
  vehicleId: 'CAR001',
  make: 'BMW',
  model: 'M4 Competition',
  category: 'Sports Coupe',
  year: 2024,
  price: 8995000,
  currency: 'INR',
  fuelType: 'Petrol',
  color: 'Yellow',
  mileage: 8500,
  stock: 5,
  image: 'https://example.com/m4.png',
  description: 'A fast car.',
  featured: true,
};

describe('VehicleFormModal — add mode (no vehicle prop)', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    global.fetch = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders an "Add Vehicle" trigger and keeps the form closed until clicked', () => {
    render(<VehicleFormModal onSaved={() => {}} />);

    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/vehicle id/i)).not.toBeInTheDocument();
  });

  it('opens the form on click and disables Submit until all required fields are valid', () => {
    render(<VehicleFormModal onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));

    const submitButton = screen.getByRole('button', { name: /^add vehicle$/i, hidden: true });
    expect(screen.getByLabelText(/vehicle id/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    fillRequiredFields();

    expect(submitButton).toBeEnabled();
  });

  it('submits required fields plus any filled-in optional fields with correct types, reports the new vehicle, and closes on success', async () => {
    const newVehicle = { _id: 'xyz789', vehicleId: 'CAR099', make: 'Audi', model: 'Q7', stock: 4 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({ success: true, data: newVehicle }),
    });
    const onSaved = vi.fn();

    render(<VehicleFormModal onSaved={onSaved} />);
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2024' } });
    fireEvent.click(screen.getByLabelText(/featured/i));
    // Currency, fuel type, color, mileage, image, description are left blank —
    // they must be omitted from the payload rather than sent as empty strings.

    fireEvent.click(screen.getByRole('button', { name: /^add vehicle$/i, hidden: true }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(newVehicle));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/vehicles',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer fake-token' }),
      })
    );
    const [, options] = global.fetch.mock.calls[0];
    const body = JSON.parse(options.body);
    expect(body).toEqual({
      vehicleId: 'CAR099',
      make: 'Audi',
      model: 'Q7',
      category: 'SUV',
      price: 6500000,
      stock: 4,
      year: 2024,
      featured: true,
    });
    expect(screen.queryByLabelText(/vehicle id/i)).not.toBeInTheDocument();
  });

  it('shows an inline error, does not call onSaved, and keeps the form open when the server rejects the vehicle', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ success: false, error: 'A vehicle with this ID already exists' }),
    });
    const onSaved = vi.fn();

    render(<VehicleFormModal onSaved={onSaved} />);
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /^add vehicle$/i, hidden: true }));

    expect(await screen.findByText(/a vehicle with this id already exists/i)).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/vehicle id/i)).toBeInTheDocument();
  });

  it('clears stored auth and redirects to /auth on a 401', async () => {
    localStorage.setItem('user', JSON.stringify({ email: 'a@b.com' }));
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Not authorized' }),
    });

    render(<VehicleFormModal onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /^add vehicle$/i, hidden: true }));

    await waitFor(() => expect(window.location.href).toBe('/auth'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('closes the form without calling fetch when Cancel is clicked', () => {
    render(<VehicleFormModal onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByLabelText(/vehicle id/i)).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});

describe('VehicleFormModal — edit mode (vehicle prop given)', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders an "Edit" trigger and opens pre-filled with the vehicle\'s existing values', () => {
    render(<VehicleFormModal vehicle={existingVehicle} onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

    expect(screen.getByLabelText(/vehicle id/i)).toHaveValue('CAR001');
    expect(screen.getByLabelText(/^make/i)).toHaveValue('BMW');
    expect(screen.getByLabelText(/^model/i)).toHaveValue('M4 Competition');
    expect(screen.getByLabelText(/^price/i)).toHaveValue(8995000);
    expect(screen.getByLabelText(/^stock/i)).toHaveValue(5);
    expect(screen.getByLabelText(/featured/i)).toBeChecked();
  });

  it('does not allow editing the Vehicle ID of an existing vehicle', () => {
    render(<VehicleFormModal vehicle={existingVehicle} onSaved={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));

    expect(screen.getByLabelText(/vehicle id/i)).toBeDisabled();
  });

  it('submits a PUT to the vehicle\'s own URL with the current form state, reports the updated vehicle, and closes on success', async () => {
    const updatedVehicle = { ...existingVehicle, price: 9200000 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: updatedVehicle }),
    });
    const onSaved = vi.fn();

    render(<VehicleFormModal vehicle={existingVehicle} onSaved={onSaved} />);
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
    fireEvent.change(screen.getByLabelText(/^price/i), { target: { value: '9200000' } });
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(onSaved).toHaveBeenCalledWith(updatedVehicle));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/vehicles/abc123',
      expect.objectContaining({
        method: 'PUT',
        headers: expect.objectContaining({ Authorization: 'Bearer fake-token' }),
      })
    );
    const [, options] = global.fetch.mock.calls[0];
    expect(JSON.parse(options.body).price).toBe(9200000);
    expect(screen.queryByLabelText(/^price/i)).not.toBeInTheDocument();
  });

  it('shows an inline error and keeps the form open when the server rejects the update', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ success: false, error: 'Validation failed' }),
    });
    const onSaved = vi.fn();

    render(<VehicleFormModal vehicle={existingVehicle} onSaved={onSaved} />);
    fireEvent.click(screen.getByRole('button', { name: /^edit$/i }));
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));

    expect(await screen.findByText(/validation failed/i)).toBeInTheDocument();
    expect(onSaved).not.toHaveBeenCalled();
  });
});
