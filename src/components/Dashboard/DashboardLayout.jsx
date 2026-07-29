import React from 'react';
import Sidebar, { SIDEBAR_WIDTH, SIDEBAR_WIDTH_COLLAPSED } from './Sidebar';

// Shared shell for every post-login page (Inventory today, Vehicle Details next) —
// built once so a second page doesn't have to re-derive this margin/breakpoint pairing.
const DashboardLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', backgroundColor: '#F8F8F6' }}>
    <Sidebar />
    <div className="dh-dashboard-content" style={{ marginLeft: `${SIDEBAR_WIDTH}px` }}>
      {children}
    </div>
    <style>{`
      @media (max-width: 900px) {
        .dh-dashboard-content { margin-left: ${SIDEBAR_WIDTH_COLLAPSED}px !important; }
      }
    `}</style>
  </div>
);

export default DashboardLayout;
