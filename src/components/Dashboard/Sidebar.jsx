import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, GitCompare, Mail, LogOut } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 84;

// Only real destinations belong here — no placeholders for pages that don't exist yet
// (Overview/Search/Analytics/etc. from the original dashboard sketch are still deferred).
const NAV_ITEMS = [
  { label: 'Inventory', href: '/inventory', icon: LayoutGrid },
  { label: 'Compare', href: '/compare', icon: GitCompare },
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
  const { compareIds } = useCompare();
  const contactActive = isItemActive(location.pathname, '/contact');

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
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', padding: '0 8px', marginBottom: '24px', position: 'relative' }}
        >
          {/* Collapsed rail (<900px): the full wordmark can't fit in 84px, so fall
              back to the compact mark, matching how nav-item labels hide too. */}
          <img
            src="/favicon.svg"
            alt="DealerHub"
            className="dh-sidebar-logo-collapsed"
            style={{ width: '32px', height: '32px', flexShrink: 0, display: 'none' }}
          />
          {/* Same asset + height as the landing navbar's logo (Navbar.jsx), so it
              renders at an identical visual size. Absolutely positioned because the
              SVG has large transparent padding above/below the actual wordmark. */}
          <img
            src="/text-logo.svg"
            alt="DealerHub"
            className="dh-sidebar-logo-expanded"
            style={{
              height: '153.6px', // 1.2x the navbar's 128px — sized up on its own; the
              // reserved box below is untouched, so this doesn't move anything else.
              width: 'auto',
              maxWidth: 'none', // Tailwind's `img{max-width:100%}` preflight would
              // otherwise cap this at the Link's own width, squashing the aspect ratio.
              position: 'absolute',
              top: '50%',
              left: '-34px',
              transform: 'translateY(-50%)',
            }}
          />
          {/* text-logo.svg has large transparent padding above/below the actual
              wordmark (it's only ~24% of the asset's own height) — reserving the
              full 128px here would leave a big empty gap in the sidebar's layout,
              unlike the navbar where the overflow is invisible either way. This
              spacer reserves just enough for the visible mark; the image (still
              128px tall, so the mark itself renders at the same size as the
              navbar's) overflows the extra above/below without affecting layout. */}
          <div className="dh-sidebar-logo-expanded" style={{ height: '40px', width: '180px', visibility: 'hidden' }} />
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
            const active = isItemActive(location.pathname, href);
            const badgeCount = label === 'Compare' ? compareIds.length : 0;
            return (
              <Link key={href} to={href} aria-current={active ? 'page' : undefined} style={linkStyle(active)}>
                <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                  <Icon size={20} strokeWidth={2} />
                  {badgeCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#EF4444',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      borderRadius: '999px',
                      minWidth: '16px',
                      height: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      lineHeight: 1,
                    }}>
                      {badgeCount}
                    </span>
                  )}
                </span>
                <span className="dh-sidebar-label">{label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          to="/contact"
          aria-current={contactActive ? 'page' : undefined}
          style={{ ...linkStyle(contactActive), marginBottom: '4px' }}
        >
          <Mail size={20} strokeWidth={2} style={{ flexShrink: 0 }} />
          <span className="dh-sidebar-label">Contact Us</span>
        </Link>

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
          .dh-sidebar-logo-expanded { display: none !important; }
          .dh-sidebar-logo-collapsed { display: block !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
