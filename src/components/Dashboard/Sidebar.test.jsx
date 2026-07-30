import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CompareProvider } from '../../context/CompareContext';
import Sidebar from './Sidebar';

const renderAt = (path) =>
  render(
    <CompareProvider>
      <MemoryRouter initialEntries={[path]}>
        <Sidebar />
      </MemoryRouter>
    </CompareProvider>
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

  it('renders a Compare nav item with no count badge when nothing is selected', () => {
    renderAt('/inventory');

    expect(screen.getByRole('link', { name: /^compare$/i })).toBeInTheDocument();
    expect(screen.queryByText(/^[1-3]$/)).not.toBeInTheDocument();
  });

  it('shows the current compare count as a badge on the Compare nav item', () => {
    localStorage.setItem('compareVehicleIds', JSON.stringify(['a', 'b']));
    renderAt('/inventory');

    const compareLink = screen.getByRole('link', { name: /compare/i });
    expect(compareLink).toHaveTextContent('2');
  });

  it('renders a Contact Us link pointing to /contact, positioned right before Logout', () => {
    renderAt('/inventory');

    const contactLink = screen.getByRole('link', { name: /contact us/i });
    expect(contactLink).toHaveAttribute('href', '/contact');

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    // DOCUMENT_POSITION_FOLLOWING = 4: contactLink comes before logoutButton in source order.
    expect(contactLink.compareDocumentPosition(logoutButton) & 4).toBe(4);
  });
});
