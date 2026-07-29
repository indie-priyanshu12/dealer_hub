import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Auth from './components/Auth';
import InventoryPage from './pages/InventoryPage';
import CustomScrollbar from './components/CustomScrollbar';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <CustomScrollbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/inventory" element={<InventoryPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
