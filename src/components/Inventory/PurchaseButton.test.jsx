import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PurchaseButton from './PurchaseButton';

describe('PurchaseButton', () => {
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

  it('renders a disabled "Out of Stock" button when stock is 0', () => {
    render(<PurchaseButton vehicleId="abc123" stock={0} onPurchase={() => {}} />);

    expect(screen.getByRole('button', { name: /out of stock/i })).toBeDisabled();
  });

  it('renders an enabled "Purchase" button when stock is greater than 0', () => {
    render(<PurchaseButton vehicleId="abc123" stock={5} onPurchase={() => {}} />);

    expect(screen.getByRole('button', { name: /purchase/i })).toBeEnabled();
  });

  it('calls the purchase endpoint with the auth token and reports the updated vehicle on success', async () => {
    const updatedVehicle = { _id: 'abc123', stock: 4 };
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: updatedVehicle }),
    });
    const onPurchase = vi.fn();

    render(<PurchaseButton vehicleId="abc123" stock={5} onPurchase={onPurchase} />);
    fireEvent.click(screen.getByRole('button', { name: /purchase/i }));

    await waitFor(() => expect(onPurchase).toHaveBeenCalledWith(updatedVehicle));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/vehicles/abc123/purchase',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer fake-token' }),
      })
    );
  });

  it('shows an inline error and does not call onPurchase when the server rejects the purchase', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ success: false, error: 'Vehicle is out of stock' }),
    });
    const onPurchase = vi.fn();

    render(<PurchaseButton vehicleId="abc123" stock={5} onPurchase={onPurchase} />);
    fireEvent.click(screen.getByRole('button', { name: /purchase/i }));

    expect(await screen.findByText(/vehicle is out of stock/i)).toBeInTheDocument();
    expect(onPurchase).not.toHaveBeenCalled();
  });

  it('clears stored auth and redirects to /auth on a 401', async () => {
    localStorage.setItem('user', JSON.stringify({ email: 'a@b.com' }));
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Not authorized' }),
    });

    render(<PurchaseButton vehicleId="abc123" stock={5} onPurchase={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /purchase/i }));

    await waitFor(() => expect(window.location.href).toBe('/auth'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('stops the click from bubbling up to a parent handler (e.g. the card\'s own onClick)', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: { _id: 'abc123', stock: 4 } }),
    });
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <PurchaseButton vehicleId="abc123" stock={5} onPurchase={() => {}} />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /purchase/i }));

    expect(parentClick).not.toHaveBeenCalled();
  });
});
