import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import MagneticButton from './MagneticButton';
import { API_BASE_URL } from '../config/api';

// auth-page.md: "Sliding Container ... Spring Animation: stiffness:170 damping:22.
// Movement must feel soft. No sudden acceleration."
const SLIDE_SPRING = { type: 'spring', stiffness: 170, damping: 22 };
const EASE = [0.4, 0, 0.2, 1];

const Field = ({ label, name, type = 'text', placeholder, value, icon: Icon, isPassword, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-field" style={{ marginBottom: '12px', position: 'relative' }}>
      <div className="auth-field-inner" style={{
        position: 'relative',
        background: 'rgba(255,255,255,0.85)',
        border: `1.5px solid ${isFocused ? '#2563EB' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: '18px',
        padding: '12px 18px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        transition: 'all 0.2s ease-out',
        boxShadow: isFocused ? '0 4px 16px rgba(37,99,235,0.1)' : '0 2px 6px rgba(0,0,0,0.02)',
      }}>
        <div style={{
          color: isFocused ? '#2563EB' : '#94A3B8',
          marginRight: '16px',
          display: 'flex',
          transition: 'color 0.2s ease',
          transform: isFocused ? 'scale(1.05)' : 'scale(1)',
        }}>
          <Icon size={22} strokeWidth={2} />
        </div>

        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <label style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: '600',
            color: isFocused ? '#2563EB' : '#64748B',
            marginBottom: '2px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.2s ease-out',
            transform: isFocused ? 'translateY(0)' : 'translateY(2px)',
          }}>
            {label}
          </label>

          <input
            name={name}
            type={isPassword && !showPassword ? 'password' : 'text'}
            value={value}
            onChange={onChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? placeholder : ''}
            style={{
              width: '100%', border: 'none', outline: 'none', background: 'transparent',
              color: '#1E293B', fontSize: '15px', fontWeight: '500', fontFamily: 'inherit',
              padding: 0, margin: 0
            }}
          />
        </div>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#94A3B8', padding: '4px', marginLeft: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
              transform: showPassword ? 'rotate(180deg)' : 'rotate(0)'
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#1E293B'}
            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </div>
  );
};

const Auth = () => {
  // "Join Free" CTAs land here with ?mode=register so they open on the Register
  // tab; plain "Login"/"Sign In" links carry no param and default to Login.
  const [searchParams] = useSearchParams();
  const wantsRegister = searchParams.get('mode') === 'register';
  const [isLogin, setIsLogin] = useState(!wantsRegister);

  // Also honor the param if it changes while this page is already mounted
  // (e.g. browser back/forward between /auth and /auth?mode=register).
  useEffect(() => {
    setIsLogin(!wantsRegister);
  }, [wantsRegister]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Cursor-reactive polish (soft glow + card tilt) is desktop-only and respects
  // prefers-reduced-motion, per auth-page.md's "Cursor Interactions: Desktop only"
  // and the accessibility section. Computed once — a mid-session pointer-type change
  // is an edge case not worth tracking reactively here.
  const enableMotionFX = useMemo(() => (
    typeof window !== 'undefined' &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ), []);

  // Motion values (not React state) for anything driven by continuous mousemove —
  // keeps this off React's render cycle entirely, same lesson learned from the
  // landing page's scroll-driven car animation.
  const glowX = useMotionValue(-1000);
  const glowY = useMotionValue(-1000);
  const springGlowX = useSpring(glowX, { stiffness: 50, damping: 20 });
  const springGlowY = useSpring(glowY, { stiffness: 50, damping: 20 });

  const cardRef = useRef(null);
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);
  const springTiltX = useSpring(tiltX, { stiffness: 200, damping: 20 });
  const springTiltY = useSpring(tiltY, { stiffness: 200, damping: 20 });

  const handlePageMouseMove = (e) => {
    if (!enableMotionFX) return;
    glowX.set(e.clientX);
    glowY.set(e.clientY);
  };

  const handleCardMouseMove = (e) => {
    if (!enableMotionFX || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(relX * 6); // clamps to ±3° per auth-page.md: "Cards: Very subtle tilt. Maximum 3°."
    tiltX.set(-relY * 6);
  };
  const handleCardMouseLeave = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic client validation
    if (!formData.email || !formData.password || (!isLogin && !formData.name)) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "We couldn't complete your request. Please try again.");
      }

      setIsSuccess(true);

      // Simulate slight delay before redirect to show success state
      setTimeout(() => {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          window.location.href = '/inventory';
        } else {
          setIsLogin(true);
          setIsSuccess(false);
          setFormData({ ...formData, password: '', confirmPassword: '' });
        }
        setIsLoading(false);
      }, 1500);

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };



  return (
    <div
      onMouseMove={handlePageMouseMove}
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8F8F6',
        backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 80%)',
        fontFamily: "'Manrope', 'Inter', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>

      {/* ── Background Noise Texture ── */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.2, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
      }} />

      {/* ── Decorative blobs (auth-page.md: "Allowed: Soft blobs, Gradient mesh, Blurred circles") ── */}
      <div style={{
        position: 'absolute', top: '-12%', left: '-8%', width: '440px', height: '440px',
        borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0) 70%)',
        filter: 'blur(60px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-16%', right: '-10%', width: '540px', height: '540px',
        borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, rgba(59,130,246,0) 70%)',
        filter: 'blur(70px)',
      }} />

      {/* ── Cursor-follow soft glow (desktop only) ── */}
      {enableMotionFX && (
        <motion.div
          aria-hidden="true"
          style={{
            position: 'fixed', top: 0, left: 0,
            width: '560px', height: '560px',
            marginLeft: '-280px', marginTop: '-280px',
            borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
            background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0) 70%)',
            x: springGlowX, y: springGlowY,
          }}
        />
      )}

      <div className="auth-shell" style={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        padding: '24px',
        gap: '24px',
        position: 'relative',
      }}>

        {/* ── Mobile-only brand header: replaces the hero image panel on phones.
            Mobile-first display + min-width hide, so it stays in the a11y tree.
            The wordmark sits centered inside text-logo.svg's large transparent
            canvas, so a short wrapper + oversized absolutely-centered image shows
            just the mark without the asset's padding forcing a tall header. ── */}
        <div className="auth-mobile-logo" style={{ display: 'flex', justifyContent: 'center', height: '52px', position: 'relative', flexShrink: 0, overflow: 'visible' }}>
          <img
            src="/text-logo.svg"
            alt="DealerHub"
            style={{
              height: '170px', width: 'auto', maxWidth: 'none',
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* ── Hero Image Panel (swaps side via flex `order` + layout FLIP) ── */}
        <motion.div
          layout
          transition={SLIDE_SPRING}
          className="auth-hero"
          style={{
            order: isLogin ? 2 : 1,
            flex: '1 1 55%',
            position: 'relative',
            borderRadius: '32px',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.12)',
            zIndex: 2,
          }}
        >
          <motion.div
            animate={{
              scale: isLogin ? 1 : 1.05,
              backgroundPosition: isLogin ? '30% center' : '70% center',
            }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url("/background.png")',
              backgroundSize: 'cover',
            }}
          />
          <motion.div
            animate={{ opacity: isLogin ? 1 : 0.85 }}
            transition={{ duration: 0.6, ease: EASE }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
            }}
          />
          <div style={{
            position: 'absolute', bottom: '48px', left: '48px',
            color: '#fff',
          }}>
            <h2 style={{ fontSize: '36px', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              Dealer Hub<span style={{ color: '#3B82F6' }}>.</span>
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: '500' }}>
              The premium standard for automotive retail.
            </p>
          </div>
        </motion.div>

        {/* ── Form Panel ── */}
        <motion.div
          layout
          transition={SLIDE_SPRING}
          className="auth-form-container"
          style={{
            order: isLogin ? 1 : 2,
            flex: '1 1 45%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="auth-card-wrap"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '0 48px',
            }}
          >

            {/* Glass Card */}
            <motion.div
              ref={cardRef}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="auth-card"
              style={{
                background: 'rgba(255,255,255,0.55)',
                backdropFilter: 'blur(18px)',
                WebkitBackdropFilter: 'blur(18px)',
                border: '1px solid rgba(255,255,255,0.45)',
                borderRadius: '32px',
                padding: '48px 64px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
                transformPerspective: 800,
                rotateX: springTiltX,
                rotateY: springTiltY,
              }}>

              {/* Segmented Control Toggle */}
              <div className="auth-segmented" style={{
                background: 'rgba(0,0,0,0.04)',
                borderRadius: '999px',
                padding: '6px',
                display: 'flex',
                position: 'relative',
                marginBottom: '34px',
              }}>
                <button
                  type="button"
                  onClick={() => { setIsLogin(true); setError(''); }}
                  style={{
                    flex: 1, position: 'relative', zIndex: 1,
                    padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer',
                    color: isLogin ? '#1E293B' : '#64748B',
                    fontSize: '15px', fontWeight: '700', fontFamily: 'inherit',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {isLogin && (
                    <motion.div
                      layoutId="auth-active-pill"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      style={{
                        position: 'absolute', inset: 0,
                        background: '#FFFFFF', borderRadius: '999px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: -1,
                      }}
                    />
                  )}
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => { setIsLogin(false); setError(''); }}
                  style={{
                    flex: 1, position: 'relative', zIndex: 1,
                    padding: '12px', background: 'transparent', border: 'none', cursor: 'pointer',
                    color: !isLogin ? '#1E293B' : '#64748B',
                    fontSize: '15px', fontWeight: '700', fontFamily: 'inherit',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {!isLogin && (
                    <motion.div
                      layoutId="auth-active-pill"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      style={{
                        position: 'absolute', inset: 0,
                        background: '#FFFFFF', borderRadius: '999px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)', zIndex: -1,
                      }}
                    />
                  )}
                  Register
                </button>
              </div>

              {/* Header — crossfades (not sequential exit-then-enter) so it settles in
                  the same ~0.25s window as the pill/fields/button instead of lagging
                  behind them. auth-page.md: "Nothing should instantly appear," but
                  nothing should lag behind everything else either. */}
              <div className="auth-heading-wrap" style={{ marginBottom: '24px' }}>
                <AnimatePresence>
                  <motion.div
                    key={isLogin ? 'login-heading' : 'register-heading'}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: EASE }}
                  >
                    <h1 style={{
                      fontSize: '40px', fontWeight: '800', color: '#1E293B',
                      margin: '0 0 12px', letterSpacing: '-1px'
                    }}>
                      {isLogin ? 'Welcome Back.' : 'Create Account.'}
                    </h1>
                    <p style={{ color: '#64748B', fontSize: '16px', margin: 0, fontWeight: '500', lineHeight: 1.5 }}>
                      {isLogin ? 'Enter your details to access your dashboard.' : 'Join the premium dealer network today.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '16px',
                      padding: '16px', color: '#EF4444', fontSize: '14px', fontWeight: '600',
                      animation: 'shake 0.4s ease-in-out'
                    }}>
                      <AlertCircle size={20} strokeWidth={2.5} />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <style>{`
                @keyframes shake {
                  0%, 100% { transform: translateX(0); }
                  25% { transform: translateX(-4px); }
                  75% { transform: translateX(4px); }
                }
              `}</style>

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
                <div style={{ opacity: isLoading || isSuccess ? 0.6 : 1, pointerEvents: isLoading || isSuccess ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
                  <Field label="Email Address" name="email" type="email" placeholder="you@example.com" value={formData.email} icon={Mail} onChange={handleInputChange} />
                  <Field label="Password" name="password" isPassword placeholder="Min. 8 characters" value={formData.password} icon={Lock} onChange={handleInputChange} />

                  <AnimatePresence initial={false}>
                    {!isLogin && (
                      <motion.div
                        key="extra-fields"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        style={{ overflow: 'hidden' }}
                      >
                        <Field label="Full Name" name="name" placeholder="John Doe" value={formData.name} icon={User} onChange={handleInputChange} />
                        <Field label="Confirm Password" name="confirmPassword" isPassword placeholder="Re-enter password" value={formData.confirmPassword} icon={ShieldCheck} onChange={handleInputChange} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {isLogin && !isLoading && !isSuccess && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', marginTop: '-4px' }}>
                    <button type="button" style={{
                      background: 'none', border: 'none', color: '#64748B', fontSize: '14px', fontWeight: '600', cursor: 'pointer', padding: 0,
                      position: 'relative', display: 'inline-block'
                    }} onMouseEnter={e => {
                        e.currentTarget.style.color = '#2563EB';
                        e.currentTarget.querySelector('div').style.width = '100%';
                      }} onMouseLeave={e => {
                        e.currentTarget.style.color = '#64748B';
                        e.currentTarget.querySelector('div').style.width = '0';
                      }}>
                      Forgot Password?
                      <div style={{ position: 'absolute', bottom: -2, left: 0, height: '1.5px', background: '#2563EB', width: 0, transition: 'width 0.2s ease' }} />
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <MagneticButton
                  type="submit"
                  disabled={isLoading || isSuccess}
                  whileHover={isLoading || isSuccess ? undefined : { scale: 1.02, boxShadow: '0 18px 40px rgba(37,99,235,0.35)' }}
                  transition={{ duration: 0.25, ease: EASE }}
                  style={{
                    width: '100%',
                    height: '58px',
                    marginTop: isLogin ? '0' : '20px',
                    background: isSuccess ? '#22C55E' : 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                    border: 'none',
                    borderRadius: '999px',
                    color: '#fff',
                    fontSize: '16px', fontWeight: '700',
                    cursor: isLoading || isSuccess ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: isSuccess ? '0 12px 32px rgba(34, 197, 94, 0.25)' : '0 12px 32px rgba(37,99,235,0.25)',
                  }}
                >
                  {isSuccess ? (
                    <><CheckCircle2 size={22} /> {isLogin ? 'Welcome Back!' : 'Account Created!'}</>
                  ) : isLoading ? (
                    <><Loader2 size={22} className="spin" /> {isLogin ? 'Signing you in...' : 'Creating account...'}</>
                  ) : (
                    <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} /></>
                  )}
                </MagneticButton>
                <style>{`
                  .spin { animation: spin 1s linear infinite; }
                  @keyframes spin { 100% { transform: rotate(360deg); } }
                `}</style>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-shell { flex-direction: column !important; padding: 24px !important; gap: 16px !important; }
          /* No hero image on phones — the text-logo header above stands in for it. */
          .auth-hero { display: none !important; }
          .auth-form-container { flex: 1 1 auto !important; }
          .auth-card-wrap { padding: 0 !important; max-width: 100% !important; }
          .auth-card { padding: 32px 24px !important; }
        }
        @media (min-width: 901px) {
          .auth-mobile-logo { display: none !important; }
        }
        /* Tightens vertical rhythm on short viewports only — normal-height screens
           keep the spacing above untouched. Keeps Register from ever forcing a
           page scrollbar without visibly compressing the common case. */
        @media (max-height: 750px) {
          .auth-card { padding: 32px 64px !important; }
          .auth-segmented { margin-bottom: 22px !important; }
          .auth-heading-wrap { margin-bottom: 16px !important; }
          .auth-field { margin-bottom: 8px !important; }
          .auth-field-inner { height: 52px !important; }
        }
        @media (max-width: 900px) and (max-height: 750px) {
          .auth-card { padding: 28px 24px !important; }
        }
      `}</style>
    </div>
  );
};

export default Auth;
