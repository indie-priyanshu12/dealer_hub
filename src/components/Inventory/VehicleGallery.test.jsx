import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VehicleGallery from './VehicleGallery';

const vehicleWith = (imageCount) => ({
  _id: 'veh1',
  make: 'BMW',
  model: 'M4 Competition',
  featured: false,
  image: '/api/vehicles/veh1/images/1',
  images: Array.from({ length: imageCount }, (_, i) => `/api/vehicles/veh1/images/${i + 1}`),
});

describe('VehicleGallery', () => {
  it('renders only the main image, with no thumbnail strip, when there is a single photo', () => {
    render(<VehicleGallery vehicle={vehicleWith(1)} />);

    expect(screen.getByAltText('BMW M4 Competition')).toBeInTheDocument();
    expect(screen.queryAllByRole('button', { name: /photo \d+ of/i })).toHaveLength(0);
  });

  it('shows two thumbnails plus a +N tile counting the remaining photos', () => {
    render(<VehicleGallery vehicle={vehicleWith(6)} />);

    // Main shows photo 1; strip shows photos 2 and 3; 6 - 3 = 3 more behind the +N tile.
    expect(screen.getByRole('button', { name: /photo 2 of 6/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /photo 3 of 6/i })).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('shows no +N tile when exactly three photos exist', () => {
    render(<VehicleGallery vehicle={vehicleWith(3)} />);

    expect(screen.getByRole('button', { name: /photo 2 of 3/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /photo 3 of 3/i })).toBeInTheDocument();
    expect(screen.queryByText(/^\+\d+$/)).not.toBeInTheDocument();
  });

  it('opens the lightbox at the clicked thumbnail', () => {
    render(<VehicleGallery vehicle={vehicleWith(6)} />);

    fireEvent.click(screen.getByRole('button', { name: /photo 2 of 6/i }));

    expect(screen.getByRole('dialog', { name: /photo gallery/i })).toBeInTheDocument();
    expect(screen.getByText('2 / 6')).toBeInTheDocument();
  });

  it('opens the lightbox at the first hidden photo when the +N tile is clicked', () => {
    render(<VehicleGallery vehicle={vehicleWith(6)} />);

    fireEvent.click(screen.getByRole('button', { name: /3 more photos/i }));

    expect(screen.getByText('4 / 6')).toBeInTheDocument();
  });

  it('slides right and left with wrap-around', () => {
    render(<VehicleGallery vehicle={vehicleWith(6)} />);
    fireEvent.click(screen.getByRole('button', { name: /photo 2 of 6/i }));

    fireEvent.click(screen.getByRole('button', { name: /next photo/i }));
    expect(screen.getByText('3 / 6')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /previous photo/i }));
    fireEvent.click(screen.getByRole('button', { name: /previous photo/i }));
    expect(screen.getByText('1 / 6')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /previous photo/i }));
    expect(screen.getByText('6 / 6')).toBeInTheDocument();
  });

  it('navigates with arrow keys and closes with Escape', () => {
    render(<VehicleGallery vehicle={vehicleWith(6)} />);
    fireEvent.click(screen.getByRole('button', { name: /photo 2 of 6/i }));

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('3 / 6')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('2 / 6')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('closes when the backdrop is clicked but not when the photo itself is clicked', () => {
    render(<VehicleGallery vehicle={vehicleWith(6)} />);
    fireEvent.click(screen.getByRole('button', { name: /photo 2 of 6/i }));

    fireEvent.click(screen.getByTestId('gallery-slide-image'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('dialog'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens the lightbox from the main image too', () => {
    render(<VehicleGallery vehicle={vehicleWith(6)} />);

    fireEvent.click(screen.getByRole('button', { name: /photo 1 of 6/i }));

    expect(screen.getByText('1 / 6')).toBeInTheDocument();
  });
});
