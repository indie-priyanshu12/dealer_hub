import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const Field = ({ label, name, type = 'text', placeholder, value, icon: Icon, isPassword, onChange }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div style={{ marginBottom: '20px', position: 'relative' }}>
      <div style={{
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
          
          {name === 'role' ? (
            <select
              name={name}
              value={value}
              onChange={onChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                color: '#1E293B', fontSize: '15px', fontWeight: '500', fontFamily: 'inherit',
                appearance: 'none', cursor: 'pointer', padding: 0, margin: 0
              }}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
          ) : (
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
          )}
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
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'User'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic client validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/api/users/login' : '/api/users/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, role: formData.role };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
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
          window.location.href = '/'; // Simple redirect for now
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F8F6',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 80%)',
      fontFamily: "'Manrope', 'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
    }}>
      
      {/* ── Background Noise Texture ── */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.2, zIndex: 0, pointerEvents: 'none',
        backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
      }} />

      {/* ── Hero Image Card (Animates between Left and Right) ── */}
      <div style={{
        position: 'absolute',
        top: '24px', bottom: '24px',
        width: 'calc(55% - 36px)',
        left: isLogin ? 'calc(45% + 12px)' : '24px',
        borderRadius: '32px',
        backgroundImage: 'url("/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: isLogin ? '30% center' : '70% center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.12)',
        transition: 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 2,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.5) 100%)',
        }} />
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
      </div>

      {/* ── Form Container (Animates between Right and Left) ── */}
      <div style={{
        position: 'absolute',
        top: 0, bottom: 0,
        width: '45%',
        left: isLogin ? '0%' : '55%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'left 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 1,
      }}>
        {/* Glass Card */}
        <div style={{
          width: '100%',
          maxWidth: '560px',
          padding: '0 48px',
        }}>
          
          <div style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            border: '1px solid rgba(255,255,255,0.45)',
            borderRadius: '32px',
            padding: '56px 64px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          }}>
            
            {/* Segmented Control Toggle */}
            <div style={{
              background: 'rgba(0,0,0,0.04)',
              borderRadius: '999px',
              padding: '6px',
              display: 'flex',
              position: 'relative',
              marginBottom: '48px',
            }}>
              <div style={{
                position: 'absolute',
                top: '6px', bottom: '6px',
                width: 'calc(50% - 6px)',
                left: isLogin ? '6px' : '50%',
                background: '#FFFFFF',
                borderRadius: '999px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }} />
              
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
                Register
              </button>
            </div>

            {/* Header */}
            <div style={{ marginBottom: '40px' }}>
              <h1 style={{
                fontSize: '40px', fontWeight: '800', color: '#1E293B',
                margin: '0 0 12px', letterSpacing: '-1px'
              }}>
                {isLogin ? 'Welcome Back.' : 'Create Account.'}
              </h1>
              <p style={{ color: '#64748B', fontSize: '16px', margin: 0, fontWeight: '500', lineHeight: 1.5 }}>
                {isLogin ? 'Enter your details to access your dashboard.' : 'Join the premium dealer network today.'}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '16px',
                padding: '16px', color: '#EF4444', fontSize: '14px', fontWeight: '600',
                marginBottom: '28px', animation: 'shake 0.4s ease-in-out'
              }}>
                <AlertCircle size={20} strokeWidth={2.5} />
                {error}
              </div>
            )}
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

                {!isLogin && (
                  <>
                    <Field label="Confirm Password" name="confirmPassword" isPassword placeholder="Re-enter password" value={formData.confirmPassword} icon={ShieldCheck} onChange={handleInputChange} />
                    <Field label="Account Role" name="role" type="select" value={formData.role} icon={User} onChange={handleInputChange} />
                  </>
                )}
              </div>

              {isLogin && !isLoading && !isSuccess && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '28px', marginTop: '-4px' }}>
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
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                style={{
                  width: '100%',
                  height: '58px',
                  marginTop: isLogin ? '0' : '28px',
                  background: isSuccess ? '#22C55E' : 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  border: 'none',
                  borderRadius: '999px',
                  color: '#fff',
                  fontSize: '16px', fontWeight: '700',
                  cursor: isLoading || isSuccess ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: isSuccess ? '0 12px 32px rgba(34, 197, 94, 0.25)' : '0 12px 32px rgba(37,99,235,0.25)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: 'scale(1)',
                }}
                onMouseEnter={e => {
                  if (!isLoading && !isSuccess) {
                    e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 18px 40px rgba(37,99,235,0.35)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isLoading && !isSuccess) {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(37,99,235,0.25)';
                  }
                }}
                onMouseDown={e => {
                  if (!isLoading && !isSuccess) e.currentTarget.style.transform = 'scale(0.98)';
                }}
                onMouseUp={e => {
                  if (!isLoading && !isSuccess) e.currentTarget.style.transform = 'scale(1.02) translateY(-2px)';
                }}
              >
                {isSuccess ? (
                  <><CheckCircle2 size={22} /> {isLogin ? 'Welcome Back!' : 'Account Created!'}</>
                ) : isLoading ? (
                  <><Loader2 size={22} className="spin" /> {isLogin ? 'Signing you in...' : 'Creating account...'}</>
                ) : (
                  <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={20} /></>
                )}
              </button>
              <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
              `}</style>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
