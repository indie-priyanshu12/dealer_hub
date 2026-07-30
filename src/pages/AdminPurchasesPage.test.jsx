import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { CompareProvider } from '../context/CompareContext';
import AdminPurchasesPage from './AdminPurchasesPage';

const PURCHASES = [
  {
    _id: 'p1',
    userName: 'Priya Sharma',
    userEmail: 'priya@x.com',
    make: 'BMW',
    model: 'M4 Competition',
    vehicleId: 'CAR001',
    pricePaid: 8995000,
    currency: 'INR',
    createdAt: '2026-07-30T11:30:00.000Z',
  },
  {
    _id: 'p2',
    userName: 'Arjun Mehta',
    userEmail: 'arjun@x.com',
    make: 'Toyota',
    model: 'Camry Hybrid',
    vehicleId: 'CAR006',
    pricePaid: 3695000,
    currency: 'INR',
    createdAt: '2026-07-29T08:05:00.000Z',
  },
];

const renderPage = () =>
  render(
    <CompareProvider>
      <MemoryRouter initialEntries={['/admin/purchases']}>
        <Routes>
          <Route path="/admin/purchases" element={<AdminPurchasesPage />} />
          <Route path="/purchases" element={<div>OWN PURCHASES SENTINEL</div>} />
        </Routes>
      </MemoryRouter>
    </CompareProvider>
  );

const mockFetch = (data) =>
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ success: true, count: data.length, data }) })
  ));

afterEach(() => {
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe('AdminPurchasesPage', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Boss', email: 'boss@x.com', role: 'Admin' }));
  });

  it('lists every purchase with buyer name and email for an admin', async () => {
    mockFetch(PURCHASES);
    renderPage();

    expect(await screen.findByText('Priya Sharma')).toBeInTheDocument();
    expect(screen.getByText('priya@x.com')).toBeInTheDocument();
    expect(screen.getByText('Arjun Mehta')).toBeInTheDocument();
    expect(screen.getByText(/M4 Competition/)).toBeInTheDocument();
    expect(screen.getByText('₹36,95,000')).toBeInTheDocument();
  });

  it('redirects non-admin users to their own purchases page without fetching', async () => {
    localStorage.setItem('user', JSON.stringify({ name: 'Reg', email: 'reg@x.com', role: 'User' }));
    mockFetch(PURCHASES);
    renderPage();

    expect(await screen.findByText('OWN PURCHASES SENTINEL')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('shows an empty state when no customer has purchased yet', async () => {
    mockFetch([]);
    renderPage();

    expect(await screen.findByText(/no purchases have been made yet/i)).toBeInTheDocument();
  });
});
