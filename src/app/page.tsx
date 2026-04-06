'use client';

import { ArrowDownRight } from 'lucide-react';
import { useState } from 'react';

const TESTIMONIALS = [
  { id: 1, name: 'Sarah M.', role: 'Eco Activist', quote: 'This platform completely changed how I source my daily essentials.', img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop', top: '35%', left: '15%', size: 60 },
  { id: 2, name: 'David L.', role: 'Chef', quote: 'The organic blends are exactly what my kitchen needed. Unmatched quality.', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop', top: '70%', left: '25%', size: 80 },
  { id: 3, name: 'Jessica T.', role: 'Yoga Instructor', quote: 'Truly sustainable and incredibly well packaged. Highly recommend!', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop', top: '15%', left: '46%', size: 70 },
  { id: 4, name: 'Michael B.', role: 'Student', quote: 'Affordable eco-friendly products that actually work. Im impressed.', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop', top: '15%', left: '62%', size: 65 },
  { id: 5, name: 'Emily R.', role: 'Graphic Designer', quote: 'Joining this eco-community has been life-changing. The products are incredibly high-quality, and the practices help me find inner peace while saving the planet.', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop', top: '35%', left: '75%', size: 70 },
];

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState<number | null>(null);

  return (
    <>
      <main className="main-content visible" style={{ paddingTop: '100px', backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '100px' }}>
        
        {/* 1. HERO SECTION */}
        <section className="hero-section" style={{ position: 'relative', marginTop: '20px', width: '100%', padding: '0 4%', overflow: 'visible' }}>
          <div style={{ 
            background: 'linear-gradient(90deg, rgba(205, 230, 174, 0.9) 30%, rgba(205, 230, 174, 0) 100%), url(/toothbrush-hero.png) center/cover', 
            borderRadius: '80px', 
            padding: '100px 80px', 
            display: 'flex', 
            flexWrap: 'wrap', 
            position: 'relative', 
            overflow: 'hidden', 
            minHeight: '650px', 
            alignItems: 'center' 
          }}>
             
             {/* Left Content */}
             <div style={{ flex: '1 1 500px', zIndex: 10, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
                <div style={{ display: 'inline-block', backgroundColor: 'transparent', border: '1.5px solid rgba(26, 60, 38, 0.2)', borderRadius: '30px', padding: '8px 24px', fontSize: '0.9rem', fontWeight: 700, color: '#1a3c26', marginBottom: '40px', alignSelf: 'flex-start' }}>
                   Eco-Friendly Living
                </div>
                <h1 style={{ fontSize: 'clamp(3.5rem, 6vw, 6rem)', lineHeight: 0.95, fontWeight: 900, color: '#1a3c26', marginBottom: '32px', letterSpacing: '-3px', fontFamily: 'var(--font-heading), sans-serif' }}>
                  Achieve balance in <br /> mind, body, and earth.
                </h1>
                <p style={{ fontSize: '1.25rem', color: 'rgba(26, 60, 38, 0.7)', lineHeight: 1.5, maxWidth: '480px', fontWeight: 500 }}>
                  Discover EcoZero — premium organic blends and eco-friendly products crafted for your well-being and the planet's future.
                </p>
             </div>
             
             {/* Right Graphic Area - Emptied for cleaner look */}
             <div style={{ flex: '1 1 400px', position: 'relative', zIndex: 1 }}></div>
          </div>
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            
            @media (max-width: 768px) {
              .main-content { padding-top: 32px !important; }
              .hero-section { margin-top: 0px !important; }
            }
          ` }} />
        </section>



        {/* 2. BENTO CARDS SECTION (Mapping to reference layout styles using EcoZero content) */}
        <section className="container" style={{ marginTop: '80px', marginBottom: '100px', zIndex: 10, position: 'relative' }}>
            <style>{`
               .bento-grid {
                  display: grid;
                  grid-template-columns: repeat(12, 1fr);
                  grid-auto-rows: 280px;
                  gap: 24px;
               }
               
               /* Desktop Spans */
               .card-blue { grid-column: span 5; grid-row: span 2; }
               .card-pink { grid-column: span 4; grid-row: span 1; }
               .card-chart { grid-column: span 3; grid-row: span 2; }
               .card-green { grid-column: span 4; grid-row: span 1; }
               .card-yellow { grid-column: span 5; grid-row: span 1; }
               .card-typo { grid-column: span 7; grid-row: span 1; }

               @media (max-width: 1100px) {
                  .bento-grid {
                     grid-template-columns: repeat(2, 1fr);
                     grid-auto-rows: auto;
                  }
                  .card-blue, .card-pink, .card-chart, .card-green, .card-yellow, .card-typo { 
                     grid-column: span 2 !important; 
                     grid-row: auto !important;
                     min-height: 350px;
                  }
                  .card-pink, .card-chart { grid-column: span 1 !important; }
               }

               @media (max-width: 768px) {
                  .bento-grid {
                     grid-template-columns: 1fr;
                  }
                  .card-blue, .card-pink, .card-chart, .card-green, .card-yellow, .card-typo { 
                     grid-column: span 1 !important; 
                     min-height: 320px;
                  }
                  .card-chart { min-height: 500px !important; }
               }
               
               .bento-card {
                  border-radius: 32px;
                  padding: 32px;
                  position: relative;
                  overflow: hidden;
                  display: flex;
                  flex-direction: column;
                  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                  transition: transform 0.3s;
               }
               .bento-card:hover { transform: translateY(-4px); }
               
               .scatter-pill {
                  position: absolute;
                  background: white;
                  color: black;
                  font-weight: 800;
                  padding: 8px 16px;
                  border-radius: 20px;
                  font-size: 0.9rem;
                  box-shadow: 4px 4px 0px rgba(0,0,0,0.15);
                  border: 2px solid rgba(0,0,0,0.05);
                  pointer-events: none;
               }
            `}</style>
            
            <div className="bento-grid">
               
               {/* CARD 1: Soft Pearl (Home Essentials) */}
               <div className="bento-card blue card-blue" style={{ background: 'linear-gradient(135deg, #3c7814, #5a7a40)' }}>
                  <h3 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', fontWeight: 800, letterSpacing: '-2px', color: '#0f172a', lineHeight: 1, position: 'relative', zIndex: 10 }}>
                     eco<br/>essentials
                  </h3>
                  <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', width: '80%', height: '70%', background: 'url(https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=600&auto=format&fit=crop) center/cover', borderRadius: '32px', border: '8px solid rgba(255,255,255,0.4)', transform: 'rotate(-4deg)' }} />
               </div>

               {/* CARD 2: Jewel (Self Care / Tag) */}
               <div className="bento-card pink card-pink" style={{ background: 'var(--primary-color)', alignItems: 'center', justifyContent: 'center' }}>
                  <h3 style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-1px', color: '#ffffff', textShadow: '4px 4px 0px rgba(0,0,0,0.08)' }}>
                     # selfcare
                  </h3>
               </div>

               {/* CARD 3: Crypto-style Line Chart (Testimonials) */}
               <div className="bento-card chart card-chart" style={{ background: 'linear-gradient(to bottom, #dcfce7 0%, #ffffff 80%)', padding: '24px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '20px', zIndex: 10 }}>
                     <h4 style={{ fontSize: '1.5rem', fontWeight: 800 }}>#Impact</h4>
                     <p style={{ color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.9rem' }}>+57k (eco-points) Today</p>
                  </div>
                  
                  {/* The Chart Area */}
                  <div style={{ flex: 1, position: 'relative', marginTop: '20px' }}>
                     {/* SVG Line Chart */}
                     <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}>
                        <defs>
                           <linearGradient id="chartFade" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(74, 222, 128, 0.4)" />
                              <stop offset="100%" stopColor="rgba(74, 222, 128, 0)" />
                           </linearGradient>
                        </defs>
                        {/* Fill area */}
                        <path d="M 0 60 L 25 75 L 50 40 L 75 55 L 100 20 L 100 100 L 0 100 Z" fill="url(#chartFade)" />
                        {/* Solid line stroke */}
                        <polyline points="0,60 25,75 50,40 75,55 100,20" fill="none" stroke="var(--primary-color)" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                     </svg>

                     {/* Avatar Nodes matching the SVG path vertices */}
                     {[ 
                        { id: 1, x: '0%', y: '60%', t: TESTIMONIALS[0] },
                        { id: 2, x: '25%', y: '75%', t: TESTIMONIALS[1] },
                        { id: 3, x: '50%', y: '40%', t: TESTIMONIALS[2] },
                        { id: 4, x: '75%', y: '55%', t: TESTIMONIALS[3] },
                        { id: 5, x: '100%', y: '20%', t: TESTIMONIALS[4] }
                     ].map(node => {
                        const isActive = activeTestimonial === node.id;
                        const isFirst = node.id === 1;
                        const isLast = node.id === 5;
                        const isLow = parseInt(node.y) > 50;

                        return (
                           <div 
                              key={node.id} 
                              style={{ position: 'absolute', left: node.x, top: node.y, transform: 'translate(-50%, -50%)', zIndex: isActive ? 50 : 5, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                              onMouseEnter={() => setActiveTestimonial(node.id)}
                              onMouseLeave={() => setActiveTestimonial(null)}
                           >
                              {isActive && (
                                 <div style={{ position: 'absolute', width: '56px', height: '56px', backgroundColor: 'rgba(74, 222, 128, 0.4)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none', zIndex: 0 }}>
                                    <div style={{ width: '44px', height: '44px', backgroundColor: 'rgba(74, 222, 128, 0.8)', borderRadius: '50%' }}></div>
                                 </div>
                              )}

                              <img src={node.t.img} style={{ width: '32px', height: '32px', borderRadius: '50%', border: isActive ? '2px solid #fff' : '2px solid var(--primary-color)', objectFit: 'cover', background: '#fff', position: 'relative', zIndex: 1, transition: 'all 0.2s ease' }} alt={node.t.name} />

                              {/* Tooltip Card */}
                              <div 
                                 style={{ 
                                    position: 'absolute', 
                                    top: isLow ? 'auto' : '100%', 
                                    bottom: isLow ? '100%' : 'auto',
                                    left: isFirst ? '0' : (isLast ? 'auto' : '50%'),
                                    right: isLast ? '0' : 'auto',
                                    marginLeft: (isFirst || isLast) ? '0' : '-110px',
                                    marginTop: isLow ? '0' : '15px',
                                    marginBottom: isLow ? '15px' : '0',
                                    backgroundColor: '#1a2421', 
                                    color: 'var(--white)', 
                                    padding: '16px', 
                                    borderRadius: '16px', 
                                    width: '220px', 
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)', 
                                    zIndex: 60, 
                                    pointerEvents: 'none', 
                                    transformOrigin: isLow ? 'bottom center' : 'top center',
                                    opacity: isActive ? 1 : 0,
                                    transform: isActive ? 'translateY(0) scale(1)' : (isLow ? 'translateY(10px) scale(0.95)' : 'translateY(-10px) scale(0.95)'),
                                    transition: 'all 0.2s ease-out'
                                 }}
                              >
                                 <p style={{ fontSize: '0.8rem', lineHeight: 1.4, marginBottom: '12px', opacity: 0.9 }}>"{node.t.quote}"</p>
                                 <div>
                                    <strong style={{ display: 'block', fontSize: '0.9rem', color: '#a2d67a' }}>{node.t.name}</strong>
                                    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{node.t.role}</span>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>

                  <button style={{ width: '100%', padding: '14px', background: 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 700, marginTop: '20px', cursor: 'pointer', zIndex: 10, boxShadow: '0 4px 15px rgba(14,165,233,0.3)' }}>
                     View Testimonials
                  </button>
               </div>

               {/* CARD 4: Jewel Green (Pill scatter) */}
               <div className="bento-card green card-green" style={{ backgroundColor: 'var(--primary-color)', position: 'relative' }}>
                  <div className="scatter-pill" style={{ top: '20%', left: '10%', transform: 'rotate(-5deg)', color: 'var(--primary-color)' }}>Community</div>
                  <div className="scatter-pill" style={{ top: '45%', right: '15%', transform: 'rotate(8deg)', color: 'var(--primary-color)' }}>Zero-Waste</div>
                  <div className="scatter-pill" style={{ bottom: '25%', left: '30%', transform: 'rotate(-2deg)', color: 'var(--primary-color)' }}>Active Users</div>
                  <div className="scatter-pill" style={{ top: '15%', right: '10%', transform: 'rotate(12deg)', color: 'var(--primary-color)' }}>2025</div>
                  <div className="scatter-pill" style={{ bottom: '15%', left: '8%', transform: 'rotate(-10deg)', color: 'var(--primary-color)' }}>Organic</div>
               </div>

               {/* CARD 5: Bright Yellow CTA */}
               <div className="bento-card yellow card-yellow" style={{ backgroundColor: 'var(--bg-color)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h4 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '16px', lineHeight: 1.1 }}>Share<br/>Moments</h4>
                  <div style={{ display: 'flex', gap: '8px' }}>
                     <input type="email" placeholder="Your email..." style={{ flex: 1, padding: '12px 20px', borderRadius: '30px', border: '1px solid rgba(255, 255, 255, 0.1)', outline: 'none', fontSize: '1rem', background: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                     <button style={{ background: 'var(--primary-color)', color: '#fff', padding: '12px 24px', borderRadius: '30px', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Join</button>
                  </div>
               </div>
               
               {/* CARD 6: Typography showcase */}
               <div className="card-typo" style={{ background: 'radial-gradient(circle at center, #fdf8f6, #f3e8ff)', borderRadius: '32px', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                     <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b' }}>EcoZero Typeface</span>
                     <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ec4899', background: '#fce7f3', padding: '4px 12px', borderRadius: '12px' }}>Bold</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: 800, color: '#0f172a', lineHeight: 1, letterSpacing: '-2px' }}>AaBbCc</h2>
               </div>

            </div>
        </section>

        <style jsx global>{`
          @keyframes spin { 100% { transform: rotate(360deg); } }
          
          .hover-card:hover { transform: translateY(-5px); }
          
          /* Ensuring the body isn't accidentally overridden heavily by dark themes */
          body { 
            background-color: var(--bg-color) !important; 
            color: var(--text-primary) !important;
          }
        `}</style>
      </main>
    </>
  );
}

