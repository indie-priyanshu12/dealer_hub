import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeleteVehicleButton from './DeleteVehicleButton';

describe('DeleteVehicleButton', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    global.fetch = vi.fn();
    vi.spyOn(window, 'confirm');
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('renders a "Delete" button', () => {
    render(<DeleteVehicleButton vehicleId="abc123" vehicleLabel="BMW M4 Competition" onDeleted={() => {}} />);

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('asks for confirmation naming the vehicle, and does not call fetch if the user cancels', () => {
    window.confirm.mockReturnValue(false);

    render(<DeleteVehicleButton vehicleId="abc123" vehicleLabel="BMW M4 Competition" onDeleted={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('BMW M4 Competition'));
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('calls the delete endpoint with the auth token and reports the id on success when confirmed', async () => {
    window.confirm.mockReturnValue(true);
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: {} }),
    });
    const onDeleted = vi.fn();

    render(<DeleteVehicleButton vehicleId="abc123" vehicleLabel="BMW M4 Competition" onDeleted={onDeleted} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(onDeleted).toHaveBeenCalledWith('abc123'));

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/vehicles/abc123',
      expect.objectContaining({
        method: 'DELETE',
        headers: expect.objectContaining({ Authorization: 'Bearer fake-token' }),
      })
    );
  });

  it('shows an inline error and does not call onDeleted when the server rejects the delete', async () => {
    window.confirm.mockReturnValue(true);
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ success: false, error: 'Vehicle not found' }),
    });
    const onDeleted = vi.fn();

    render(<DeleteVehicleButton vehicleId="abc123" vehicleLabel="BMW M4 Competition" onDeleted={onDeleted} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(await screen.findByText(/vehicle not found/i)).toBeInTheDocument();
    expect(onDeleted).not.toHaveBeenCalled();
  });

  it('clears stored auth and redirects to /auth on a 401', async () => {
    window.confirm.mockReturnValue(true);
    localStorage.setItem('user', JSON.stringify({ email: 'a@b.com' }));
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Not authorized' }),
    });

    render(<DeleteVehicleButton vehicleId="abc123" vehicleLabel="BMW M4 Competition" onDeleted={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => expect(window.location.href).toBe('/auth'));
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('stops the click from bubbling up to a parent handler (e.g. the card\'s own onClick)', async () => {
    window.confirm.mockReturnValue(true);
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: {} }),
    });
    const parentClick = vi.fn();

    render(
      <div onClick={parentClick}>
        <DeleteVehicleButton vehicleId="abc123" vehicleLabel="BMW M4 Competition" onDeleted={() => {}} />
      </div>
    );
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(parentClick).not.toHaveBeenCalled();
  });
});
