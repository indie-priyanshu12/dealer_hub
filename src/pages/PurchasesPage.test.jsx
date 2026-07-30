import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CompareProvider } from '../context/CompareContext';
import PurchasesPage, { formatPurchaseDate } from './PurchasesPage';

const PURCHASES = [
  {
    _id: 'p1',
    make: 'BMW',
    model: 'M4 Competition',
    vehicleId: 'CAR001',
    category: 'Sports Coupe',
    pricePaid: 8995000,
    currency: 'INR',
    image: '/api/vehicles/v1/images/1',
    createdAt: '2026-07-30T11:30:00.000Z',
  },
  {
    _id: 'p2',
    make: 'Porsche',
    model: '911 Carrera',
    vehicleId: 'CAR005',
    category: 'Sports Coupe',
    pricePaid: 11895000,
    currency: 'INR',
    image: '/api/vehicles/v5/images/1',
    createdAt: '2026-07-29T08:05:00.000Z',
  },
];

const renderPage = () =>
  render(
    <CompareProvider>
      <MemoryRouter initialEntries={['/purchases']}>
        <Routes>
          <Route path="/purchases" element={<PurchasesPage />} />
          <Route path="/admin/purchases" element={<div>ADMIN ORDERS SENTINEL</div>} />
        </Routes>
      </MemoryRouter>
    </CompareProvider>
  );

const mockFetch = (data) =>
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, count: data.length, data }) })
  ));

beforeEach(() => {
  localStorage.setItem('token', 'fake-token');
  localStorage.setItem('user', JSON.stringify({ name: 'Priya', email: 'priya@x.com', role: 'User' }));
});

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('PurchasesPage', () => {
  it('fetches the caller-scoped history with the auth token', async () => {
    mockFetch(PURCHASES);
    renderPage();

    await screen.findByText(/M4 Competition/);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/purchases/mine'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer fake-token' }) })
    );
  });

  it('lists each purchase with vehicle, price paid, and date & time', async () => {
    mockFetch(PURCHASES);
    renderPage();

    expect(await screen.findByText(/M4 Competition/)).toBeInTheDocument();
    expect(screen.getByText(/911 Carrera/)).toBeInTheDocument();
    expect(screen.getByText('₹89,95,000')).toBeInTheDocument();
    expect(screen.getByText('₹1,18,95,000')).toBeInTheDocument();
    expect(screen.getByText(formatPurchaseDate(PURCHASES[0].createdAt))).toBeInTheDocument();
  });

  it('shows an inviting empty state when nothing has been bought yet', async () => {
    mockFetch([]);
    renderPage();

    expect(await screen.findByText(/no purchases yet/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse the inventory/i })).toHaveAttribute('href', '/inventory');
  });

  it('redirects admins to Customer Orders without fetching a personal history', async () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Boss', email: 'boss@x.com', role: 'Admin' }));
    mockFetch(PURCHASES);
    renderPage();

    expect(await screen.findByText('ADMIN ORDERS SENTINEL')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
