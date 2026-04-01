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
    bg: 'rgb(215, 232, 188)',
    surface: 'rgba(60, 120, 20, 0.05)',
    surfaceSolid: '#ffffff',
    border: 'rgba(60, 120, 20, 0.15)',
    accent: '#3c7814',
    pale: '#5a7a40',
    text: 'rgb(4, 28, 11)',
    textMuted: 'rgba(60, 120, 20, 0.7)'
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
      
      // Save address locally
      const newAddress = { name: customerName, phone, address, detail: addressDetail, city, state, pin: pinCode, id: Date.now().toString() };
      const savedAddresses = JSON.parse(localStorage.getItem('ecozero_addresses') || '[]');
      const addressString = `${address}${city}${pinCode}`.toLowerCase().replace(/\s/g, '');
      const alreadyExists = savedAddresses.some((a: any) => `${a.address}${a.city}${a.pin}`.toLowerCase().replace(/\s/g, '') === addressString);
      if (!alreadyExists) {
        localStorage.setItem('ecozero_addresses', JSON.stringify([...savedAddresses, newAddress]));
      }

      // Update stock
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
      
      // Update wishlist
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

      // Cleanup existing map if it somehow exists
      const container = L.DomUtil.get('map-picker');
      if (container) {
        (container as any)._leaflet_id = null;
      }

      // Initial view - Using Google Maps Hybrid Layer for premium feel
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

      // Add simple layer control
      L.control.layers({
        "Google Streets": googleStreets,
        "Google Satellite": googleHybrid
      }).addTo(mapInstance);

      // Fix for default Leaflet icon not appearing with CDN
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

      // Show user location first automatically
      mapInstance.locate({setView: true, maxZoom: 16});
      mapInstance.on('locationfound', (e: any) => {
         updateMarker(e.latlng);
      });
      
      mapInstance.on('locationerror', () => {
        console.warn("Location access denied. Defaulting to regional view.");
      });

      // Add Locate Control (Your Location Button)
      const LocateControl = L.Control.extend({
        options: { position: 'topleft' },
        onAdd: function() {
          const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
          const btn = L.DomUtil.create('button', '', container);
          btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4285F4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/></svg>`;
          btn.title = "Your Location";
          btn.style.cssText = "background: white; border: none; width: 44px; height: 44px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.25); transition: 0.2s;";
          
          btn.onclick = function(e: any) {
            e.preventDefault();
            e.stopPropagation();
            btn.style.background = "#f0f0f0";
            
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition((position) => {
                const latlng = { lat: position.coords.latitude, lng: position.coords.longitude };
                mapInstance.setView(latlng, 16);
                updateMarker(latlng);
                btn.style.background = "white";
              }, (error) => {
                alert("Location Error: " + error.message);
                btn.style.background = "white";
              }, { enableHighAccuracy: true });
            } else {
              alert("Geolocation is not supported by your browser.");
              btn.style.background = "white";
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

    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
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
        <button onClick={() => router.push('/menu')} className="btn-primary" style={{ padding: '0.8rem 2rem', borderRadius: '30px', background: colors.accent, color: colors.bg, border: 'none', fontWeight: 700, cursor: 'pointer' }}>Return to Menu</button>
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
    background: 'rgba(60, 120, 20, 0.05)',
    color: 'rgb(4, 28, 11)',
    fontSize: '1rem',
    outline: 'none',
    marginBottom: '1.2rem',
    transition: 'border-color 0.2s'
  };


  return (
    <div className="page-main-wrapper" style={{ paddingBottom: '6rem', color: colors.text, fontFamily: 'var(--font-inter), sans-serif' }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        
        {success ? (
          <div style={{ background: colors.surfaceSolid, border: `1px solid ${colors.border}`, padding: '6rem 2rem', borderRadius: '40px', textAlign: 'center', animation: 'fadeIn 0.6s ease' }}>
            <div style={{ background: 'rgba(136, 198, 95, 0.1)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>
              <CheckCircle2 size={50} color={colors.accent} />
            </div>
            <h3 style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 900, color: colors.accent }}>Transaction Confirmed</h3>
            <p style={{ color: colors.textMuted, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
              Welcome to the movement. Your order has been registered in our carbon-neutral pipeline.
            </p>
            <button onClick={() => router.push('/orders')} style={{ padding: '1.2rem 4rem', fontSize: '1.1rem', borderRadius: '35px', background: colors.accent, color: colors.bg, border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: `0 10px 30px rgba(136, 198, 95, 0.3)` }}>
              Track Manifest &rarr;
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '3rem' }}>
              <Link href="/menu" style={{ color: colors.accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <ArrowLeft size={20} /> BACK TO MENU
              </Link>
            </div>
            
            <h1 style={{ fontSize: '3.5rem', fontWeight: 900, marginBottom: '4rem', letterSpacing: '-2px', color: 'rgb(4, 28, 11)' }}>Checkout <span style={{ color: colors.accent }}>Register</span></h1>
            
            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '5rem', alignItems: 'start' }}>
              
              {/* LEFT: FORM */}
              <div className="checkout-form-col checkout-form-card" style={{ background: colors.surfaceSolid, borderRadius: '40px', padding: '3.5rem', border: `1px solid ${colors.border}` }}>
                <form onSubmit={handlePayment}>
                  
                  <div style={{ marginBottom: '3.5rem' }}>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 2rem', color: colors.accent }}>01. Contact Details</h3>
                    <input style={inputStyle} placeholder="Identity Email" required type="email" value={email} onChange={e=>setEmail(e.target.value)} />
                    <input style={inputStyle} placeholder="Contact Number (Terminal Access)" required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} />
                    <p style={{ fontSize: '0.85rem', color: colors.textMuted, marginTop: '-0.5rem' }}>Used for logistics synchronization and delivery alerts.</p>
                  </div>

                  <div style={{ marginBottom: '3.5rem' }}>
                    <div className="checkout-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: colors.accent }}>02. Logistics Protocol</h3>
                      <button 
                        type="button"
                        onClick={handleSetLocation}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', background: locationUrl ? 'rgba(60, 120, 20, 0.15)' : 'rgba(60, 120, 20, 0.05)', color: colors.accent, border: `1px solid ${locationUrl ? colors.accent : colors.border}`, padding: '0.8rem 1.4rem', borderRadius: '14px', fontWeight: 700, cursor: 'pointer', transition: '0.3s' }}
                        className="location-pin-btn"
                      >
                        <MapPin size={18} /> {locationUrl ? 'Pin Confirmed' : 'Pick Location Pin'}
                      </button>
                    </div>
                    
                    <input style={inputStyle} placeholder="Full Recipient Name" required value={customerName} onChange={e=>setCustomerName(e.target.value)} />
                    <input style={inputStyle} placeholder="Permanent Address" required value={address} onChange={e=>setAddress(e.target.value)} />
                    <input style={inputStyle} placeholder="Locality Details (Near Landmark, etc.)" value={addressDetail} onChange={e=>setAddressDetail(e.target.value)} />
                    
                    <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.2rem' }}>
                      <input style={inputStyle} placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
                      <div style={{ position: 'relative' }}>
                        <div 
                          onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                          style={{ ...inputStyle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ffffff' }}
                        >
                          <span style={{ color: state ? 'rgb(4, 28, 11)' : 'rgba(60, 120, 20, 0.4)' }}>{state || 'State'}</span>
                          <ChevronDown size={18} style={{ transition: 'transform 0.3s', transform: isStateDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </div>
                        {isStateDropdownOpen && (
                          <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', background: '#ffffff', border: `1px solid ${colors.border}`, borderRadius: '16px', overflow: 'hidden', zIndex: 100, marginBottom: '8px' }}>
                            {['Kerala', 'Karnataka', 'Tamil Nadu'].map((s) => (
                              <div key={s} onClick={() => { setState(s); setIsStateDropdownOpen(false); }} style={{ padding: '1rem 1.4rem', cursor: 'pointer', background: state === s ? colors.accent : 'transparent', color: state === s ? '#ffffff' : 'rgb(4, 28, 11)', transition: '0.2s', fontWeight: state === s ? 800 : 500 }}>{s}</div>
                            ))}
                          </div>
                        )}
                      </div>
                      <input style={inputStyle} placeholder="Zip Code" value={pinCode} onChange={e=>setPinCode(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.6rem', fontWeight: 800, margin: '0 0 2rem', color: colors.accent }}>03. Payment Interface</h3>
                    <div className="payment-block" style={{ padding: '2rem', background: 'rgba(136, 198, 95, 0.05)', borderRadius: '24px', border: `1px solid ${colors.accent}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: 0, fontWeight: 900, fontSize: '1.1rem', color: 'rgb(4, 28, 11)' }}>Unified Digital Gateway <span style={{ color: colors.accent, fontSize: '0.8rem', fontWeight: 600 }}>(MOCK)</span></p>
                        <p style={{ margin: '0.6rem 0 0', fontSize: '0.85rem', color: colors.textMuted, maxWidth: '350px' }}>Securely authenticated transaction via encryption layer. No real funds will be deducted in this simulation.</p>
                      </div>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: colors.accent, boxShadow: `0 0 10px ${colors.accent}` }}></div>
                    </div>
                  </div>

                  <button 
                    className="checkout-submit"
                    type="submit" 
                    disabled={processing}
                    style={{ width: '100%', padding: '1.5rem', marginTop: '4rem', background: colors.accent, color: colors.bg, border: 'none', borderRadius: '40px', fontSize: '1.2rem', fontWeight: 900, cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', opacity: processing ? 0.7 : 1, boxShadow: `0 15px 40px rgba(136, 198, 95, 0.25)` }}
                  >
                    {processing ? "SYNCHRONIZING..." : "EXECUTE PURCHASE"}
                  </button>

                </form>
              </div>

              {/* RIGHT: SUMMARY */}
              <div className="checkout-summary-col" style={{ position: 'sticky', top: '120px' }}>
                <div className="summary-card" style={{ background: colors.surfaceSolid, borderRadius: '40px', padding: '3rem', border: `1px solid ${colors.border}`, marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '2.5rem', borderBottom: `1px solid ${colors.border}`, paddingBottom: '1.5rem' }}>Asset Manifest</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                    {items.map((it, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <div style={{ position: 'relative' }}>
                          <img src={it.image} alt={it.name} style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '16px', border: `1px solid ${colors.border}` }} />
                          <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '26px', height: '26px', background: colors.accent, color: colors.bg, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 900 }}>{it.quantity || 1}</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>{it.name}</h4>
                          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: colors.textMuted }}>₹{parseFloat(it.price).toFixed(0)} / unit</p>
                        </div>
                        <div style={{ fontWeight: 800, color: colors.accent }}>₹{(parseFloat(it.price) * (it.quantity || 1)).toFixed(0)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted }}><span>Inventory Value</span><span>₹{subtotal.toFixed(0)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.accent }}><span>Carbon-Free Shipping</span><span>FREE</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ff6b6b' }}><span>Member Discount (-20%)</span><span>-₹{discount.toFixed(0)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${colors.accent}`, marginTop: '1rem', paddingTop: '1.5rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900 }}>TOTAL</span>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: colors.accent }}>₹{total.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <div style={{ background: 'rgba(136, 198, 95, 0.05)', borderRadius: '25px', padding: '1.5rem', border: `1px dotted ${colors.accent}`, textAlign: 'center' }}>
                  <p style={{ color: colors.accent, fontSize: '0.85rem', margin: 0, fontWeight: 600 }}>✦ Your purchase removes approx. {(total * 0.05).toFixed(1)}kg of CO2 from the atmosphere.</p>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* MAP PICKER MODAL */}
      {showMap && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', width: '100%', maxWidth: '800px', borderRadius: '32px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
             <button onClick={() => setShowMap(false)} style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1001, background: '#fff', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>&times;</button>
             
             <div style={{ padding: '2.5rem' }} className="modal-content-padding">
                <h3 style={{ margin: '0 0 1.5rem', color: 'rgb(4, 28, 11)', fontSize: '1.8rem', fontWeight: 850 }}>Select Delivery Pin</h3>
                <p style={{ color: colors.pale, marginBottom: '2rem', fontWeight: 600 }}>Tap exactly where you want your eco-fresh order delivered.</p>
                
                <div id="map-picker" style={{ width: '100%', height: '400px', borderRadius: '20px', background: '#f0f0f0', border: '1px solid #eee', zIndex: 1 }}></div>

                <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1.5rem' }} className="modal-actions-container">
                   <button onClick={() => setShowMap(false)} style={{ flex: 1, padding: '1.2rem', borderRadius: '18px', border: '1.5px solid #eee', background: 'transparent', fontWeight: 700, cursor: 'pointer', color: 'rgb(4, 28, 11)' }}>Cancel</button>
                   <button onClick={confirmMapLocation} style={{ flex: 2, padding: '1.2rem', borderRadius: '18px', border: 'none', background: colors.accent, color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '1.1rem' }}>Confirm delivery location</button>
                </div>
             </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }

        .checkout-page .container { padding: 0 20px; }
        
        @media (max-width: 1000px) {
          .checkout-page .container > div > div:nth-child(3) {
            grid-template-columns: 1fr !important;
            gap: 2rem !important;
          }
          h1 { font-size: 2.5rem !important; }
        }

        @media (max-width: 768px) {
          .checkout-page .container {
            padding: 0 16px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          .checkout-page h1 {
            font-size: 2rem !important;
            letter-spacing: -1px !important;
            margin-bottom: 2rem !important;
          }
          /* Form card: reduce huge padding on mobile */
          .checkout-form-card {
            padding: 1.8rem !important;
            border-radius: 28px !important;
          }
          /* Section headers: stack vertically on mobile */
          .checkout-section-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 12px !important;
          }
          .checkout-section-header h3 {
            font-size: 1.3rem !important;
          }
          /* Location pin button: full width */
          .location-pin-btn {
            width: 100% !important;
            justify-content: center !important;
          }
          /* City/State/Zip: 2 columns instead of 3 */
          .address-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          /* Zip alone on second row */
          .address-grid > *:last-child {
            grid-column: 1 / -1 !important;
          }
          /* Payment block: stack text */
          .payment-block {
            flex-direction: column !important;
            gap: 12px !important;
          }
          /* Summary card */
          .summary-card {
            padding: 1.5rem !important;
            border-radius: 28px !important;
          }
          /* Submit button margin */
          .checkout-submit {
            margin-top: 2rem !important;
          }
          /* Reorder: Summary first on mobile */
          .checkout-grid {
            display: flex !important;
            flex-direction: column !important;
            gap: 1.5rem !important;
          }
          .checkout-summary-col {
            order: -1 !important;
            position: static !important;
          }
          .checkout-form-col {
            order: 1 !important;
          }
          /* Map Modal Full Screen Fix */
          .modal-content-padding {
            padding: 1.5rem !important;
          }
          #map-picker {
            height: 550px !important;
            border-radius: 12px !important;
          }
          .modal-actions-container {
            margin-top: 1.5rem !important;
            flex-direction: column !important;
            gap: 10px !important;
          }
          .modal-actions-container button {
            width: 100% !important;
            padding: 1rem !important;
          }
        }
      `}} />
    </div>
  );
}

