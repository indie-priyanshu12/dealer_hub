import React from 'react';
import { Navigate } from 'react-router-dom';

// Inverse of ProtectedRoute — keeps logged-in users out of the pre-login
// pages (landing, auth) once they already have a session.
const PublicOnlyRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (token) {
    return <Navigate to="/inventory" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
