import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import VehicleCard from './VehicleCard';

const baseVehicle = {
  _id: 'abc123',
  make: 'BMW',
  model: 'M4',
  year: 2024,
  price: 8995000,
  currency: 'INR',
  category: 'Sports Coupe',
  fuelType: 'Petrol',
  stock: 5,
};

const noop = () => {};

const renderCard = (props) =>
  render(
    <MemoryRouter initialEntries={['/inventory']}>
      <Routes>
        <Route
          path="/inventory"
          element={
            <VehicleCard vehicle={baseVehicle} viewMode="grid" onPurchase={noop} onDelete={noop} onRestock={noop} {...props} />
          }
        />
        <Route path="/inventory/:id" element={<div>vehicle details page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('VehicleCard', () => {
  it('shows Purchase but not Delete/Restock for a non-admin viewer', () => {
    renderCard({ isAdmin: false });

    expect(screen.getByRole('button', { name: /purchase/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^restock$/i })).not.toBeInTheDocument();
  });

  it('shows Delete/Restock but not Purchase for an admin viewer', () => {
    renderCard({ isAdmin: true });

    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^restock$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /purchase/i })).not.toBeInTheDocument();
  });

  it('navigates to the vehicle details page when the card is clicked', () => {
    renderCard({ isAdmin: false });

    fireEvent.click(screen.getByRole('heading', { name: 'BMW M4' }));

    expect(screen.getByText('vehicle details page')).toBeInTheDocument();
  });

  it('navigates to the vehicle details page when "View Details" is clicked', () => {
    renderCard({ isAdmin: false });

    fireEvent.click(screen.getByRole('button', { name: /view details/i }));

    expect(screen.getByText('vehicle details page')).toBeInTheDocument();
  });
});
