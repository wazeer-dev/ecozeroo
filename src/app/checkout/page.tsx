'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreditCard, PackageCheck, Loader2, ArrowLeft, ChevronDown, MapPin, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [locationUrl, setLocationUrl] = useState('');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);

  const router = useRouter();

  const colors = {
    bg: '#fcf7de',
    surface: 'rgba(20, 104, 69, 0.05)',
    surfaceSolid: '#ffffff',
    border: 'rgba(20, 104, 69, 0.12)',
    accent: 'rgb(20, 104, 69)',
    pale: '#5a7a40',
    text: '#041c0b',
    textMuted: 'rgba(4, 28, 11, 0.6)'
  };

  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const savedSingle = localStorage.getItem('ecozero_checkout_item');
    const savedCart = localStorage.getItem('ecozero_cart');
    let checkoutItems: any[] = [];

    if (savedSingle) {
      checkoutItems = [JSON.parse(savedSingle)];
    } else if (savedCart) {
      checkoutItems = JSON.parse(savedCart);
    }
    setItems(checkoutItems);

    const savedUser = localStorage.getItem('ecozero_user');
    if (!savedUser) {
      router.push('/login');
      return;
    }
    if (savedUser) {
      setEmail(savedUser === 'admin' ? 'ecozero@gmail.com' : savedUser);
    }
    
    const savedName = localStorage.getItem('ecozero_user_name');
    try {
      const savedAddresses = JSON.parse(localStorage.getItem('ecozero_addresses') || '[]');
      if (savedAddresses.length > 0) {
        const lastAddr = savedAddresses[savedAddresses.length - 1];
        setCustomerName(lastAddr.name || savedName || '');
        setPhone(lastAddr.phone || '');
        setAddress(lastAddr.address || '');
        setAddressDetail(lastAddr.detail || '');
        setCity(lastAddr.city || '');
        setState(lastAddr.state || '');
        setPinCode(lastAddr.pin || '');
      } else if (savedName) {
        setCustomerName(savedName);
      }
    } catch (e) {
      console.error("Error auto-filling address:", e);
      if (savedName) setCustomerName(savedName);
    }
    setIsLoading(false);
  }, []);

  const handleSetLocation = () => {
    setShowMap(true);
  };

  const confirmMapLocation = () => {
    if (mapCoords) {
      const url = `https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}`;
      setLocationUrl(url);
      setShowMap(false);
      alert("📍 Delivery pin synchronized with GPS coordinates.");
    } else {
      alert("Please tap on the map to place your delivery pin first.");
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setProcessing(true);
    
    try {
      const subtotal = items.reduce((acc, it) => acc + (parseFloat(it.price) * (it.quantity || 1)), 0);
      const discount = subtotal * 0.20;
      const total = subtotal - discount;

      const newOrder = {
        customer: customerName || 'Guest User',
        email: email || '',
        phone: phone || '',
        address: `${address}, ${addressDetail}, ${city}, ${state} - ${pinCode}`,
        locationUrl: locationUrl || '',
        userEmail: localStorage.getItem('ecozero_user') || email || '',
        total: total,
        status: 'Processing',
        date: new Date().toISOString(),
        items: items.map(it => ({ id: it.id, name: it.name, image: it.image, price: it.price, quantity: it.quantity || 1 }))
      };
      
      await addDoc(collection(db, 'orders'), newOrder);
      
      const newAddress = { name: customerName, phone, address, detail: addressDetail, city, state, pin: pinCode, id: Date.now().toString() };
      const savedAddresses = JSON.parse(localStorage.getItem('ecozero_addresses') || '[]');
      const addressString = `${address}${city}${pinCode}`.toLowerCase().replace(/\s/g, '');
      const alreadyExists = savedAddresses.some((a: any) => `${a.address}${a.city}${a.pin}`.toLowerCase().replace(/\s/g, '') === addressString);
      if (!alreadyExists) {
        localStorage.setItem('ecozero_addresses', JSON.stringify([...savedAddresses, newAddress]));
      }

      for (const it of items) {
        if (it.id) {
          try {
            const productRef = doc(db, 'products', it.id);
            await updateDoc(productRef, { stock: increment(-(it.quantity || 1)) });
          } catch(err) {
            console.error("Stock update error:", err);
          }
        }
      }
      
      setProcessing(false);
      setSuccess(true);
      
      const wishlist = JSON.parse(localStorage.getItem('ecozero_wishlist') || '[]');
      const purchasedIds = items.map(it => it.id);
      localStorage.setItem('ecozero_wishlist', JSON.stringify(wishlist.filter((wi: any) => !purchasedIds.includes(wi.id))));

      localStorage.removeItem('ecozero_checkout_item');
      localStorage.removeItem('ecozero_cart');
    } catch (error) {
      console.error("Error processing order:", error);
      alert("Error processing transaction. Check configuration.");
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (!showMap) return;

    let mapInstance: any = null;

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !document.getElementById('map-picker')) {
        setTimeout(initMap, 200);
        return;
      }

      const container = L.DomUtil.get('map-picker');
      if (container) {
        (container as any)._leaflet_id = null;
      }

      mapInstance = L.map('map-picker').setView([10.8505, 76.2711], 13);
      
      const googleStreets = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3'],
          attribution: '&copy; Google Maps'
      });

      const googleHybrid = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
          maxZoom: 20,
          subdomains:['mt0','mt1','mt2','mt3'],
          attribution: '&copy; Google Maps'
      });

      googleHybrid.addTo(mapInstance);

      L.control.layers({
        "Google Streets": googleStreets,
        "Google Satellite": googleHybrid
      }).addTo(mapInstance);

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      let marker: any = null;
      const updateMarker = (latlng: any) => {
        if (marker) mapInstance.removeLayer(marker);
        marker = L.marker(latlng).addTo(mapInstance);
        setMapCoords({ lat: latlng.lat, lng: latlng.lng });
      };

      mapInstance.on('click', (e: any) => {
        updateMarker(e.latlng);
      });

      mapInstance.locate({setView: true, maxZoom: 16});
      mapInstance.on('locationfound', (e: any) => {
         updateMarker(e.latlng);
      });
      
      const LocateControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
          const btn = L.DomUtil.create('button', '', container);
          btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/></svg>`;
          btn.style.cssText = "background: white; border: none; width: 44px; height: 44px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.25);";
          
          btn.onclick = function(e: any) {
            e.preventDefault();
            e.stopPropagation();
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition((position) => {
                const latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
                mapInstance.setView(latlng, 16);
                updateMarker(latlng);
              });
            }
          };
          return container;
        }
      });
      new LocateControl().addTo(mapInstance);
    };

    if (!(window as any).L) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      setTimeout(initMap, 100);
    }

    return () => { if (mapInstance) mapInstance.remove(); };
  }, [showMap]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
        <Loader2 className="animate-spin" size={40} color={colors.accent} />
      </div>
    );
  }

  if (items.length === 0 && !success) {
    return (
      <div style={{ paddingTop: '160px', minHeight: '100vh', textAlign: 'center', background: colors.bg, color: colors.text }}>
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>No item selected</h2>
        <button onClick={() => router.push('/menu')} style={{ padding: '0.8rem 2rem', borderRadius: '30px', background: colors.accent, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Return to Menu</button>
      </div>
    );
  }

  const subtotal = items.reduce((acc, it) => acc + (parseFloat(it.price) * (it.quantity || 1)), 0);
  const discount = subtotal * 0.20;
  const total = subtotal - discount;

  const inputStyle = {
    width: '100%',
    padding: '1.2rem',
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    background: 'rgba(20, 104, 69, 0.05)',
    color: '#041c0b',
    fontSize: '1rem',
    outline: 'none',
    marginBottom: '1.2rem',
  };

  return (
    <div className="page-main-wrapper" style={{ paddingBottom: '6rem', color: colors.text, fontFamily: 'var(--font-inter), sans-serif' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {success ? (
          <div style={{ background: colors.surfaceSolid, border: `1px solid ${colors.border}`, padding: '6rem 2rem', borderRadius: '40px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(20, 104, 69, 0.1)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>
              <CheckCircle2 size={50} color={colors.accent} />
            </div>
            <h3 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 900, color: colors.accent }}>Transaction Confirmed</h3>
            <p style={{ color: colors.textMuted, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
              Welcome to the movement. Your order has been registered in our carbon-neutral pipeline.
            </p>
            <button onClick={() => router.push('/orders')} style={{ padding: '1.2rem 4rem', fontSize: '1.1rem', borderRadius: '35px', background: colors.accent, color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
              Track Manifest &rarr;
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '3rem', paddingTop: '120px' }}>
              <Link href="/menu" style={{ color: colors.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <ArrowLeft size={20} /> BACK TO MENU
              </Link>
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 10vw, 4.5rem)', 
              fontWeight: 900, 
              marginBottom: '2rem', 
              letterSpacing: '-0.05em', 
              color: '#041c0b',
              lineHeight: 0.9,
              fontFamily: 'Oswald, sans-serif'
            }}>
              CHECKOUT <span style={{ color: colors.accent }}>REGISTER</span>
            </h1>
            
            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'start' }}>
              
              <div className="checkout-form-col">
                <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* SECTION 01 */}
                  <div className="form-card-section" style={{ 
                    background: '#ffffff', 
                    borderRadius: '28px', 
                    padding: '2rem', 
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                  }}>
                    <h3 style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 900, 
                      margin: '0 0 1.8rem', 
                      color: colors.accent, 
                      fontFamily: 'Oswald, sans-serif', 
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      01. Contact Details
                    </h3>
                    <input style={inputStyle} placeholder="Identity Email" required type="email" value={email} onChange={e=>setEmail(e.target.value)} />
                    <input style={inputStyle} placeholder="Contact Number (Link Active)" required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} />
                  </div>

                  {/* SECTION 02 */}
                  <div className="form-card-section" style={{ 
                    background: '#ffffff', 
                    borderRadius: '28px', 
                    padding: '2rem', 
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.8rem', gap: '10px' }}>
                      <h3 style={{ 
                        fontSize: '1.2rem', 
                        fontWeight: 900, 
                        margin: 0, 
                        color: colors.accent, 
                        fontFamily: 'Oswald, sans-serif', 
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        02. Logistics
                      </h3>
                      <button 
                        type="button" 
                        onClick={handleSetLocation} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          background: locationUrl ? colors.accent : 'rgba(20, 104, 69, 0.05)', 
                          color: locationUrl ? '#fff' : colors.accent, 
                          border: `1px solid ${colors.accent}`, 
                          padding: '0.5rem 1rem', 
                          borderRadius: '30px', 
                          fontWeight: 800, 
                          cursor: 'pointer',
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <MapPin size={14} /> {locationUrl ? 'Pin Confirmed' : 'Drop Delivery Pin'}
                      </button>
                    </div>
                    <input style={inputStyle} placeholder="Recipient Full Name" required value={customerName} onChange={e=>setCustomerName(e.target.value)} />
                    <input style={inputStyle} placeholder="Street Address / Building" required value={address} onChange={e=>setAddress(e.target.value)} />
                    <div className="address-sub-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                      <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
                      <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Zip Code" value={pinCode} onChange={e=>setPinCode(e.target.value)} />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={processing} 
                    style={{ 
                      width: '100%', 
                      padding: '1.5rem', 
                      background: colors.accent, 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '50px', 
                      fontSize: '1.2rem', 
                      fontWeight: 900, 
                      cursor: 'pointer', 
                      opacity: processing ? 0.7 : 1,
                      boxShadow: '0 12px 30px rgba(20, 104, 69, 0.2)',
                      transition: '0.3s',
                      fontFamily: 'Oswald, sans-serif',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginTop: '1rem'
                    }}
                  >
                    {processing ? "SYNCHRONIZING..." : "EXECUTE PURCHASE"}
                  </button>
                </form>
              </div>

              <div className="checkout-summary-col">
                <div className="summary-card" style={{ background: '#fff', borderRadius: '35px', padding: '2.5rem', border: `1px solid ${colors.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2.5rem', color: '#041c0b', fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Asset Manifest <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', background: 'rgba(20, 104, 69, 0.1)', color: colors.accent, borderRadius: '20px' }}>Verified</span>
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                        <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                          <img src={it.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                          <div style={{ position: 'absolute', top: '-8px', right: '-8px', width: '22px', height: '22px', background: colors.accent, color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 900 }}>{it.quantity || 1}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase' }}>{it.name}</h4>
                          <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: colors.textMuted, fontWeight: 600 }}>₹{parseFloat(it.price).toFixed(0)} / unit</p>
                        </div>
                        <div style={{ fontWeight: 900, color: '#041c0b' }}>₹{(parseFloat(it.price) * (it.quantity || 1)).toFixed(0)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: `1px dashed ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted, fontSize: '0.85rem', fontWeight: 700 }}><span>Value</span><span>₹{subtotal.toFixed(0)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.accent, fontSize: '0.85rem', fontWeight: 800 }}><span>Shipping</span><span>FREE</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff6b6b', fontSize: '0.85rem', fontWeight: 800 }}><span>Discount</span><span>-₹{discount.toFixed(0)}</span></div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: colors.accent, margin: '1.5rem -2.5rem -2.5rem', padding: '2.5rem', borderBottomLeftRadius: '35px', borderBottomRightRadius: '35px', color: '#fff' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, fontFamily: 'Oswald, sans-serif' }}>GRAND TOTAL</span>
                      <span style={{ fontSize: '2.4rem', fontWeight: 900 }}>₹{total.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '2rem', background: 'rgba(20, 104, 69, 0.05)', borderRadius: '25px', padding: '1.5rem', border: `1px dotted ${colors.accent}`, textAlign: 'center' }}>
                  <p style={{ color: colors.accent, fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>✦ Your purchase removes approx. {(total * 0.05).toFixed(1)}kg of CO2.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {showMap && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '800px', borderRadius: '32px', overflow: 'hidden', position: 'relative' }}>
             <div style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#041c0b', fontSize: '2.2rem', fontWeight: 900, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>Select Delivery <span style={{ color: colors.accent }}>Pin</span></h3>
                    <p style={{ color: colors.pale, margin: '8px 0 0', fontWeight: 600, fontSize: '0.9rem' }}>Tap exactly where you want your order delivered.</p>
                  </div>
                  <button onClick={() => setShowMap(false)} style={{ background: '#f8f8f8', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>
                <div id="map-picker" style={{ width: '100%', height: '400px', borderRadius: '24px', background: '#f0f0f0', border: '1px solid #eee' }}></div>
                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.2rem' }}>
                   <button onClick={() => setShowMap(false)} style={{ flex: 1, padding: '1.2rem', borderRadius: '40px', border: '2px solid #eee', background: 'transparent', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                   <button onClick={confirmMapLocation} style={{ flex: 2, padding: '1.2rem', borderRadius: '40px', border: 'none', background: colors.accent, color: '#fff', fontWeight: 900, cursor: 'pointer', textTransform: 'uppercase' }}>Confirm Pin</button>
                </div>
             </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700;900&family=Inter:wght@400;600;700;800&display=swap');
        .checkout-grid { transition: 0.3s; }
        @media (max-width: 900px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .checkout-summary-col { order: -1; }
        }
      `}} />
    </div>
  );
}
