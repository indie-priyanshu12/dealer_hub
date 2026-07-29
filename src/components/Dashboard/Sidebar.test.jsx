import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar />
    </MemoryRouter>
  );

describe('Sidebar', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('renders the Inventory nav item and marks it active on /inventory', () => {
    renderAt('/inventory');

    const inventoryLink = screen.getByRole('link', { name: /inventory/i });
    expect(inventoryLink).toBeInTheDocument();
    expect(inventoryLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark Inventory active on a route that merely starts with the same letters', () => {
    renderAt('/inventory-report');

    expect(screen.getByRole('link', { name: /inventory/i })).not.toHaveAttribute('aria-current');
  });

  it('clears stored auth and navigates home when Logout is clicked', () => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ email: 'a@b.com' }));
    renderAt('/inventory');

    fireEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
