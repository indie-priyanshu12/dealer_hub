import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Auth from './Auth';

const renderAuth = (entry) =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <Auth />
    </MemoryRouter>
  );

describe('Auth mode selection', () => {
  it('starts on Login by default (no register-only fields)', () => {
    renderAuth('/auth');

    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByText('Full Name')).not.toBeInTheDocument();
    expect(screen.getByText(/login with your email/i)).toBeInTheDocument();
  });

  it('starts on Register when opened with ?mode=register (Join Free intent)', () => {
    renderAuth('/auth?mode=register');

    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText('Full Name')).toBeInTheDocument();
    expect(screen.getByText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByText(/be a user/i)).toBeInTheDocument();
  });

  it('still lets the user switch tabs manually after arriving in register mode', () => {
    renderAuth('/auth?mode=register');

    fireEvent.click(screen.getByRole('button', { name: /^login$/i }));

    // Assert on the submit CTA, not on the register-only fields disappearing:
    // their removal rides framer-motion's exit animation, which never completes
    // under jsdom's fake timing (the fields do collapse in a real browser).
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create account/i })).not.toBeInTheDocument();
  });
});
