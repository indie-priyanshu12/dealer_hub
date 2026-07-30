import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, Info } from 'lucide-react';
import Navbar from '../components/Landing/Navbar';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import MagneticButton from '../components/MagneticButton';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    return null;
  }
};

const CONTACT_DETAILS = [
  { icon: MapPin, label: 'Address', value: '123 Premium Drive, Auto District, Bengaluru 560001' },
  { icon: Phone, label: 'Phone', value: '+91 80 1234 5678' },
  { icon: Mail, label: 'Email', value: 'hello@dealerhub.com' },
  { icon: Clock, label: 'Hours', value: 'Mon – Sat: 9:00 AM – 7:00 PM' },
];

const fieldStyle = {
  width: '100%',
  padding: '16px 20px',
  borderRadius: '16px',
  border: '1.5px solid rgba(0,0,0,0.08)',
  background: '#F8F8F6',
  color: '#1a2744',
  fontFamily: "'Manrope', sans-serif",
  fontSize: '15px',
  fontWeight: 500,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 700,
  color: '#1a2744',
  marginBottom: '8px',
};

const focusHandlers = {
  onFocus: (e) => { e.currentTarget.style.borderColor = '#2563EB'; },
  onBlur: (e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.08)'; },
};

// The form is intentionally not wired up yet — submitting shows an honest note
// instead of faking a success state, per ux-guide.md's "never let users wonder."
const ContactPage = () => {
  const [showNotice, setShowNotice] = useState(false);
  const [user] = useState(getStoredUser);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowNotice(true);
  };

  const content = (
    <>
      <main className="contact-main" style={{ paddingTop: '84px', paddingBottom: '40px', maxWidth: '1200px', margin: '0 auto', paddingLeft: '48px', paddingRight: '48px' }}>
        <div className="contact-heading" style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 28px' }}>
          <h1 style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '52px',
            fontWeight: 800,
            color: '#1a2744',
            letterSpacing: '-1px',
            margin: '0 0 16px',
          }}>
            Get in Touch
          </h1>
          <p style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: '18px',
            color: '#666',
            lineHeight: 1.6,
            margin: 0,
          }}>
            Have a question about a vehicle, financing, or anything else? We'd love to hear from you.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.3fr)', gap: '48px' }}>
          <div>
            <h2 style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: '28px',
              fontWeight: 800,
              color: '#1a2744',
              margin: '0 0 20px',
            }}>
              Visit Our Showroom
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {CONTACT_DETAILS.map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                    background: 'rgba(37,99,235,0.08)', color: '#2563EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '13px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                      {label}
                    </div>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '16px', fontWeight: 600, color: '#1a2744', lineHeight: 1.5 }}>
                      {value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-form-card" style={{
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.08)',
            padding: '28px',
          }}>
            <form onSubmit={handleSubmit}>
              <div className="contact-field-gap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input type="text" placeholder="Jane Doe" style={fieldStyle} {...focusHandlers} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" placeholder="+91 98765 43210" style={fieldStyle} {...focusHandlers} />
                </div>
              </div>

              <div className="contact-field-gap" style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Email Address</label>
                <input type="email" placeholder="you@example.com" style={fieldStyle} {...focusHandlers} />
              </div>

              <div className="contact-field-gap" style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>Message</label>
                <textarea
                  className="contact-message-textarea"
                  placeholder="Tell us what you're looking for..."
                  rows={4}
                  style={{ ...fieldStyle, resize: 'vertical', fontFamily: "'Manrope', sans-serif" }}
                  {...focusHandlers}
                />
              </div>

              <MagneticButton
                type="submit"
                style={{
                  width: '100%',
                  height: '56px',
                  border: 'none',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)',
                  color: '#fff',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 12px 32px rgba(37,99,235,0.25)',
                }}
              >
                Send Message <Send size={18} />
              </MagneticButton>

              {showNotice && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  marginTop: '20px', padding: '16px',
                  background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)',
                  borderRadius: '14px', color: '#2563EB', fontFamily: "'Manrope', sans-serif",
                }}>
                  <Info size={20} style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: 1.5 }}>
                    This form isn't connected yet — in the meantime, please reach out using the details alongside.
                  </span>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>

      {/* Tightens vertical rhythm on short viewports only, same approach as Auth.jsx —
          normal-height screens keep the spacing above untouched. */}
      <style>{`
        @media (max-height: 780px) {
          .contact-main { padding-top: 64px !important; padding-bottom: 24px !important; }
          .contact-heading { margin-bottom: 20px !important; }
          .contact-form-card { padding: 20px !important; }
          .contact-field-gap { margin-bottom: 10px !important; }
          .contact-message-textarea { height: 64px !important; }
        }
      `}</style>
    </>
  );

  // Logged in: same Sidebar shell as the rest of the dashboard (Inventory, Compare,
  // etc.) instead of the landing page's Navbar, so Contact doesn't feel like it
  // dropped the user back out to the public site.
  if (user) {
    return <DashboardLayout>{content}</DashboardLayout>;
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F8F6' }}>
      <Navbar />
      {content}
    </div>
  );
};

export default ContactPage;
