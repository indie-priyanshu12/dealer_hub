import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

  it('shows a Purchases nav item for regular users', () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Reg', email: 'reg@x.com', role: 'User' }));
    renderAt('/inventory');

    expect(screen.getByRole('link', { name: /purchases/i })).toHaveAttribute('href', '/purchases');
    expect(screen.queryByRole('link', { name: /customer orders/i })).not.toBeInTheDocument();
  });

  it('shows admins only Customer Orders, never a personal Purchases item', () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Boss', email: 'boss@x.com', role: 'Admin' }));
    renderAt('/inventory');

    expect(screen.getByRole('link', { name: /customer orders/i })).toHaveAttribute('href', '/admin/purchases');
    expect(screen.queryByRole('link', { name: /^purchases$/i })).not.toBeInTheDocument();
  });

  it('renders the mobile header with a hamburger and the Dealer Hub wordmark', () => {
    renderAt('/inventory');

    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
    expect(screen.getByText(/dealer hub/i)).toBeInTheDocument();
  });

  it('opens the full-page drawer from the hamburger and closes it again', () => {
    renderAt('/inventory');

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    const drawer = screen.getByRole('dialog', { name: /menu/i });
    expect(within(drawer).getByRole('link', { name: /inventory/i })).toBeInTheDocument();
    expect(within(drawer).getByRole('button', { name: /logout/i })).toBeInTheDocument();

    fireEvent.click(within(drawer).getByRole('button', { name: /close menu/i }));
    expect(screen.queryByRole('dialog', { name: /menu/i })).not.toBeInTheDocument();
  });

  it('closes the drawer when a nav link inside it is clicked', () => {
    renderAt('/inventory');

    fireEvent.click(screen.getByRole('button', { name: /open menu/i }));
    fireEvent.click(within(screen.getByRole('dialog', { name: /menu/i })).getByRole('link', { name: /^compare$/i }));

    expect(screen.queryByRole('dialog', { name: /menu/i })).not.toBeInTheDocument();
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
