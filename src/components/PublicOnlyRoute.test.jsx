import { describe, it, expect, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PublicOnlyRoute from './PublicOnlyRoute';

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<PublicOnlyRoute><div>landing page</div></PublicOnlyRoute>} />
        <Route path="/auth" element={<PublicOnlyRoute><div>auth page</div></PublicOnlyRoute>} />
        <Route path="/inventory" element={<div>inventory page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('PublicOnlyRoute', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('renders its child for a logged-out visitor', () => {
    renderAt('/');
    expect(screen.getByText('landing page')).toBeInTheDocument();
  });

  it('redirects a logged-in visitor from the landing page to /inventory', () => {
    localStorage.setItem('token', 'fake-token');
    renderAt('/');
    expect(screen.queryByText('landing page')).not.toBeInTheDocument();
    expect(screen.getByText('inventory page')).toBeInTheDocument();
  });

  it('redirects a logged-in visitor from the auth page to /inventory', () => {
    localStorage.setItem('token', 'fake-token');
    renderAt('/auth');
    expect(screen.queryByText('auth page')).not.toBeInTheDocument();
    expect(screen.getByText('inventory page')).toBeInTheDocument();
  });
});
