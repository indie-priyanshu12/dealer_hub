import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, GitCompare, ShoppingBag, ClipboardList, Mail, LogOut, Menu, X } from 'lucide-react';
import { useCompare } from '../../context/CompareContext';

export const SIDEBAR_WIDTH = 240;
export const SIDEBAR_WIDTH_COLLAPSED = 84;

// Only real destinations belong here — no placeholders for pages that don't exist yet
// (Overview/Search/Analytics/etc. from the original dashboard sketch are still deferred).
const NAV_ITEMS = [
  { label: 'Inventory', href: '/inventory', icon: LayoutGrid },
  { label: 'Compare', href: '/compare', icon: GitCompare },
];

// Role-specific tail: customers get their own purchase history; admins get the
// cross-customer ledger instead (an admin's job here is selling, not buying).
const USER_NAV_ITEMS = [
  { label: 'Purchases', href: '/purchases', icon: ShoppingBag },
];
const ADMIN_NAV_ITEMS = [
  { label: 'Customer Orders', href: '/admin/purchases', icon: ClipboardList },
];

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

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
  const isAdmin = getStoredUser()?.role === 'Admin';
  const navItems = [...NAV_ITEMS, ...(isAdmin ? ADMIN_NAV_ITEMS : USER_NAV_ITEMS)];
  // Phone layout: the rail is replaced by a fixed header whose hamburger opens a
  // full-page glass drawer. Conditional mount (no AnimatePresence — see the project's
  // history with stuck exit-unmounts); the slide-in is a mount-time keyframe.
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMobileOpen(false);
    navigate('/');
  };

  const renderBadge = (label) => {
    const badgeCount = label === 'Compare' ? compareIds.length : 0;
    if (badgeCount === 0) return null;
    return (
      <span style={{
        position: 'absolute', top: '-6px', right: '-6px',
        background: '#EF4444', color: '#fff', fontSize: '10px', fontWeight: 700,
        borderRadius: '999px', minWidth: '16px', height: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 3px', lineHeight: 1,
      }}>
        {badgeCount}
      </span>
    );
  };

  const wordmark = (
    <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 800, fontSize: '19px', color: '#1a2744', letterSpacing: '-0.5px' }}>
      Dealer Hub<span style={{ color: '#3B82F6' }}>.</span>
    </span>
  );

  return (
    <>
      {/* ── Mobile header: hamburger + brand, shown only below 768px ── */}
      {/* Mobile-first display (flex inline, hidden by the min-width rule below) so
          the header exists in the accessibility tree — display:none flipped on by a
          media query would hide it from assistive tech and tests alike in jsdom. */}
      <header
        className="dh-mobile-header"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '60px', zIndex: 100,
          display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px',
          background: 'rgba(248, 248, 246, 0.85)',
          backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1.5px solid rgba(0,0,0,0.08)',
        }}
      >
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#1a2744', padding: '6px', display: 'flex' }}
        >
          <Menu size={24} strokeWidth={2.2} />
        </button>
        <img src="/favicon.svg" alt="" style={{ width: '28px', height: '28px' }} />
        {wordmark}
      </header>

      {/* ── Full-page glass drawer (mobile) ── */}
      {mobileOpen && (
        <div
          role="dialog"
          aria-label="Menu"
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(248, 248, 246, 0.92)',
            backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
            display: 'flex', flexDirection: 'column', padding: '16px',
            animation: 'dh-drawer-in 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
            fontFamily: "'Manrope', sans-serif",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '4px 0 16px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <img src="/favicon.svg" alt="" style={{ width: '28px', height: '28px' }} />
            {wordmark}
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              style={{ marginLeft: 'auto', background: 'rgba(26,39,68,0.06)', border: 'none', cursor: 'pointer', color: '#1a2744', padding: '8px', borderRadius: '12px', display: 'flex' }}
            >
              <X size={22} strokeWidth={2.2} />
            </button>
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, marginTop: '20px' }}>
            {navItems.map(({ label, href, icon: Icon }) => {
              const active = isItemActive(location.pathname, href);
              return (
                <Link
                  key={href}
                  to={href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  style={{ ...linkStyle(active), fontSize: '16px', padding: '14px 16px' }}
                >
                  <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                    <Icon size={21} strokeWidth={2} />
                    {renderBadge(label)}
                  </span>
                  {label}
                </Link>
              );
            })}
          </nav>

          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            aria-current={contactActive ? 'page' : undefined}
            style={{ ...linkStyle(contactActive), fontSize: '16px', padding: '14px 16px', marginBottom: '4px' }}
          >
            <Mail size={21} strokeWidth={2} style={{ flexShrink: 0 }} />
            Contact Us
          </Link>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 16px', borderRadius: '14px', border: 'none',
              background: 'transparent', cursor: 'pointer',
              fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: '16px',
              color: '#EF4444', textAlign: 'left',
            }}
          >
            <LogOut size={21} strokeWidth={2} style={{ flexShrink: 0 }} />
            Logout
          </button>
        </div>
      )}

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
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = isItemActive(location.pathname, href);
            return (
              <Link key={href} to={href} aria-current={active ? 'page' : undefined} style={linkStyle(active)}>
                <span style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}>
                  <Icon size={20} strokeWidth={2} />
                  {renderBadge(label)}
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
        @keyframes dh-drawer-in {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: none; }
        }
        @media (max-width: 900px) {
          .dh-sidebar { width: ${SIDEBAR_WIDTH_COLLAPSED}px !important; }
          .dh-sidebar-label { display: none !important; }
          .dh-sidebar-logo-expanded { display: none !important; }
          .dh-sidebar-logo-collapsed { display: block !important; }
        }
        /* Phones: no rail at all — a fixed header with a hamburger replaces it,
           and the drawer above takes the full page when opened. */
        @media (max-width: 768px) {
          .dh-sidebar { display: none !important; }
        }
        @media (min-width: 769px) {
          .dh-mobile-header { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Sidebar;
