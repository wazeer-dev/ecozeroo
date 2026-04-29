'use client';

import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, ShieldCheck, Globe, Users, DollarSign, Quote, ArrowUpRight, ShoppingBag, Bookmark } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import Hero from '@/components/Hero/Hero';

const COLORS = {
  bg: '#0a2a16',
  surface: '#12351f',
  white: '#1a472a',
  accent: '#cddc39',
  text: '#ffffff',
  textMuted: '#e0f2f1',
};

export default function Home() {
  const router = useRouter();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeThumbnails, setActiveThumbnails] = useState<Record<string, number>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true);

  const nextSlide = () => {
    if (featuredProducts.length > 0) {
      setCurrentSlide(prev => (prev + 1) % featuredProducts.length);
    }
  };

  const prevSlide = () => {
    if (featuredProducts.length > 0) {
      setCurrentSlide(prev => (prev - 1 + featuredProducts.length) % featuredProducts.length);
    }
  };

  useEffect(() => {
    if (featuredProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % featuredProducts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), limit(10));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFeaturedProducts(fetched);
      } catch (e) {
        console.error("Error fetching featured products:", e);
      } finally {
        setIsLoadingFeatured(false);
      }
    };
    fetchFeatured();
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ backgroundColor: COLORS.bg, minHeight: '100vh', color: COLORS.text, fontFamily: 'var(--font-sans), sans-serif' }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          footer:not(.ecozero-footer) { display: none !important; }
          #notification-toast { display: none !important; }
          .gradual-blur-container { display: none !important; }

          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 20s linear infinite;
          }
          .marquee-track:hover { animation-play-state: paused; }

          @media (max-width: 768px) {
            main { padding: 0 !important; }
            section { margin-top: 60px !important; }
            
            /* Features */
            .features-grid { 
              grid-template-columns: 1fr 1fr !important; 
              grid-template-rows: auto !important; 
              gap: 12px !important;
              padding: 0 !important;
            }
            .features-grid > div { 
              grid-column: auto !important; 
              grid-row: auto !important; 
              aspect-ratio: 4 / 5 !important;
              min-height: auto !important;
              border-radius: 20px !important;
            }
            .features-grid h3 { font-size: 1.2rem !important; }
            .features-grid p { font-size: 0.85rem !important; line-height: 1.4 !important; }
            .features-grid-header h2 { font-size: 2.2rem !important; }

            /* Fix text overlays inside unified cards */
            .features-grid > div > div {
              padding: 0 !important; /* Remove padding to allow strip to touch bottom */
              justify-content: flex-end !important;
              background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%) !important;
            }
            /* Target both div-wrapped and direct p-tag overlays */
            .features-grid > div > div > div,
            .features-grid > div > div > p {
              position: absolute !important;
              bottom: 0 !important;
              left: 0 !important;
              right: 0 !important;
              width: 100% !important;
              height: auto !important;
              min-height: 40px !important;
              padding: 10px 4px !important;
              border-radius: 0 0 20px 20px !important;
              backdrop-filter: blur(10px) !important;
              -webkit-backdrop-filter: blur(10px) !important;
              background: rgba(10, 42, 22, 0.7) !important;
              border: none !important;
              border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
              box-shadow: none !important;
              margin: 0 !important;
              transform: none !important; /* Remove any translateX(-50%) from inline styles */
            }
            .features-grid > div > div > div p,
            .features-grid > div > div > p {
              font-size: 0.65rem !important;
              margin: 0 !important;
              text-align: center !important;
              font-weight: 800 !important;
              text-transform: uppercase !important;
              letter-spacing: 0.8px !important;
              color: #ffffff !important;
            }
            /* Hide all extra elements (arrows, icons) */
            .features-grid [class*="Arrow"], 
            .features-grid svg, 
            .features-grid i,
            .features-grid > div > div > div > div {
              display: none !important;
            }
            /* Editorial Premium Quote Section */
            .quote-stats { 
              padding: 0 !important; 
              overflow: hidden !important;
              border-radius: 40px !important;
              position: relative !important;
              min-height: 800px !important;
              background: #0a2a16 !important;
            }
            .quote-top { 
              height: 100% !important;
              position: relative !important;
              padding: 50px 40px 180px !important; /* Huge bottom padding to protect stats */
              display: flex !important;
              flex-direction: column !important;
              justify-content: flex-start !important;
              align-items: flex-start !important; 
              gap: 40px !important;
              z-index: 2;
              text-align: left !important;
            }
            .quote-top > div:nth-child(2) { display: none !important; } /* Hide the desktop separator line */
            .quote-top img { 
              width: 70px !important; 
              height: 70px !important; 
              border: 2px solid var(--primary-color) !important;
              border-radius: 12px !important; /* Squircle */
              object-fit: cover !important;
              margin-bottom: 24px !important;
              box-shadow: 0 20px 40px rgba(0,0,0,0.5) !important;
            }
            .quote-top p:first-of-type { 
              text-transform: uppercase;
              letter-spacing: 3px;
              font-size: 0.75rem !important;
              color: var(--primary-color) !important;
              margin-bottom: 8px !important;
              font-weight: 800;
            }
            .quote-top p:last-child { 
              font-size: 1.8rem !important; 
              line-height: 1.3 !important; 
              font-weight: 600 !important; 
              color: #ffffff !important;
              letter-spacing: -0.5px !important;
              max-width: 100% !important;
              text-transform: none !important;
              margin: 0 !important; 
            }
            /* Highlight 'sustainable living' and 'accessible' with color if I could, but it's one block */
            
            .stats-grid { 
              position: absolute !important;
              bottom: 30px !important;
              left: 20px !important;
              right: 20px !important;
              width: auto !important;
              display: grid !important;
              grid-template-columns: repeat(3, 1fr) !important;
              gap: 10px !important;
              background: rgba(255, 255, 255, 0.05) !important;
              backdrop-filter: blur(20px) !important;
              padding: 16px 10px !important;
              border-radius: 20px !important;
              border: 1px solid rgba(255, 255, 255, 0.1) !important;
              z-index: 5;
            }
            .stats-grid > div { 
              padding: 0 !important; 
              background: transparent !important;
              text-align: center !important;
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
            }
            .stats-grid h3 { font-size: 1rem !important; color: var(--primary-color) !important; margin: 0 !important; }
            .stats-grid p { font-size: 0.55rem !important; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.2; }

            /* Logos */
            .logo-grid { grid-template-columns: 1fr 1fr !important; }

            /* Best Sellers (Cover Flow) */
            .best-sellers-header { flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
            .cover-flow-container { height: 400px !important; --cover-offset: 110px !important; }
            .cover-flow-card { width: 220px !important; height: 320px !important; }
            .cover-flow-details { width: 100% !important; max-width: 280px !important; margin: 0 auto !important; }
            .cover-flow-bottom { flex-direction: row !important; flex-wrap: wrap !important; justify-content: space-between !important; gap: 16px !important; }
            .desktop-only { display: none !important; }

            /* Testimonials */
            .testimonials { flex-direction: column !important; gap: 40px !important; }
            .testimonials > div { max-width: 100% !important; width: 100% !important; }
            .testimonials > div:last-child { padding: 40px 20px !important; }
            .testimonials h2 { font-size: 2.2rem !important; }

            /* CTA */
            .cta-section { flex-direction: column !important; margin-bottom: 40px !important; }
            .cta-section > div:first-child { width: 100% !important; height: 250px !important; }
            .cta-section > div:last-child { padding: 40px 20px !important; }
            .cta-section h2 { font-size: 2.2rem !important; }

            /* Footer */
            .ecozero-footer { padding: 40px 20px 20px !important; border-radius: 24px 24px 0 0 !important; }
            .footer-top { flex-direction: column !important; gap: 40px !important; }
            .footer-brand { max-width: 100% !important; }
            .footer-links { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 32px !important; }
            .footer-bottom { flex-direction: column !important; gap: 12px !important; text-align: center !important; }
          }

          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          .floating-icon {
            animation: float 4s ease-in-out infinite;
          }
        `
      }} />

      <main style={{ padding: '0', maxWidth: '100%', margin: '0' }}>
        <Hero />
        
        <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 32px' }}>
          {/* FEATURES GRID */}
          <section id="features-section" className="features-grid-header scroll-reveal" style={{ marginTop: '120px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '3rem', fontWeight: 500, letterSpacing: '-1px', marginBottom: '8px' }}>Why Choose<br/>EcoZero?</h2>
            <p style={{ color: COLORS.textMuted, marginBottom: '60px' }}>Products that protect you and the planet</p>

            <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '220px 220px', gap: '20px' }}>
              
              {/* Large Card Left */}
              <div style={{ gridColumn: '1 / 2', gridRow: '1 / 3', borderRadius: '32px', overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                {isLoadingFeatured ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/logo.png" style={{ width: '40px', opacity: 0.2, filter: 'grayscale(1)' }} />
                  </div>
                ) : (
                  <img src={(featuredProducts[0 % featuredProducts.length]?.images?.[0] || featuredProducts[0 % featuredProducts.length]?.image || "/toothbrush_eco.png")} alt="EcoZero Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', padding: '30px' }}>
                  <div style={{ 
                    position: 'relative', 
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    backdropFilter: 'blur(20px)', 
                    WebkitBackdropFilter: 'blur(20px)', 
                    padding: '35px 30px 25px', 
                    borderRadius: '24px', 
                    width: '100%', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                  }}>
                    <p style={{ color: '#ffffff', fontSize: '1.2rem', textAlign: 'center', fontWeight: 600, letterSpacing: '-0.2px' }}>100% natural ingredients, zero harmful chemicals.</p>
                  </div>
                </div>
              </div>

              {/* Top Right 1 */}
              <div style={{ borderRadius: '32px', overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                {isLoadingFeatured ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/logo.png" style={{ width: '40px', opacity: 0.2, filter: 'grayscale(1)' }} />
                  </div>
                ) : (
                  <img src={(featuredProducts[1 % featuredProducts.length]?.images?.[0] || featuredProducts[1 % featuredProducts.length]?.image || "/toothbrush_eco.png")} alt="User" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', width: '85%', textAlign: 'center' }}>
                  <p style={{ 
                    color: '#ffffff', 
                    fontSize: '0.9rem', 
                    fontWeight: 800, 
                    background: 'rgba(10, 42, 22, 0.6)', 
                    backdropFilter: 'blur(16px)', 
                    WebkitBackdropFilter: 'blur(16px)', 
                    padding: '14px', 
                    borderRadius: '16px', 
                    border: '1px solid rgba(205, 220, 57, 0.2)',
                    letterSpacing: '1px',
                    textTransform: 'uppercase'
                  }}>
                    Plastic-Free Packaging
                  </p>
                </div>
              </div>

              {/* Tall Right */}
              <div style={{ gridColumn: '3 / 4', gridRow: '1 / 3', borderRadius: '32px', overflow: 'hidden', position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                {isLoadingFeatured ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/logo.png" style={{ width: '40px', opacity: 0.2, filter: 'grayscale(1)' }} />
                  </div>
                ) : (
                  <img src={(featuredProducts[2 % featuredProducts.length]?.images?.[0] || featuredProducts[2 % featuredProducts.length]?.image || "/toothbrush_eco.png")} alt="Abstract" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                )}
                <div style={{ position: 'absolute', inset: 0, padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end' }}>
                  <div style={{ 
                    textAlign: 'center', 
                    background: 'rgba(10, 42, 22, 0.4)', 
                    backdropFilter: 'blur(12px)', 
                    WebkitBackdropFilter: 'blur(12px)', 
                    padding: '30px', 
                    borderRadius: '24px', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    width: '100%'
                  }}>
                    <h3 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '5px', color: '#ffffff', lineHeight: 1 }}>100%</h3>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: COLORS.accent, textTransform: 'uppercase', letterSpacing: '1px' }}>Biodegradable & Earth-Safe</p>
                  </div>
                </div>
              </div>

              {/* Bottom Right 1 - Glass Effect Card */}
              <div style={{ 
                borderRadius: '32px', 
                background: 'linear-gradient(135deg, rgba(205, 220, 57, 0.1) 0%, rgba(205, 220, 57, 0.05) 100%)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                padding: '32px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center',
                textAlign: 'center',
                color: '#ffffff',
                border: '1px solid rgba(205, 220, 57, 0.2)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Subtle Glowing Pulse in background */}
                <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '100px', height: '100px', background: COLORS.accent, filter: 'blur(60px)', opacity: 0.3, borderRadius: '50%' }} />
                
                <div style={{ marginBottom: '20px', backgroundColor: 'rgba(205, 220, 57, 0.1)', padding: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={40} color={COLORS.accent} />
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, lineHeight: 1.3, color: '#ffffff', margin: 0 }}>
                  Certified <span style={{ color: COLORS.accent }}>Organic</span> & Safe
                </h3>
              </div>

            </div>
          </section>

          {/* COMBINED QUOTE & STATS SECTION */}
          <section className="quote-stats scroll-reveal" style={{ marginTop: '120px', backgroundColor: COLORS.surface, borderRadius: '40px', padding: '60px 80px', display: 'flex', flexDirection: 'column', gap: '60px' }}>
            
            {/* Top: Quote */}
            <div className="quote-top" style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '150px' }}>
                <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop" alt="Wazeer Ahmed" style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover' }} />
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Wazeer Ahmed</p>
                  <p style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Founder, EcoZero</p>
                </div>
              </div>
              
              <div style={{ width: '2px', backgroundColor: 'rgba(255,255,255,0.05)', alignSelf: 'stretch' }}></div>
              
              <p style={{ fontSize: '1.8rem', fontWeight: 400, lineHeight: 1.4, letterSpacing: '-0.5px' }}>
                "At EcoZero, we believe every purchase is a vote for the kind of world you want to live in. Our mission is simple — make sustainable living accessible, beautiful, and affordable for everyone."
              </p>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', width: '100%' }}></div>

            {/* Bottom: Stats */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px' }}>
              {[
                { icon: <ShoppingBag size={24} color={'#111'} />, stat: '500+', label: 'Eco-friendly products available' },
                { icon: <Users size={24} color={'#111'} />, stat: '10K+', label: 'Happy customers across India' },
                { icon: <Globe size={24} color={'#111'} />, stat: '100%', label: 'Plastic-free & sustainable packaging' }
              ].map((item, idx) => (
                <div key={idx} className="scroll-reveal" style={{ backgroundColor: COLORS.white, borderRadius: '32px', padding: '30px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div className="floating-icon" style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: COLORS.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, animationDelay: `${idx * 0.5}s` }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '2rem', fontWeight: 500, marginBottom: '4px' }}>{item.stat}</h4>
                    <p style={{ fontSize: '0.85rem', color: COLORS.textMuted, lineHeight: 1.4 }}>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>

          </section>

          {/* MARQUEE TICKER — full width breakout */}
          </div>
          <section style={{ marginTop: '40px', overflow: 'hidden', transform: 'rotate(-1.5deg)', position: 'relative' }}>
            <div style={{ backgroundColor: COLORS.accent, padding: '16px 0' }}>
              <div className="marquee-track">
                {['Eco Friendly', 'Zero Waste', 'Organic', 'Sustainable', 'Plastic Free', 'Natural', 'Biodegradable', 'Green Living', 'Earth Safe', 'Clean Beauty', 'Go Green', 'Shop Eco',
                  'Eco Friendly', 'Zero Waste', 'Organic', 'Sustainable', 'Plastic Free', 'Natural', 'Biodegradable', 'Green Living', 'Earth Safe', 'Clean Beauty', 'Go Green', 'Shop Eco'
                ].map((text, idx) => (
                  <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '24px', padding: '0 24px', fontSize: '0.85rem', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: '#111', whiteSpace: 'nowrap' }}>
                    {text}
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#111', display: 'inline-block', opacity: 0.4 }}></span>
                  </span>
                ))}
              </div>
            </div>
          </section>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 32px' }}>

            {/* BEST SELLERS SECTION (COVER FLOW CAROUSEL) */}
            <section className="scroll-reveal" style={{ marginTop: '120px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
              
              {/* Header */}
              <div className="best-sellers-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
                <div>
                  <p style={{ color: COLORS.textMuted, fontSize: '0.8rem', fontWeight: 600, letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>Top Picks</p>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 600, color: '#fff', letterSpacing: '-1px', textTransform: 'uppercase' }}>Best Sellers</h2>
                </div>
                <button style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ArrowRight size={16} /> Discover all items
                </button>
              </div>

              {/* Carousel Area */}
              <div className="cover-flow-container" style={{ position: 'relative', height: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', '--cover-offset': '200px' } as React.CSSProperties}>
              
              {featuredProducts.length > 0 && featuredProducts.map((product, index) => {
                let offset = index - currentSlide;
                const len = featuredProducts.length;
                if (len > 2) {
                  if (offset > Math.floor(len / 2)) offset -= len;
                  if (offset < -Math.floor(len / 2)) offset += len;
                }

                const isCenter = offset === 0;
                const isVisible = Math.abs(offset) <= 1;

                return (
                  <div 
                    key={product.id || index}
                    className="cover-flow-card"
                    onClick={() => isCenter ? null : (offset > 0 ? nextSlide() : prevSlide())}
                    style={{ 
                      position: 'absolute',
                      width: '320px',
                      height: '420px',
                      backgroundColor: '#111',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      transition: 'all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)',
                      zIndex: isCenter ? 10 : 5 - Math.abs(offset),
                      transform: isCenter 
                        ? 'translateX(0) scale(1)' 
                        : `translateX(calc(${offset} * var(--cover-offset))) scale(0.85)`,
                      opacity: isCenter ? 1 : (isVisible ? 0.4 : 0),
                      pointerEvents: isVisible ? 'auto' : 'none',
                      cursor: isCenter ? 'default' : 'pointer',
                      boxShadow: isCenter ? '0 30px 60px rgba(0,0,0,0.5)' : 'none'
                    }}
                  >
                    {/* Main Images Crossfade */}
                    {((product.images && product.images.length > 0) ? product.images : [product.image || '/toothbrush_eco.png']).map((imgUrl: string, idx: number) => {
                       const isActive = (activeThumbnails[product.id] || 0) === idx;
                       return (
                         <img 
                           key={idx} 
                           src={imgUrl} 
                           alt={`${product.name} view ${idx + 1}`} 
                           style={{ 
                             position: 'absolute', 
                             inset: 0, 
                             width: '100%', 
                             height: '100%', 
                             objectFit: 'cover', 
                             opacity: isActive ? 1 : 0, 
                             transition: 'opacity 0.4s { ease }',
                             pointerEvents: 'none',
                             zIndex: 1
                           }} 
                         />
                       );
                    })}

                    {isCenter && (
                      <div 
                        onClick={(e) => { e.stopPropagation(); setFavorites(prev => ({...prev, [product.id]: !prev[product.id]})) }}
                        style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: favorites[product.id] ? COLORS.accent : 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '4px', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s ease' }}
                      >
                        <Bookmark size={16} color={favorites[product.id] ? '#111' : '#fff'} fill={favorites[product.id] ? 'currentColor' : 'none'} />
                      </div>
                    )}
                    {isCenter && (
                      <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(18, 53, 31, 0.85)', backdropFilter: 'blur(10px)', padding: '6px', borderRadius: '12px', display: 'flex', gap: '6px', border: '1px solid rgba(205, 220, 57, 0.2)', zIndex: 10 }}>
                        {((product.images && product.images.length > 0) ? product.images : [product.image]).slice(0, 4).map((imgUrl: string, idx: number) => {
                          const isActive = (activeThumbnails[product.id] || 0) === idx;
                          return (
                            <div 
                              key={idx}
                              onClick={(e) => { e.stopPropagation(); setActiveThumbnails(prev => ({...prev, [product.id]: idx})) }}
                              style={{ width: '36px', height: '36px', borderRadius: '8px', border: isActive ? '2px solid #fff' : '2px solid transparent', opacity: isActive ? 1 : 0.5, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease' }}
                            >
                              <img src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Center Product Details */}
            {featuredProducts.length > 0 && (
              <div className="cover-flow-details" style={{ margin: '0 auto', width: '320px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: 1.3, margin: 0 }}>
                        {featuredProducts[currentSlide]?.name || 'EcoZero Product'}
                      </h3>
                      {(() => {
                        const price = Number(featuredProducts[currentSlide]?.price);
                        const compare = Number(featuredProducts[currentSlide]?.comparePrice || featuredProducts[currentSlide]?.originalPrice);
                        if (compare > price && price > 0) {
                          const discount = Math.round(((compare - price) / compare) * 100);
                          return (
                            <span style={{ backgroundColor: '#ef5350', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '3px 8px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                              -{discount}%
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '12px' }}>
                    <p style={{ fontSize: '1rem', fontWeight: 800, color: COLORS.accent, lineHeight: 1 }}>
                      ₹{featuredProducts[currentSlide]?.price ?? '—'}
                    </p>
                    {(featuredProducts[currentSlide]?.comparePrice || featuredProducts[currentSlide]?.originalPrice) && (
                      <p style={{ fontSize: '0.75rem', color: '#ef5350', textDecoration: 'line-through', marginTop: '4px', fontWeight: 600 }}>
                        ₹{featuredProducts[currentSlide]?.comparePrice || featuredProducts[currentSlide]?.originalPrice}
                      </p>
                    )}
                  </div>
                </div>

                <button onClick={() => router.push(`/product/${featuredProducts[currentSlide].id}`)} style={{ width: '100%', backgroundColor: '#fff', color: '#111', border: 'none', padding: '14px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f0f0f0'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#fff'}>
                   <ShoppingBag size={16} color="#111" /> Add to Cart
                </button>
              </div>
            )}

            {/* Bottom Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
              
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', color: '#fff' }}>
                0{currentSlide + 1} / 0{Math.max(1, featuredProducts.length)}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={prevSlide} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ChevronLeft size={16}/></button>
                <button onClick={nextSlide} style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}><ChevronRight size={16}/></button>
              </div>
            </div>

          </section>

          {/* TESTIMONIALS */}
          <section className="testimonials scroll-reveal" style={{ marginTop: '120px', display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ maxWidth: '300px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1.1, marginBottom: '24px' }}>What our customers say</h2>
              <p style={{ color: COLORS.textMuted, fontSize: '1rem', lineHeight: 1.5, marginBottom: '40px' }}>
                Real stories from people who made the switch to eco-friendly living with EcoZero products.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button style={{ backgroundColor: COLORS.white, border: 'none', padding: '12px 24px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  Global Study
                  <div style={{ backgroundColor: COLORS.accent, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={12} />
                  </div>
                </button>
              </div>
            </div>

            <div style={{ backgroundColor: COLORS.surface, borderRadius: '40px', padding: '60px', width: '60%' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 500, marginBottom: '16px' }}>"Finally, a brand that truly cares."</h3>
              <p style={{ color: COLORS.textMuted, fontSize: '1rem', lineHeight: 1.6, marginBottom: '40px' }}>
                "I switched to EcoZero's bamboo products and I haven't looked back. Everything feels premium, my home smells fresher, and I feel good knowing I'm not harming the environment."
              </p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" alt="User" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Priya Sharma</p>
                    <p style={{ fontSize: '0.8rem', color: COLORS.textMuted }}>Eco Enthusiast, Bangalore</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Story</span>
                  <span style={{ cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', color: COLORS.textMuted }}>Career</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA SECTION */}
          <section className="cta-section scroll-reveal" style={{ marginTop: '120px', marginBottom: '80px', display: 'flex', gap: '20px' }}>
            <div style={{ backgroundColor: COLORS.accent, borderRadius: '40px', width: '350px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=800&auto=format&fit=crop" alt="Fresh Organic Juice" style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply', opacity: 0.8 }} />
            </div>
            
            <div style={{ flex: 1, backgroundColor: COLORS.surface, borderRadius: '40px', padding: '80px', position: 'relative' }}>
              <h2 style={{ fontSize: '3.5rem', fontWeight: 500, lineHeight: 1.1, letterSpacing: '-1px', marginBottom: '24px', maxWidth: '600px' }}>
                Your Journey to Sustainable Living Starts Here.
              </h2>
              <p style={{ color: COLORS.textMuted, fontSize: '1.1rem', marginBottom: '40px', maxWidth: '500px' }}>
                Browse our full range of eco-certified, plastic-free products — made with love for people and the planet.
              </p>
              <button onClick={() => router.push('/products')} style={{ backgroundColor: COLORS.white, color: COLORS.text, border: 'none', borderRadius: '40px', padding: '12px 24px', fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
                Shop All Products
                <div style={{ backgroundColor: COLORS.text, color: COLORS.white, borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowRight size={16} />
                </div>
              </button>
              <div style={{ position: 'absolute', bottom: '60px', right: '60px', backgroundColor: COLORS.accent, width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowUpRight size={24} />
              </div>
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}
