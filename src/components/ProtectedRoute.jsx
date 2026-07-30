import React from 'react';
import { Navigate } from 'react-router-dom';

// Route guard: children render only with a stored auth token; visitors are sent
// to /auth. (The server independently enforces auth on every protected endpoint —
// this only shapes navigation.)
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;
