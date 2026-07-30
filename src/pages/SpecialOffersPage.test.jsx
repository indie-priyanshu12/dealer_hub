import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SpecialOffersPage, { OFFER_PERCENTS, discountedPrice } from './SpecialOffersPage';

const DEMO_CARS = [
  { id: 'CAR001', make: 'BMW', model: 'M4 Competition', year: 2024, price: 8995000, currency: 'INR', category: 'Sports Coupe', fuelType: 'Petrol', mileage: 8500, stock: 'In Stock', image: '/inventory_data/car_images/m4_competition/img (1).png' },
  { id: 'CAR006', make: 'Toyota', model: 'Camry Hybrid', year: 2023, price: 3695000, currency: 'INR', category: 'Hybrid Sedan', fuelType: 'Hybrid', mileage: 15600, stock: 'In Stock', image: '/inventory_data/car_images/camry_hybrid/img (1).jpeg' },
];

const formatINR = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/special-offers']}>
      <SpecialOffersPage />
    </MemoryRouter>
  );

beforeEach(() => {
  localStorage.clear();
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ json: () => Promise.resolve(DEMO_CARS) })
  ));
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('discountedPrice', () => {
  it('applies the percentage and rounds to a clean thousand', () => {
    expect(discountedPrice(8995000, 8)).toBe(8275000);
    expect(discountedPrice(3695000, 15)).toBe(3141000);
  });
});

describe('SpecialOffersPage', () => {
  it('shows each offer car with its old price crossed out and the new price', async () => {
    renderPage();

    await screen.findByText(/M4 Competition/);

    const oldPrice = screen.getByText(formatINR(8995000));
    expect(oldPrice.tagName).toBe('S'); // semantically struck-through
    expect(screen.getByText(formatINR(discountedPrice(8995000, OFFER_PERCENTS.CAR001)))).toBeInTheDocument();
  });

  it('labels every card with its discount percentage', async () => {
    renderPage();
    await screen.findByText(/M4 Competition/);

    expect(screen.getByText(`-${OFFER_PERCENTS.CAR001}%`)).toBeInTheDocument();
    expect(screen.getByText(`-${OFFER_PERCENTS.CAR006}%`)).toBeInTheDocument();
  });

  it('renders the spec strip per card (year, fuel, mileage)', async () => {
    renderPage();
    await screen.findByText(/M4 Competition/);

    expect(screen.getByText('8,500 km')).toBeInTheDocument();
    expect(screen.getByText('15,600 km')).toBeInTheDocument();
    expect(screen.getAllByText('Petrol').length).toBeGreaterThan(0);
  });

  it('wraps each card in the specular glow shell', async () => {
    const { container } = renderPage();
    await screen.findByText(/M4 Competition/);

    expect(container.querySelectorAll('.dh-offer-card').length).toBe(2);
  });
});
