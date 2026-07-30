import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Settings, Clock, Star, ArrowRight, CheckCircle2, Users, Car, Award } from 'lucide-react';
import MagneticButton from '../MagneticButton';
import GradientText from '../GradientText';

const EASE = [0.4, 0, 0.2, 1];
const NAVY = '#1a2744';
const SLATE = '#64748B';
const BLUE = '#2563EB';
const AMBER = '#F59E0B';

// Sample social proof — display copy only, not wired to any real data source.
const STATS = [
  { icon: Users, value: '12,000+', label: 'Drivers served' },
  { icon: Star, value: '4.9/5', label: 'Average rating' },
  { icon: Car, value: '500+', label: 'Cars delivered' },
  { icon: Award, value: '20+', label: 'Premium marques' },
];

const REVIEWS = [
  {
    quote: 'The 150-point inspection report was right there on the listing. No surprises at delivery — the car was exactly as described.',
    name: 'Arjun Mehta',
    vehicle: 'BMW M4 Competition',
  },
  {
    quote: 'Compared three SUVs side-by-side and knew exactly what I was paying for. Easiest big purchase I have ever made.',
    name: 'Sneha Iyer',
    vehicle: 'Lexus RX 500h',
  },
  {
    quote: 'From test drive to keys in hand in four days — and the white-glove delivery actually lived up to the name.',
    name: 'Rohan Kapoor',
    vehicle: 'Tesla Model 3 Performance',
  },
];

const TRUST_CARDS = [
  { icon: Shield, title: 'Certified 150-Point Inspection', desc: 'Every car is inspected, documented, and verified before it ever reaches the showroom.' },
  { icon: CheckCircle2, title: 'Transparent Pricing', desc: 'The price on the listing is the price you pay. No hidden fees, no last-minute add-ons.' },
  { icon: Settings, title: 'Extended Warranty', desc: 'Drive out covered. Extended warranty options on every vehicle in the collection.' },
  { icon: Clock, title: 'White-Glove Delivery', desc: 'Doorstep delivery, paperwork handled, on your schedule — usually within days.' },
];

const BRANDS = ['Porsche', 'Tesla', 'BMW', 'Mercedes-Benz', 'Jaguar', 'Land Rover', 'Audi', 'Lexus', 'Ford', 'Kia'];

const STEPS = [
  { title: 'Discover', desc: 'Browse the certified collection' },
  { title: 'Compare', desc: 'Specs and prices, side-by-side' },
  { title: 'Test Drive', desc: 'Book a slot that suits you' },
  { title: 'Purchase', desc: 'Transparent checkout, fast delivery' },
];

const Stars = ({ size = 15 }) => (
  <span style={{ display: 'inline-flex', gap: '2px' }} aria-label="5 out of 5 stars">
    {[...Array(5)].map((_, i) => (
      <Star key={i} size={size} fill={AMBER} color={AMBER} strokeWidth={1} />
    ))}
  </span>
);

