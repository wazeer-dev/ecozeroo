'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';
import { Leaf, Award, Globe, Zap, Heart, CheckCircleIcon } from 'lucide-react';

export default function AboutPage() {

  return (
    <main style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. HERO SECTION (HOME-STYLE) */}
      <section className="hero-section" style={{ position: 'relative', marginTop: '120px', width: '100%', padding: '0 4%', overflow: 'visible' }}>
        <div style={{ 
          background: 'linear-gradient(90deg, rgba(10, 42, 22, 0.95) 30%, rgba(10, 42, 22, 0) 100%), url(/about/hero.png) center/cover', 
          borderRadius: '80px', 
          padding: '120px 80px', 
          display: 'flex', 
          flexWrap: 'wrap', 
          position: 'relative', 
          overflow: 'hidden', 
          minHeight: '650px', 
          alignItems: 'center' 
        }}>
           
           {/* Left Content */}
           <div style={{ flex: '1 1 500px', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ display: 'inline-block', backgroundColor: 'transparent', border: '1.5px solid rgba(205, 220, 57, 0.2)', borderRadius: '30px', padding: '8px 24px', fontSize: '0.9rem', fontWeight: 700, color: '#A0C2C2', marginBottom: '40px', alignSelf: 'flex-start' }}
              >
                 EST. 2024 • THE MISSION
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{ fontSize: 'clamp(3.5rem, 6vw, 6rem)', lineHeight: 0.95, fontWeight: 900, color: '#ffffff', marginBottom: '32px', letterSpacing: '-3px', fontFamily: 'var(--font-heading), sans-serif' }}
              >
                Architects of <br /> Sustainable Choice.
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ fontSize: '1.25rem', color: '#e0f2f1', lineHeight: 1.5, maxWidth: '480px', fontWeight: 500 }}
              >
                At EcoZero, we believe that balance in mind and body begins with the health of our earth. Discover our journey towards a zero-waste future.
              </motion.p>
           </div>
        </div>
      </section>

      {/* 2. THE MANIFESTO: BOLD TEXT */}
      <section className="container" style={{ padding: '15vh 0', textAlign: 'center' }}>
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           transition={{ duration: 1.5 }}
        >
          <h2 style={{ 
            fontSize: 'clamp(2rem, 5vw, 4.5rem)', 
            maxWidth: '1200px', 
            margin: '0 auto',
            lineHeight: 1.1,
            color: '#ffffff',
            fontWeight: 800,
            letterSpacing: '-0.03em'
          }}>
            We don’t just follow <span style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-brand), serif', fontStyle: 'italic', fontWeight: 300 }}>sustainability</span> trends. We build the architecture of a future where tech and earth beat as one heart.
          </h2>
        </motion.div>
        
        <div style={{ 
            marginTop: '80px', 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '60px', 
            flexWrap: 'wrap',
            flexDirection: 'row'
        }} className="metrics-container">
            <Metric counter="12,400" label="TREES PLANTED" />
            <Metric counter="1.2M" label="TONS CO2 SAVED" />
            <Metric counter="100%" label="RENEWABLE POWER" />
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @media (max-width: 600px) {
            .metrics-container { flex-direction: column !important; gap: 40px !important; }
          }
        ` }} />
      </section>

      {/* 3. ASYMMETRICAL STORY SECTION */}
      <section style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: '#fff', padding: '15vh 0' }}>
         <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '5%', alignItems: 'center' }}>
            
            <motion.div 
               initial={{ opacity: 0, x: -50 }}
               whileInView={{ opacity: 1, x: 0 }}
               transition={{ duration: 0.8 }}
            >
               <span style={{ color: 'var(--secondary-color)', fontWeight: 800, letterSpacing: '2px', fontSize: '0.8rem' }}>THE CONSERVATORY</span>
               <h3 style={{ fontSize: '3rem', margin: '24px 0', fontFamily: 'var(--font-brand), serif', fontWeight: 300 }}>Where Choice is Born.</h3>
               <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '40px' }}>
                  Our design studio is a living conservatory where every product is architected from the atom up to be circular. We combine modular hardware with organic chemistry to create things that return to the earth as nutrients, not waste.
               </p>
               
               <ul style={{ listStyle: 'none', padding: 0 }}>
                  <li style={liStyle}><CheckCircleIcon size={20} color="var(--secondary-color)" /> Zero Plastic Supply Chain</li>
                  <li style={liStyle}><CheckCircleIcon size={20} color="var(--secondary-color)" /> Regenerative Soil Support</li>
                  <li style={liStyle}><CheckCircleIcon size={20} color="var(--secondary-color)" /> Open Source Eco-Design</li>
               </ul>
            </motion.div>

            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1 }}
               style={{ position: 'relative', height: '600px', borderRadius: '40px', overflow: 'hidden' }}
            >
               <Image 
                  src="/about/studio.png" 
                  alt="ECOZERO Design Studio" 
                  fill 
                  style={{ objectFit: 'cover' }}
               />
            </motion.div>
         </div>
      </section>

      {/* 4. CORE PRINCIPLES GRID */}
      <section style={{ padding: '15vh 5%' }}>
          <div className="container" style={{ textAlign: 'center', marginBottom: '80px' }}>
             <h4 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff' }}>Our Core Loop.</h4>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '30px' 
          }}>
             <PrincipleCard 
                icon={<Leaf size={32} />} 
                title="Regenerative Sourcing" 
                desc="We don't wait for eco-certified items. We partner directly with regenerative farms to grow our own infrastructure."
             />
             <PrincipleCard 
                icon={<Zap size={32} />} 
                title="Low-Energy Logic" 
                desc="Our digital platforms are built on edge-computing grids powered entirely by localized solar and wind arrays."
             />
             <PrincipleCard 
                icon={<Globe size={32} />} 
                title="Circular Logistics" 
                desc="Every package we ship is collected back by our fleet to be re-sanitized and reused in a perfect closed loop."
             />
          </div>
      </section>

    </main>
  );
}

function Metric({ counter, label }: { counter: string, label: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#ffffff' }}>{counter}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--accent-secondary)', marginTop: '8px' }}>{label}</div>
    </div>
  );
}

function PrincipleCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div 
       whileHover={{ y: -10 }}
       style={{ 
          padding: '60px 40px', 
          backgroundColor: 'rgba(255,255,255,0.03)', 
          borderRadius: '40px', 
          border: '1px solid rgba(205, 220, 57, 0.1)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
       }}
    >
       <div style={{ color: 'var(--primary-color)', marginBottom: '32px' }}>{icon}</div>
       <h5 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '16px', color: '#ffffff' }}>{title}</h5>
       <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontSize: '1.05rem' }}>{desc}</p>
    </motion.div>
  );
}

const liStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '16px',
  fontSize: '1.1rem',
  fontWeight: 600
};
