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
      /* Phones: the rail disappears entirely (Sidebar renders a fixed 60px header
         with a hamburger instead), so content takes the full width and starts below
         the header. One rule trims every dashboard page's main at once (stylesheet
         !important outranks the pages' inline padding). */
      @media (max-width: 768px) {
        .dh-dashboard-content { margin-left: 0 !important; padding-top: 60px; }
        .dh-dashboard-content main {
          padding-left: 16px !important;
          padding-right: 16px !important;
          padding-top: 28px !important;
        }
        .dh-details-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
      }
    `}</style>
  </div>
);

export default DashboardLayout;
