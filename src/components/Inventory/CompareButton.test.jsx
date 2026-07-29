import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CompareProvider, MAX_COMPARE } from '../../context/CompareContext';
import CompareButton from './CompareButton';

const renderButton = (vehicleId = 'abc123') =>
  render(
    <CompareProvider>
      <CompareButton vehicleId={vehicleId} />
    </CompareProvider>
  );

describe('CompareButton', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('renders "Compare (0/3)" when nothing is selected yet', () => {
    renderButton();

    expect(screen.getByRole('button', { name: /compare \(0\/3\)/i })).toBeInTheDocument();
  });

  it('adds this vehicle on click, updating the count and its own selected state', () => {
    renderButton('abc123');

    fireEvent.click(screen.getByRole('button', { name: /compare \(0\/3\)/i }));

    const button = screen.getByRole('button', { name: /compare \(1\/3\)/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('removes this vehicle on a second click', () => {
    renderButton('abc123');

    fireEvent.click(screen.getByRole('button', { name: /compare \(0\/3\)/i }));
    fireEvent.click(screen.getByRole('button', { name: /compare \(1\/3\)/i }));

    const button = screen.getByRole('button', { name: /compare \(0\/3\)/i });
    expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  it(`is disabled and shows (${MAX_COMPARE}/${MAX_COMPARE}) once ${MAX_COMPARE} other vehicles are already selected`, () => {
    localStorage.setItem('compareVehicleIds', JSON.stringify(['x', 'y', 'z']));
    renderButton('abc123');

    const button = screen.getByRole('button', { name: new RegExp(`compare \\(${MAX_COMPARE}/${MAX_COMPARE}\\)`, 'i') });
    expect(button).toBeDisabled();
  });

  it('still shows this vehicle as selected and enabled if it is one of the already-selected ones, even at the cap', () => {
    localStorage.setItem('compareVehicleIds', JSON.stringify(['abc123', 'y', 'z']));
    renderButton('abc123');

    const button = screen.getByRole('button', { name: new RegExp(`compare \\(${MAX_COMPARE}/${MAX_COMPARE}\\)`, 'i') });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });

  it('stops the click from bubbling up to a parent handler (e.g. the card\'s own onClick)', () => {
    const parentClick = vi.fn();

    render(
      <CompareProvider>
        <div onClick={parentClick}>
          <CompareButton vehicleId="abc123" />
        </div>
      </CompareProvider>
    );
    fireEvent.click(screen.getByRole('button'));

    expect(parentClick).not.toHaveBeenCalled();
  });
});
