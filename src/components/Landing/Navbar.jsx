import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import MagneticButton from '../MagneticButton';

// The current page's nav link wears a blue glass capsule.
const isLinkActive = (pathname, href) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

// Lets the click's reward animation (scale pulse / arrow launch) play out before the
// route actually swaps, so navigating never feels like an instant, jarring cut.
const LAUNCH_DELAY = 260;

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Inventory', href: '/inventory' },
  { label: 'Compare', href: '/compare' },
  { label: 'Special Offers', href: '/special-offers' },
  { label: 'Contact', href: '/contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [launching, setLaunching] = useState(null); // null | 'login' | 'join' | 'mobile' | 'logout'
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
  }, []);

  const handleCTAClick = (key) => {
    setLaunching(key);
    setMenuOpen(false);
    setTimeout(() => navigate('/auth'), LAUNCH_DELAY);
  };

  const handleLogout = () => {
    setLaunching('logout');
    setMenuOpen(false);
    setTimeout(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      navigate('/');
    }, LAUNCH_DELAY);
  };

  return (
    <>
      <nav className="dh-nav" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: scrolled ? '0 48px' : '0 48px',
        height: scrolled ? '56px' : '64px',
        overflow: 'visible',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled
          ? 'rgba(248, 248, 246, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled
          ? '1.5px solid rgba(0,0,0,0.12)'
          : '1.5px solid rgba(0,0,0,0.08)',
        transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>

        {/* ── Logo ── */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', position: 'relative' }}>
          <img
            src="/text-logo.svg"
            alt="DealerHub"
            className="nav-logo-img"
            style={{
              height: '128px',
              width: 'auto',
              display: 'block',
              position: 'absolute',
              top: '50%',
              left: 0,
              transform: 'translateY(-50%)',
            }}
          />
          {/* Invisible spacer so other flex items respect logo width */}
          <div className="nav-logo-spacer" style={{ height: '128px', width: '220px', visibility: 'hidden' }} />
        </Link>

        {/* ── Nav Links (Desktop) ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }} className="nav-desktop">
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(location.pathname, link.href);
            return (
              <Link
                key={link.label}
                to={link.href}
                aria-current={active ? 'page' : undefined}
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: active ? 700 : 500,
                  fontSize: '14px',
                  color: active ? '#2563EB' : '#3d4a6b',
                  textDecoration: 'none',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  // Blue glass capsule on the selected page's link
                  background: active ? 'rgba(37,99,235,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(37,99,235,0.25)' : '1px solid transparent',
                  backdropFilter: active ? 'blur(10px)' : 'none',
                  WebkitBackdropFilter: active ? 'blur(10px)' : 'none',
                  boxShadow: active
                    ? 'inset 0 1px 0 rgba(255,255,255,0.55), 0 4px 14px rgba(37,99,235,0.18)'
                    : 'none',
                }}
                onMouseEnter={e => {
                  if (active) return;
                  e.currentTarget.style.background = 'rgba(26,39,68,0.07)';
                  e.currentTarget.style.color = '#1a2744';
                }}
                onMouseLeave={e => {
                  if (active) return;
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#3d4a6b';
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Hidden on mobile — the drawer carries Login/Join Free/Logout there,
              and the top bar hasn't room for them next to the logo. */}
          <div className="nav-cta-desktop" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isLoggedIn ? (
            <MagneticButton
              onClick={handleLogout}
              animate={{
                scale: launching === 'logout' ? [1, 1.06, 1] : 1,
                backgroundColor: launching === 'logout' ? '#EF4444' : 'rgba(26,39,68,0)',
                color: launching === 'logout' ? '#ffffff' : '#1a2744',
                borderColor: launching === 'logout' ? '#EF4444' : 'rgba(26,39,68,0.25)',
              }}
              whileHover={{ backgroundColor: '#EF4444', color: '#ffffff', borderColor: '#EF4444' }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                borderWidth: '1.5px',
                borderStyle: 'solid',
                borderRadius: '10px',
                padding: '8px 20px',
                cursor: 'pointer',
              }}
            >
              Logout
            </MagneticButton>
          ) : (
            <>
              <MagneticButton
                onClick={() => handleCTAClick('login')}
                animate={{
                  scale: launching === 'login' ? [1, 1.06, 1] : 1,
                  backgroundColor: launching === 'login' ? '#1a2744' : 'rgba(26,39,68,0)',
                  color: launching === 'login' ? '#ffffff' : '#1a2744',
                  borderColor: launching === 'login' ? '#1a2744' : 'rgba(26,39,68,0.25)',
                }}
                whileHover={{ backgroundColor: '#1a2744', color: '#ffffff', borderColor: '#1a2744' }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  fontSize: '14px',
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  borderRadius: '10px',
                  padding: '8px 20px',
                  cursor: 'pointer',
                }}
              >
                Login
              </MagneticButton>

              <MagneticButton
                onClick={() => handleCTAClick('join')}
                animate={{
                  scale: launching === 'join' ? [1, 1.06, 1] : 1,
                  boxShadow: launching === 'join'
                    ? '0 10px 28px rgba(26,39,68,0.45)'
                    : '0 4px 12px rgba(26,39,68,0.25)',
                }}
                whileHover={{ boxShadow: '0 6px 18px rgba(26,39,68,0.35)' }}
                transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#fff',
                  background: 'linear-gradient(135deg, #1a2744 0%, #2d4a8f 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '9px 22px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Join Free
                <motion.span
                  animate={{ x: launching === 'join' ? 14 : 0, opacity: launching === 'join' ? 0 : 1 }}
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                  style={{ display: 'inline-flex' }}
                >
                  <ArrowRight size={15} />
                </motion.span>
              </MagneticButton>
            </>
          )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="nav-hamburger"
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              color: '#1a2744',
            }}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu Drawer ── */}
      {menuOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99,
          background: 'rgba(248,248,246,0.97)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          animation: 'fadeIn 0.25s ease',
        }}>
          {NAV_LINKS.map((link) => {
            const active = isLinkActive(location.pathname, link.href);
            return (
              <Link
                key={link.label}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={active ? 'page' : undefined}
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: active ? 700 : 600,
                  fontSize: '22px',
                  color: active ? '#2563EB' : '#1a2744',
                  textDecoration: 'none',
                  padding: '8px 22px',
                  borderRadius: '999px',
                  background: active ? 'rgba(37,99,235,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(37,99,235,0.25)' : '1px solid transparent',
                }}
              >
                {link.label}
              </Link>
            );
          })}
          <div style={{ height: '1px', width: '60px', background: 'rgba(0,0,0,0.1)', margin: '8px 0' }} />
          {isLoggedIn ? (
            <MagneticButton
              onClick={handleLogout}
              animate={{ scale: launching === 'logout' ? [1, 1.06, 1] : 1 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: '18px',
                color: '#fff',
                background: '#EF4444',
                border: 'none',
                borderRadius: '14px',
                padding: '14px 40px',
                cursor: 'pointer',
              }}
            >
              Logout
            </MagneticButton>
          ) : (
            <MagneticButton
              onClick={() => handleCTAClick('mobile')}
              animate={{ scale: launching === 'mobile' ? [1, 1.06, 1] : 1 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 700,
                fontSize: '18px',
                color: '#fff',
                background: 'linear-gradient(135deg, #1a2744 0%, #2d4a8f 100%)',
                border: 'none',
                borderRadius: '14px',
                padding: '14px 40px',
                cursor: 'pointer',
              }}
            >
              Login / Join Free
            </MagneticButton>
          )}
        </div>
      )}

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          .nav-desktop { display: none !important; }
          .nav-hamburger { display: flex !important; }
          /* The 220px logo spacer + two CTAs cannot share a phone-width row with the
             hamburger — at 375px they pushed the hamburger fully offscreen. The drawer
             carries the CTAs on mobile; the top bar keeps only logo + hamburger. */
          .nav-cta-desktop { display: none !important; }
          .dh-nav { padding: 0 20px !important; }
          .nav-logo-img { height: 92px !important; }
          .nav-logo-spacer { width: 150px !important; height: 92px !important; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Navbar;