const ScrollOverlay = ({ showScrollHint }) => {
  const navigate = useNavigate();

  return (
    // In normal flow (not absolute) on purpose: the scenes' combined height is what
    // gives the document its scroll length now that LandingPage no longer hardcodes it.
    <div style={{ width: '100%', fontFamily: "'Manrope', sans-serif" }}>

      {/* ── Scene 1: Hero — value prop, CTA, and trust markers all above the fold ── */}
      <section className="dh-scene dh-scene-hero">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ maxWidth: '640px' }}
        >

          <h1 className="dh-hero-h1" style={{ fontWeight: 800, color: NAVY, lineHeight: 1.06, letterSpacing: '-2px', margin: '0 0 20px' }}>
            The confident way to buy your next car.
          </h1>

          <p className="dh-hero-sub" style={{ color: SLATE, fontWeight: 500, margin: '0 0 32px', maxWidth: '480px', lineHeight: 1.65 }}>
            Twenty certified icons — from Porsche to Tesla — with transparent pricing,
            side-by-side comparison, and a 150-point inspection behind every key.
          </p>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '28px' }}>
            <MagneticButton
              onClick={() => navigate('/inventory')}
              whileHover={{ scale: 1.03, boxShadow: '0 24px 48px rgba(26,39,68,0.3)' }}
              transition={{ duration: 0.25, ease: EASE }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                padding: '17px 36px', background: `linear-gradient(135deg, ${NAVY} 0%, #2d4a8f 100%)`,
                color: '#fff', border: 'none', borderRadius: '999px',
                fontSize: '16px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                boxShadow: '0 20px 40px rgba(26,39,68,0.22)',
              }}
            >
              Browse Inventory <ArrowRight size={19} />
            </MagneticButton>

            <MagneticButton
              onClick={() => navigate('/auth?mode=register')}
              whileHover={{ backgroundColor: 'rgba(26,39,68,0.06)' }}
              transition={{ duration: 0.25, ease: EASE }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '16px 32px', background: 'rgba(255,255,255,0.7)',
                color: NAVY, border: '1.5px solid rgba(26,39,68,0.25)', borderRadius: '999px',
                fontSize: '16px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              }}
            >
              Join Free
            </MagneticButton>
          </div>

          {/* Trust strip — credibility visible without scrolling */}
          <div className="dh-trust-strip" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 700, color: NAVY }}>
              <Stars /> 4.9/5 <span style={{ color: SLATE, fontWeight: 600 }}>· 2,300+ reviews</span>
            </span>
            <span className="dh-trust-divider" style={{ width: '1px', height: '18px', background: 'rgba(0,0,0,0.12)' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: SLATE }}>
              <strong style={{ color: NAVY, fontWeight: 800 }}>12,000+</strong> drivers served
            </span>
            <span className="dh-trust-divider" style={{ width: '1px', height: '18px', background: 'rgba(0,0,0,0.12)' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: SLATE }}>
              <strong style={{ color: NAVY, fontWeight: 800 }}>150-point</strong> certified inspection
            </span>
          </div>
        </motion.div>

        <div style={{
          position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
          opacity: showScrollHint ? 1 : 0, transition: 'opacity 0.3s', pointerEvents: 'none',
        }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, color: SLATE }}>Scroll to Explore</span>
          <div style={{ width: '1px', height: '40px', background: `linear-gradient(to bottom, ${SLATE}, transparent)` }} />
        </div>
      </section>

      {/* ── Scene 2: Trust & credibility — why drivers choose us ── */}
      <section className="dh-scene dh-scene-right">
        <div className="dh-trust-block" style={{ maxWidth: '620px', width: '100%' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="dh-h2"
            style={{ fontWeight: 800, color: NAVY, letterSpacing: '-1px', margin: '0 0 12px' }}
          >
            Built on trust, not sales talk.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            style={{ fontSize: '17px', color: SLATE, lineHeight: 1.6, margin: '0 0 36px', maxWidth: '480px' }}
          >
            Every step — from listing to handover — is built so you never have to take our word for it.
          </motion.p>

          <div className="dh-trust-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '18px' }}>
            {TRUST_CARDS.map((card, i) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                style={{
                  background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255,255,255,0.6)', borderRadius: '20px',
                  padding: '22px', boxShadow: '0 12px 32px rgba(0,0,0,0.05)',
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px', background: BLUE, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px',
                }}>
                  <card.icon size={22} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: NAVY, margin: '0 0 6px' }}>{card.title}</h3>
                <p style={{ fontSize: '14px', color: SLATE, margin: 0, lineHeight: 1.55 }}>{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scene 3: The collection ── */}
      <section className="dh-scene dh-scene-left">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ maxWidth: '520px' }}
        >
          <h2 className="dh-h2" style={{ fontWeight: 800, color: NAVY, letterSpacing: '-1px', lineHeight: 1.1, margin: '0 0 18px' }}>
            One garage. Twenty icons.
          </h2>
          <p style={{ fontSize: '17px', color: SLATE, lineHeight: 1.65, margin: '0 0 28px' }}>
            A hand-picked collection spanning electric pioneers, luxury SUVs, and genuine
            sports-car royalty — every one photographed, specified, and priced in the open.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {BRANDS.map((brand) => (
              <span key={brand} style={{
                padding: '8px 16px', background: 'rgba(255,255,255,0.8)',
                border: '1px solid rgba(0,0,0,0.06)', borderRadius: '999px',
                fontSize: '13px', fontWeight: 700, color: NAVY,
              }}>
                {brand}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ── Scene 4: Social proof — stats + reviews ── */}
      <section className="dh-scene dh-scene-center" style={{ flexDirection: 'column', justifyContent: 'center' }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="dh-h2"
          style={{ fontWeight: 800, color: NAVY, letterSpacing: '-1px', textAlign: 'center', margin: '0 0 36px' }}
        >
          Loved by drivers across India.
        </motion.h2>

        <div className="dh-stats-row" style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap', marginBottom: '44px' }}>
          {STATS.map(({ icon: Icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: BLUE }}>
                <Icon size={18} />
                <span style={{ fontSize: '30px', fontWeight: 800, color: NAVY, letterSpacing: '-1px' }}>{value}</span>
              </div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: SLATE, textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
            </motion.div>
          ))}
        </div>

        <div className="dh-reviews-row" style={{ display: 'flex', gap: '24px', justifyContent: 'center', width: '100%', maxWidth: '1160px' }}>
          {REVIEWS.map((review, i) => (
            <motion.figure
              key={review.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
              style={{
                flex: '1 1 0', minWidth: 0, margin: 0,
                background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.6)', borderRadius: '22px',
                padding: '26px', boxShadow: '0 16px 40px rgba(0,0,0,0.06)',
                display: 'flex', flexDirection: 'column', gap: '14px',
              }}
            >
              <Stars />
              <blockquote style={{ margin: 0, fontSize: '15px', color: NAVY, fontWeight: 500, lineHeight: 1.6 }}>
                "{review.quote}"
              </blockquote>
              <figcaption style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: 'auto' }}>
                <span aria-hidden="true" style={{
                  width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                  background: `linear-gradient(135deg, ${NAVY}, #2d4a8f)`, color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontWeight: 800,
                }}>
                  {review.name.split(' ').map((part) => part[0]).join('')}
                </span>
                <span style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: NAVY }}>{review.name}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: SLATE }}>Bought the {review.vehicle}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ── Scene 5: How it works ── */}
      <section className="dh-scene dh-scene-center">
        <div style={{ textAlign: 'center', maxWidth: '860px', width: '100%' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="dh-h2"
            style={{ fontWeight: 800, color: NAVY, letterSpacing: '-1px', margin: '0 0 56px' }}
          >
            From browsing to keys in hand.
          </motion.h2>
          <div className="dh-steps-row" style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', gap: '16px' }}>
            <div className="dh-steps-line" style={{ position: 'absolute', top: '24px', left: '48px', right: '48px', height: '2px', background: 'rgba(0,0,0,0.06)' }} />
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: EASE }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', position: 'relative', flex: '1 1 0', minWidth: 0 }}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', background: '#fff',
                  border: `2px solid ${BLUE}`, color: BLUE,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '18px', boxShadow: '0 10px 20px rgba(37,99,235,0.12)',
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '17px', fontWeight: 800, color: NAVY }}>{step.title}</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: SLATE, lineHeight: 1.5 }}>{step.desc}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scene 6: Final CTA ── */}
      <section className="dh-scene dh-scene-cta">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          style={{ textAlign: 'center' }}
        >
          <h2 className="dh-hero-h1" style={{ fontWeight: 800, color: NAVY, lineHeight: 1.08, letterSpacing: '-2px', margin: '0 0 32px' }}>
            Find your perfect drive.
          </h2>
          {/* Marble-white CTA with react-bits GradientText as the label */}
          <MagneticButton
            onClick={() => navigate('/inventory')}
            whileHover={{ scale: 1.04, boxShadow: '0 28px 56px rgba(26,39,68,0.25)' }}
            transition={{ duration: 0.25, ease: EASE }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '22px 52px',
              background: `rgba(25, 25, 25, 0.85)`,
              border: '1px solid rgba(26,39,68,0.12)', borderRadius: '999px',
              fontSize: '18px', fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: '0 24px 48px rgba(26,39,68,0.16), inset 0 1px 0 rgba(255,255,255,0.9)',
            }}
          >
            <GradientText
              colors={['#1c0092', '#94b5ed', '#c700bf', '#ffffff']}
              animationSpeed={5.5}
              showBorder={false}
              className="dh-cta-gradient-text"
            >
              Enter Showroom
            </GradientText>
            <ArrowRight size={22} color="#1c0092" />
          </MagneticButton>
          <p style={{ fontSize: '14px', fontWeight: 600, color: SLATE, marginTop: '24px' }}>
            Free to join · Transparent pricing · Certified inventory
          </p>
        </motion.div>
      </section>

      {/* Shared scene layout + responsive rules. Scenes use min-height (not height) so
          stacked mobile content can grow past 90vh instead of clipping; the car's
          scroll choreography is a pure function of overall progress, so slightly
          uneven scene heights only nudge transition points, never break them. */}
      <style>{`
        .dh-scene {
          min-height: 90vh;
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          padding: 96px 8% 48px;
          box-sizing: border-box;
        }
        .dh-scene-hero { min-height: 100vh; }
        .dh-scene-right { justify-content: flex-end; }
        .dh-scene-left { justify-content: flex-start; }
        .dh-scene-center { justify-content: center; }
        .dh-scene-cta { justify-content: center; align-items: flex-start; padding-top: 14vh; }
        .dh-hero-h1 { font-size: clamp(40px, 6.4vw, 74px); }
        .dh-hero-sub { font-size: clamp(16px, 1.6vw, 19px); }
        .dh-h2 { font-size: clamp(30px, 4vw, 44px); }
        /* GradientText's own stylesheet sets font-weight 500; the CTA label should
           carry the same weight as the button text it replaced. */
        .dh-cta-gradient-text { font-weight: 700; }

        @media (max-width: 900px) {
          .dh-scene { padding: 88px 6% 40px; }
          .dh-trust-grid { grid-template-columns: 1fr !important; }
          .dh-reviews-row { flex-direction: column !important; align-items: stretch; }
          .dh-stats-row { gap: 28px !important; }
          .dh-steps-row { flex-wrap: wrap; row-gap: 32px; }
          .dh-steps-row > div { flex: 1 1 40% !important; }
          .dh-steps-line { display: none; }
          .dh-trust-divider { display: none; }
        }
      `}</style>
    </div>
  );
};

export default ScrollOverlay;
