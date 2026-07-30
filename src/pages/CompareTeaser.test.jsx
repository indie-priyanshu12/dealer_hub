import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CompareTeaser from './CompareTeaser';

const DEMO_CARS = [
  { id: 'CAR001', make: 'BMW', model: 'M4 Competition', year: 2024, price: 8995000, currency: 'INR', category: 'Sports Coupe', fuelType: 'Petrol', mileage: 8500, stock: 'In Stock', image: '/inventory_data/car_images/m4_competition/img (1).png' },
  { id: 'CAR002', make: 'Mercedes-Benz', model: 'C300', year: 2023, price: 4795000, currency: 'INR', category: 'Sedan', fuelType: 'Petrol', mileage: 12500, stock: 'Limited Stock', image: '/inventory_data/car_images/benz/img (1).jpeg' },
  { id: 'CAR005', make: 'Porsche', model: '911 Carrera', year: 2024, price: 11895000, currency: 'INR', category: 'Sports Coupe', fuelType: 'Petrol', mileage: 1800, stock: 'Limited Stock', image: '/inventory_data/car_images/911_carrera/img (1).jpeg' },
];

const renderTeaser = () =>
  render(
    <MemoryRouter initialEntries={['/compare']}>
      <Routes>
        <Route path="/compare" element={<CompareTeaser />} />
        <Route path="/auth" element={<div>AUTH PAGE SENTINEL</div>} />
      </Routes>
    </MemoryRouter>
  );

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(DEMO_CARS) })
  ));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('CompareTeaser (logged-out compare showcase)', () => {
  it('loads the public demo data, not the protected API', async () => {
    renderTeaser();

    await screen.findByText(/M4 Competition/);
    expect(global.fetch).toHaveBeenCalledWith('/inventory_data/car_data.json');
    expect(global.fetch).not.toHaveBeenCalledWith(expect.stringContaining('/api/'), expect.anything());
  });

  it('shows exactly two showcase cars side by side', async () => {
    renderTeaser();

    expect(await screen.findByText(/M4 Competition/)).toBeInTheDocument();
    expect(screen.getByText(/911 Carrera/)).toBeInTheDocument();
    // The third demo car is not part of the showcase pair.
    expect(screen.queryByText(/C300/)).not.toBeInTheDocument();
  });

  it('shows a comparison table with key spec rows for the pair', async () => {
    renderTeaser();
    await screen.findByText(/M4 Competition/);

    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Year')).toBeInTheDocument();
    expect(screen.getByText('Fuel Type')).toBeInTheDocument();
    expect(screen.getByText('Mileage')).toBeInTheDocument();
  });

  it('carries customer-satisfaction marketing copy', async () => {
    renderTeaser();
    await screen.findByText(/M4 Competition/);

    expect(screen.getByText(/compare wisely/i)).toBeInTheDocument();
    expect(screen.getByText(/4.9\/5/)).toBeInTheDocument();
  });

  it('sends visitors to the auth page from the sign-in CTA', async () => {
    renderTeaser();
    await screen.findByText(/M4 Competition/);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('AUTH PAGE SENTINEL')).toBeInTheDocument();
  });
});
