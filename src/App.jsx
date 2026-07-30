import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './components/Auth';
import InventoryPage from './pages/InventoryPage';
import VehicleDetailsPage from './pages/VehicleDetailsPage';
import ComparePage from './pages/ComparePage';
import ContactPage from './pages/ContactPage';
import SpecialOffersPage from './pages/SpecialOffersPage';
import PurchasesPage from './pages/PurchasesPage';
import AdminPurchasesPage from './pages/AdminPurchasesPage';
import CustomScrollbar from './components/CustomScrollbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';
import { CompareProvider } from './context/CompareContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';

function App() {
  return (
    <Router>
      <ToastProvider>
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
              {/* Not wrapped in ProtectedRoute: ComparePage itself renders a public
                  two-car showcase (CompareTeaser) when logged out, mirroring /inventory. */}
              <Route path="/compare" element={<ComparePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/special-offers" element={<SpecialOffersPage />} />
              <Route
                path="/purchases"
                element={
                  <ProtectedRoute>
                    <PurchasesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/purchases"
                element={
                  <ProtectedRoute>
                    <AdminPurchasesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </CompareProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
