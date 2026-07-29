import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('VehicleCard', () => {
  it('shows Purchase but not Delete/Restock for a non-admin viewer', () => {
    render(
      <VehicleCard vehicle={baseVehicle} viewMode="grid" isAdmin={false} onPurchase={noop} onDelete={noop} onRestock={noop} />
    );

    expect(screen.getByRole('button', { name: /purchase/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^delete$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^restock$/i })).not.toBeInTheDocument();
  });

  it('shows Delete/Restock but not Purchase for an admin viewer', () => {
    render(
      <VehicleCard vehicle={baseVehicle} viewMode="grid" isAdmin={true} onPurchase={noop} onDelete={noop} onRestock={noop} />
    );

    expect(screen.getByRole('button', { name: /^delete$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^restock$/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /purchase/i })).not.toBeInTheDocument();
  });
});
