import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import VehicleCard from '../components/Inventory/VehicleCard';
import ViewToggle from '../components/Inventory/ViewToggle';
import SearchFilterBar from '../components/Inventory/SearchFilterBar';
import AddVehicleModal from '../components/Inventory/AddVehicleModal';
import { motion } from 'framer-motion';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const DEFAULT_FILTERS = { search: '', category: '', fuelType: '', minPrice: '', maxPrice: '', sort: '' };
const SEARCH_DEBOUNCE_MS = 400;

const InventoryPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [user] = useState(getStoredUser);
  const isAdmin = user?.role === 'Admin';
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [fuelTypeOptions, setFuelTypeOptions] = useState([]);
  const isFirstLoad = useRef(true);
  // Explicit actions (Apply / Reset) should feel instant; only live search-box
  // typing should wait out the debounce below.
  const skipDebounceRef = useRef(false);

  const hasActiveFilters = Object.keys(DEFAULT_FILTERS).some((key) => filters[key] !== DEFAULT_FILTERS[key]);

  const handleSearchChange = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const applyFilterPanel = (draft) => {
    skipDebounceRef.current = true;
    setFilters((prev) => ({ ...prev, ...draft }));
  };

  const applySortPanel = (sortValue) => {
    skipDebounceRef.current = true;
    setFilters((prev) => ({ ...prev, sort: sortValue }));
  };

  const clearFilters = () => {
    skipDebounceRef.current = true;
    setFilters(DEFAULT_FILTERS);
  };

  // Shared by purchase and restock — both just replace one vehicle's server state in place.
  const handleVehicleUpdated = (updatedVehicle) => {
    setVehicles((prev) => prev.map((v) => (v._id === updatedVehicle._id ? updatedVehicle : v)));
  };

  const handleVehicleDeleted = (deletedId) => {
    setVehicles((prev) => prev.filter((v) => v._id !== deletedId));
  };

  const handleVehicleCreated = (newVehicle) => {
    setVehicles((prev) => [newVehicle, ...prev]);
    setCategoryOptions((prev) => (newVehicle.category && !prev.includes(newVehicle.category) ? [...prev, newVehicle.category].sort() : prev));
    setFuelTypeOptions((prev) => (newVehicle.fuelType && !prev.includes(newVehicle.fuelType) ? [...prev, newVehicle.fuelType].sort() : prev));
  };

  useEffect(() => {
    const controller = new AbortController();
    const isInitial = isFirstLoad.current;
    const skipDebounce = skipDebounceRef.current;
    skipDebounceRef.current = false;

    const fetchVehicles = async () => {
      if (isInitial) {
        setLoading(true);
      } else {
        setSearching(true);
      }

      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.category) params.set('category', filters.category);
        if (filters.fuelType) params.set('fuelType', filters.fuelType);
        if (filters.minPrice) params.set('minPrice', filters.minPrice);
        if (filters.maxPrice) params.set('maxPrice', filters.maxPrice);
        if (filters.sort) {
          const [sortBy, order] = filters.sort.split('_');
          params.set('sortBy', sortBy);
          params.set('order', order);
        }

        const response = await fetch(`/api/vehicles/search?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth';
          return;
        }

        if (!response.ok) {
          throw new Error(`Server returned a ${response.status} status. The backend API might be down or missing this route.`);
        }

        // Sometimes non-JSON is returned (e.g., 404 HTML pages)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response. The backend server might need to be restarted to register the new routes.');
        }

        const data = await response.json();

        const finishLoading = () => {
          setLoading(false);
          setSearching(false);
          isFirstLoad.current = false;
        };

        const applyResult = () => {
          if (data.success) {
            setVehicles(data.data);
            setError(null);
            // Capture the full set of filter options once, from the unfiltered
            // first load — later (filtered) responses must not shrink these lists.
            if (isInitial) {
              setCategoryOptions([...new Set(data.data.map((v) => v.category).filter(Boolean))].sort());
              setFuelTypeOptions([...new Set(data.data.map((v) => v.fuelType).filter(Boolean))].sort());
            }
          } else {
            setError(data.error || 'Failed to fetch vehicles from the server.');
          }
          finishLoading();
        };

        if (isInitial) {
          // Gives the loading skeleton a moment to be visible on first paint;
          // subsequent searches apply immediately so filtering feels responsive.
          setTimeout(() => {
            if (!controller.signal.aborted) applyResult();
          }, 1500);
        } else {
          applyResult();
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Failed to fetch vehicles', err);
        setError(err.message || 'A network error occurred while connecting to the backend.');
        setLoading(false);
        setSearching(false);
        isFirstLoad.current = false;
      }
    };

    // First load and explicit Apply/Reset actions fire immediately; only live
    // search-box typing is debounced so it doesn't fire a request per keystroke.
    const timeoutId = setTimeout(fetchVehicles, (isInitial || skipDebounce) ? 0 : SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [filters]);

  const noVehiclesAtAll = !loading && !error && vehicles.length === 0 && !hasActiveFilters;
  const noSearchResults = !loading && !error && vehicles.length === 0 && hasActiveFilters;

  return (
    <DashboardLayout>
      <main style={{ paddingTop: '48px', paddingBottom: '100px', maxWidth: '1400px', margin: '0 auto', paddingLeft: '48px', paddingRight: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
          <div>
            <h1 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '48px',
              fontWeight: 800,
              color: '#1a2744',
              letterSpacing: '-1px',
              margin: '0 0 8px 0'
            }}>
              {user ? `Welcome back, ${user.email}` : 'Inventory'}
            </h1>
            <p style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '18px',
              color: '#666',
              margin: 0
            }}>
              {user ? "Here's your dealership dashboard — browse and manage the current inventory." : 'Explore our premium collection of exceptional vehicles.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isAdmin && <AddVehicleModal onCreated={handleVehicleCreated} />}
            <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
          </div>
        </div>

        {!loading && !error && (
          <SearchFilterBar
            searchValue={filters.search}
            onSearchChange={handleSearchChange}
            committedFilters={{
              category: filters.category,
              fuelType: filters.fuelType,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
            }}
            onApplyFilters={applyFilterPanel}
            committedSort={filters.sort}
            onApplySort={applySortPanel}
            onReset={clearFilters}
            hasActiveFilters={hasActiveFilters}
            categoryOptions={categoryOptions}
            fuelTypeOptions={fuelTypeOptions}
          />
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <img src="/loader.svg" alt="Loading..." style={{ width: '80px', height: '80px' }} />
          </div>
        ) : error ? (
          <div style={{
            background: 'rgba(218, 54, 51, 0.05)',
            border: '1px solid rgba(218, 54, 51, 0.2)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
            marginTop: '40px'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#da3633" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 style={{ fontFamily: "'Manrope', sans-serif", fontSize: '24px', fontWeight: 700, color: '#1a2744', margin: '0 0 12px 0' }}>
              Oops! Something went wrong.
            </h3>
            <p style={{ fontFamily: "'Manrope', sans-serif", fontSize: '16px', color: '#666', maxWidth: '600px', margin: '0 auto 24px auto', lineHeight: 1.6 }}>
              {error}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#1a2744',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        ) : noVehiclesAtAll ? (
          <div style={{ textAlign: 'center', marginTop: '80px', color: '#666', fontFamily: "'Manrope', sans-serif" }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1a2744', margin: '0 0 8px' }}>No vehicles available yet</h3>
            <p style={{ margin: 0 }}>No vehicles found in the database. Did you run the seed script?</p>
          </div>
        ) : noSearchResults ? (
          <div style={{ textAlign: 'center', marginTop: '80px', fontFamily: "'Manrope', sans-serif" }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1a2744', margin: '0 0 8px' }}>No vehicles matched your search</h3>
            <p style={{ fontSize: '16px', color: '#666', margin: '0 0 24px' }}>Try adjusting your filters or searching for a different model.</p>
            <button
              onClick={clearFilters}
              style={{
                background: '#1a2744', color: '#fff', border: 'none',
                padding: '12px 28px', borderRadius: '999px',
                fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: '15px', cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <motion.div
            layout
            animate={{ opacity: searching ? 0.5 : 1 }}
            transition={{ layout: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.2 } }}
            style={{
              display: 'grid',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(4, 1fr)' : '1fr',
              gap: '24px',
              pointerEvents: searching ? 'none' : 'auto',
            }}
          >
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle.vehicleId}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  opacity: { duration: 0.4, delay: index * 0.05 },
                  y: { duration: 0.4, delay: index * 0.05 },
                  layout: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                }}
              >
                <VehicleCard
                  vehicle={vehicle}
                  viewMode={viewMode}
                  isAdmin={isAdmin}
                  onPurchase={handleVehicleUpdated}
                  onDelete={handleVehicleDeleted}
                  onRestock={handleVehicleUpdated}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </DashboardLayout>
  );
};

export default InventoryPage;
