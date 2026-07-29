import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, LogOut } from 'lucide-react';

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 84;

// Only real destinations belong here — no placeholders for pages that don't exist yet
// (Overview/Search/Analytics/etc. from the original dashboard sketch are still deferred).
const NAV_ITEMS = [
  { label: 'Inventory', href: '/inventory', icon: LayoutGrid },
];

const isItemActive = (pathname, href) => pathname === href || pathname.startsWith(`${href}/`);

const linkStyle = (active) => ({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  padding: '12px',
  borderRadius: '14px',
  textDecoration: 'none',
  fontFamily: "'Manrope', sans-serif",
  fontWeight: 600,
  fontSize: '14px',
  color: active ? '#fff' : '#3d4a6b',
  background: active ? '#1a2744' : 'transparent',
  transition: 'all 0.2s ease',
});

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <>
      <aside
        className="dh-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: `${SIDEBAR_WIDTH}px`,
          background: 'rgba(248, 248, 246, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRight: '1.5px solid rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 16px',
          zIndex: 100,
        }}
      >
        <Link
          to="/inventory"
          style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', padding: '0 8px', marginBottom: '40px' }}
        >
          <img src="/favicon.svg" alt="" style={{ width: '32px', height: '32px', flexShrink: 0 }} />
          <span className="dh-sidebar-label" style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '18px', color: '#1a2744' }}>
            DealerHub
          </span>
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isItemActive(location.pathname, href);
            return (
              <Link key={href} to={href} aria-current={active ? 'page' : undefined} style={linkStyle(active)}>
                <Icon size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
                <span className="dh-sidebar-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '14px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 600,
            fontSize: '14px',
            color: '#EF4444',
            textAlign: 'left',
          }}
        >
          <LogOut size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span className="dh-sidebar-label">Logout</span>
        </button>
      </aside>

      <style>{`
        @media (max-width: 900px) {
          .dh-sidebar { width: ${SIDEBAR_WIDTH_COLLAPSED}px !important; }
          .dh-sidebar-label { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
