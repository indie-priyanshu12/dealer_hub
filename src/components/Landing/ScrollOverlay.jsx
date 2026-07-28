import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, Settings, Clock, Star, ArrowRight } from 'lucide-react';

const SceneContainer = ({ children, style }) => (
  <div style={{ height: '90vh', width: '100vw', position: 'relative', display: 'flex', ...style }}>
    {children}
  </div>
);

const ScrollOverlay = ({ scrollProgress }) => {
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', fontFamily: "'Manrope', sans-serif" }}>
      
      {/* ── Scene 1: First Impression ── */}
      <SceneContainer style={{ alignItems: 'center', padding: '0 8%' }}>
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ maxWidth: '600px' }}
        >
          <h1 style={{ fontSize: '72px', fontWeight: '800', color: '#1E293B', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '24px' }}>
            Engineered for <br/> Every Journey.
          </h1>
          <p style={{ fontSize: '20px', color: '#64748B', fontWeight: '500', marginBottom: '48px', maxWidth: '400px', lineHeight: 1.6 }}>
            Explore premium vehicles crafted for every lifestyle. The ultimate digital showroom experience.
          </p>
          <Link to="/auth" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '18px 40px', background: '#1E293B', color: '#fff',
              borderRadius: '999px', fontSize: '16px', fontWeight: '700',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)', transition: 'all 0.3s ease'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              Browse Inventory <ArrowRight size={20} />
            </div>
          </Link>
        </motion.div>
        
        {/* Scroll Indicator */}
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: scrollProgress > 0.05 ? 0 : 1, transition: 'opacity 0.3s' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '700', color: '#64748B' }}>Scroll to Explore</span>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #64748B, transparent)' }} />
        </div>
      </SceneContainer>

      {/* ── Scene 2: The Brand ── */}
      <SceneContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            background: 'rgba(255,255,255,0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.5)',
            padding: '64px',
            borderRadius: '32px',
            maxWidth: '800px',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.05)'
          }}
        >
          <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#1E293B', marginBottom: '24px' }}>Uncompromising Quality</h2>
          <p style={{ fontSize: '20px', color: '#64748B', lineHeight: 1.8, fontWeight: '500' }}>
            We don't just sell cars. We curate an exclusive collection of automotive masterpieces. 
            Every vehicle in our showroom is meticulously inspected and verified to meet our uncompromising standards.
          </p>
        </motion.div>
      </SceneContainer>

      {/* ── Scene 3: Featured Vehicles ── */}
      <SceneContainer style={{ alignItems: 'center', justifyContent: 'flex-end', padding: '0 8%' }}>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: '500px' }}
        >
          <h2 style={{ fontSize: '52px', fontWeight: '800', color: '#1E293B', lineHeight: 1.1, marginBottom: '24px' }}>
            Performance meets Elegance.
          </h2>
          <p style={{ fontSize: '18px', color: '#64748B', lineHeight: 1.6, marginBottom: '32px' }}>
            Experience the thrill of dynamic engineering combined with luxurious comfort. Our featured collection highlights the pinnacle of modern automotive design.
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {['V12 Biturbo', '661 HP', '0-60 in 3.8s'].map((stat, i) => (
              <div key={i} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '999px', fontSize: '14px', fontWeight: '700', color: '#2563EB' }}>
                {stat}
              </div>
            ))}
          </div>
        </motion.div>
      </SceneContainer>

      {/* ── Scene 4: Why Choose Us ── */}
      <SceneContainer style={{ alignItems: 'center', padding: '0 8%' }}>
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '40%' }}>
            <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#1E293B', marginBottom: '48px' }}>Why Choose Us.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {[
                { icon: Shield, title: 'Certified Vehicles', desc: 'Rigorous 150-point inspection on every car.' },
                { icon: Settings, title: 'Extended Warranty', desc: 'Peace of mind for the road ahead.' },
                { icon: Star, title: 'Premium Service', desc: 'White-glove delivery and maintenance.' }
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  style={{ display: 'flex', gap: '24px' }}
                >
                  <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#2563EB', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <feature.icon size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B', margin: '0 0 8px' }}>{feature.title}</h3>
                    <p style={{ fontSize: '15px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </SceneContainer>

      {/* ── Scene 5: Inventory Showcase (Floating Cards) ── */}
      <SceneContainer style={{ alignItems: 'center', padding: '0 8%', overflow: 'hidden' }}>
        <div style={{ width: '100%' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#1E293B', textAlign: 'center', marginBottom: '64px' }}>Latest Arrivals</h2>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center' }}>
            {[1, 2, 3].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: i * 0.1, type: 'spring' }}
                style={{
                  width: '320px', height: '420px', background: 'rgba(255,255,255,0.7)',
                  backdropFilter: 'blur(20px)', borderRadius: '24px', padding: '24px',
                  border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                  display: 'flex', flexDirection: 'column'
                }}
              >
                <div style={{ height: '180px', background: 'linear-gradient(135deg, rgba(0,0,0,0.05), rgba(0,0,0,0.01))', borderRadius: '16px', marginBottom: '24px' }} />
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>2024 Model</div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#1E293B', margin: '0 0 16px' }}>Luxury Coupe {card}</h3>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#1E293B' }}>$145,000</span>
                  <Link to="/auth" style={{ textDecoration: 'none' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '20px', background: '#F2F3F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E293B' }}>
                      <ArrowRight size={18} />
                    </div>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SceneContainer>

      {/* ── Scene 6: Timeline ── */}
      <SceneContainer style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '800', color: '#1E293B', marginBottom: '64px' }}>The Customer Experience</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '24px', left: '0', right: '0', height: '2px', background: 'rgba(0,0,0,0.05)', zIndex: -1 }} />
            {['Discover', 'Compare', 'Test Drive', 'Purchase'].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '24px', background: '#fff', border: '2px solid #2563EB', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', boxShadow: '0 10px 20px rgba(37,99,235,0.1)' }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#1E293B' }}>{step}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </SceneContainer>

      {/* ── Scene 7: Final Call to Action ── */}
      <SceneContainer style={{ alignItems: 'flex-start', justifyContent: 'center', padding: '8vh 8% 0' }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          style={{ textAlign: 'center' }}
        >
          <h1 style={{ fontSize: '72px', fontWeight: '800', color: '#1E293B', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '40px' }}>
            Find Your Perfect Drive.
          </h1>
          <Link to="/auth" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              padding: '24px 56px', background: '#2563EB', color: '#fff',
              borderRadius: '999px', fontSize: '18px', fontWeight: '700',
              boxShadow: '0 24px 48px rgba(37,99,235,0.25)', transition: 'all 0.3s ease'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              Enter Showroom <ArrowRight size={24} />
            </div>
          </Link>
        </motion.div>
      </SceneContainer>

    </div>
  );
};

export default ScrollOverlay;
