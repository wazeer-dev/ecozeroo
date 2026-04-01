'use client';

import React from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { Leaf, Award, Globe, Zap, Heart, CheckCircleIcon } from 'lucide-react';

export default function AboutPage() {
  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.1]);
  const heroOpacity = useTransform(scrollYProgress, [0.4, 0.5], [1, 0]);

  return (
    <main style={{ backgroundColor: '#f7faef', minHeight: '100vh', overflowX: 'hidden' }}>
      
      {/* 1. CINEMATIC WINDOW HERO */}
      <section style={{ 
        height: '110vh', 
        width: '100vw', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '0 5%',
        position: 'relative',
        zIndex: 1
      }}>
        <motion.div 
          style={{ 
            width: '100%', 
            height: '85vh', 
            borderRadius: '60px', 
            overflow: 'hidden', 
            position: 'relative',
            scale: heroScale,
            boxShadow: '0 40px 100px rgba(26, 60, 38, 0.15)'
          }}
        >
          <Image 
            src="/about/hero.png" 
            alt="The Greenhouse Architecture" 
            fill 
            style={{ objectFit: 'cover' }}
            priority
          />
          <div style={{ 
            position: 'absolute', 
            inset: 0, 
            background: 'linear-gradient(to bottom, transparent 30%, rgba(26, 60, 38, 0.6) 100%)' 
          }} />
          
          {/* Hero Content Overlay */}
          <div style={{ 
            position: 'absolute', 
            bottom: '10%', 
            left: '8%', 
            maxWidth: '800px',
            color: '#fff'
          }}>
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{ 
                display: 'inline-block', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                backdropFilter: 'blur(10px)',
                padding: '8px 24px', 
                borderRadius: '50px', 
                fontSize: '0.8rem', 
                fontWeight: 800, 
                letterSpacing: '3px',
                marginBottom: '24px'
              }}
            >
              EST. 2024 • THE MISSION
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{ 
                fontSize: 'clamp(3rem, 10vw, 8rem)', 
                fontWeight: 400, 
                fontFamily: 'var(--font-brand), serif',
                lineHeight: 0.9,
                marginBottom: '32px'
              }}
            >
              Architects <br/> of Choice.
            </motion.h1>
          </div>
        </motion.div>
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
            color: '#1a3c26',
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
      <section style={{ backgroundColor: '#1a3c26', color: '#fff', padding: '15vh 0' }}>
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
             <h4 style={{ fontSize: '3.5rem', fontWeight: 800, color: '#1a3c26' }}>Our Core Loop.</h4>
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
      <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#1a3c26' }}>{counter}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '2px', color: 'var(--primary-color)', marginTop: '8px' }}>{label}</div>
    </div>
  );
}

function PrincipleCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div 
       whileHover={{ y: -10 }}
       style={{ 
          padding: '60px 40px', 
          backgroundColor: '#fff', 
          borderRadius: '40px', 
          boxShadow: '0 20px 50px rgba(0,0,0,0.03)',
          transition: 'all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1)'
       }}
    >
       <div style={{ color: 'var(--primary-color)', marginBottom: '32px' }}>{icon}</div>
       <h5 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '16px', color: '#1a3c26' }}>{title}</h5>
       <p style={{ color: 'rgba(26,60,38,0.6)', lineHeight: 1.7, fontSize: '1.05rem' }}>{desc}</p>
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
