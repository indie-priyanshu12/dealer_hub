import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddVehicleModal from './AddVehicleModal';

const fillRequiredFields = () => {
  fireEvent.change(screen.getByLabelText(/vehicle id/i), { target: { value: 'CAR099' } });
  fireEvent.change(screen.getByLabelText(/^make/i), { target: { value: 'Audi' } });
  fireEvent.change(screen.getByLabelText(/^model/i), { target: { value: 'Q7' } });
  fireEvent.change(screen.getByLabelText(/category/i), { target: { value: 'SUV' } });
  fireEvent.change(screen.getByLabelText(/^price/i), { target: { value: '6500000' } });
  fireEvent.change(screen.getByLabelText(/^stock/i), { target: { value: '4' } });
};

describe('AddVehicleModal', () => {
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
    render(<AddVehicleModal onCreated={() => {}} />);

    expect(screen.getByRole('button', { name: /add vehicle/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/vehicle id/i)).not.toBeInTheDocument();
  });

  it('opens the form on click and disables Submit until all required fields are valid', () => {
    render(<AddVehicleModal onCreated={() => {}} />);
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
    const onCreated = vi.fn();

    render(<AddVehicleModal onCreated={onCreated} />);
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2024' } });
    fireEvent.click(screen.getByLabelText(/featured/i));
    // Currency, fuel type, color, mileage, image, description are left blank —
    // they must be omitted from the payload rather than sent as empty strings.

    fireEvent.click(screen.getByRole('button', { name: /^add vehicle$/i, hidden: true }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith(newVehicle));

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

  it('shows an inline error, does not call onCreated, and keeps the form open when the server rejects the vehicle', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ success: false, error: 'A vehicle with this ID already exists' }),
    });
    const onCreated = vi.fn();

    render(<AddVehicleModal onCreated={onCreated} />);
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /^add vehicle$/i, hidden: true }));

    expect(await screen.findByText(/a vehicle with this id already exists/i)).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/vehicle id/i)).toBeInTheDocument();
  });

  it('clears stored auth and redirects to /auth on a 401', async () => {
    localStorage.setItem('user', JSON.stringify({ email: 'a@b.com' }));
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Not authorized' }),
    });

    render(<AddVehicleModal onCreated={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /^add vehicle$/i, hidden: true }));

    await waitFor(() => expect(window.location.href).toBe('/auth'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('closes the form without calling fetch when Cancel is clicked', () => {
    render(<AddVehicleModal onCreated={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /add vehicle/i }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByLabelText(/vehicle id/i)).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
