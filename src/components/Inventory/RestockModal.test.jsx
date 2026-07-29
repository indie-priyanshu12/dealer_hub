import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RestockModal from './RestockModal';

describe('RestockModal', () => {
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

  it('renders a "Restock" trigger and keeps the modal closed until clicked', () => {
    render(<RestockModal vehicleId="abc123" vehicleLabel="BMW M4 Competition" currentStock={5} onRestocked={() => {}} />);

    expect(screen.getByRole('button', { name: /restock/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/quantity/i)).not.toBeInTheDocument();
  });

  it('opens the modal on click, showing current stock, and disables Confirm until a valid quantity is entered', () => {
    render(<RestockModal vehicleId="abc123" vehicleLabel="BMW M4 Competition" currentStock={5} onRestocked={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /restock/i }));

    expect(screen.getByText(/current stock/i)).toBeInTheDocument();
    expect(screen.getByText(/5/)).toBeInTheDocument();
    const quantityInput = screen.getByLabelText(/quantity/i);
    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(quantityInput, { target: { value: '0' } });
    expect(confirmButton).toBeDisabled();

    fireEvent.change(quantityInput, { target: { value: '10' } });
    expect(confirmButton).toBeEnabled();
  });

  it('calls the restock endpoint with the auth token and quantity, reports the updated vehicle, and closes on success', async () => {
    const updatedVehicle = { _id: 'abc123', stock: 15 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: updatedVehicle }),
    });
    const onRestocked = vi.fn();

    render(<RestockModal vehicleId="abc123" vehicleLabel="BMW M4 Competition" currentStock={5} onRestocked={onRestocked} />);
    fireEvent.click(screen.getByRole('button', { name: /restock/i }));
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => expect(onRestocked).toHaveBeenCalledWith(updatedVehicle));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/vehicles/abc123/restock',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer fake-token' }),
        body: JSON.stringify({ quantity: 10 }),
      })
    );
    expect(screen.queryByLabelText(/quantity/i)).not.toBeInTheDocument();
  });

  it('shows an inline error, does not call onRestocked, and keeps the modal open when the server rejects the restock', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ success: false, error: 'Quantity must be a positive integer' }),
    });
    const onRestocked = vi.fn();

    render(<RestockModal vehicleId="abc123" vehicleLabel="BMW M4 Competition" currentStock={5} onRestocked={onRestocked} />);
    fireEvent.click(screen.getByRole('button', { name: /restock/i }));
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    expect(await screen.findByText(/quantity must be a positive integer/i)).toBeInTheDocument();
    expect(onRestocked).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument();
  });

  it('clears stored auth and redirects to /auth on a 401', async () => {
    localStorage.setItem('user', JSON.stringify({ email: 'a@b.com' }));
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Not authorized' }),
    });

    render(<RestockModal vehicleId="abc123" vehicleLabel="BMW M4 Competition" currentStock={5} onRestocked={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /restock/i }));
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => expect(window.location.href).toBe('/auth'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('closes the modal without calling fetch when Cancel is clicked', () => {
    render(<RestockModal vehicleId="abc123" vehicleLabel="BMW M4 Competition" currentStock={5} onRestocked={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /restock/i }));
    fireEvent.change(screen.getByLabelText(/quantity/i), { target: { value: '10' } });
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(screen.queryByLabelText(/quantity/i)).not.toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('stops the trigger click from bubbling up to a parent handler (e.g. the card\'s own onClick)', () => {
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <RestockModal vehicleId="abc123" vehicleLabel="BMW M4 Competition" currentStock={5} onRestocked={() => {}} />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /restock/i }));

    expect(parentClick).not.toHaveBeenCalled();
  });
});
