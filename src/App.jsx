import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './components/Auth';
import InventoryPage from './pages/InventoryPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import ComparePage from './pages/ComparePage';
import ContactPage from './pages/ContactPage';
import CustomScrollbar from './components/CustomScrollbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { CompareProvider } from './context/CompareContext';
import './App.css';

function App() {
  return (
    <Router>
      <CompareProvider>
        <div className="App">
          <CustomScrollbar />
          <Routes>
            <Route
              path="/"
              element={
                <PublicOnlyRoute>
                  <LandingPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/auth"
              element={
                <PublicOnlyRoute>
                  <Auth />
                </PublicOnlyRoute>
              }
            />
            {/* Not wrapped in ProtectedRoute: InventoryPage itself shows a limited,
                sign-in-gated teaser when logged out instead of bouncing to /auth. */}
            <Route path="/inventory" element={<InventoryPage />} />
            <Route
              path="/inventory/:id"
              element={
                <ProtectedRoute>
                  <VehicleDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compare"
              element={
                <ProtectedRoute>
                  <ComparePage />
                </ProtectedRoute>
              }
            />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </div>
      </CompareProvider>
    </Router>
  );
}

export default App;
