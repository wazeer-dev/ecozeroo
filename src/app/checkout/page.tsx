'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
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
  const [countryCode, setCountryCode] = useState('+91');
  const [locationUrl, setLocationUrl] = useState('');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'cod' or 'online'
  const [distance, setDistance] = useState<number | null>(null);
  const [shippingFee, setShippingFee] = useState(0);

  const COMPANY_COORDS = { lat: 10.8505, lng: 76.2711 }; // Fixed HQ Location
 
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", 
    "Ladakh", "Lakshadweep", "Puducherry"
  ];
 
  const router = useRouter();

  const colors = {
    bg: 'var(--bg-color)',
    surface: 'rgba(255, 255, 255, 0.03)',
    surfaceSolid: '#0a2a16',
    border: 'rgba(255, 255, 255, 0.1)',
    accent: '#cddc39',
    pale: '#e0f2f1',
    text: '#ffffff',
    textMuted: 'rgba(255, 255, 255, 0.6)'
  };

  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{lat: number, lng: number} | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const RAZORPAY_KEY_ID = "rzp_test_SavjbONhdqNazv";

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

  const handleSetLocation = async () => {
    setShowMap(true);
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  const confirmMapLocation = async () => {
    if (mapCoords) {
      const dist = calculateDistance(COMPANY_COORDS.lat, COMPANY_COORDS.lng, mapCoords.lat, mapCoords.lng);
      setDistance(dist);
      setIsGeocoding(true);
      
      // Dynamic Shipping Fee based on distance
      let fee = 0;
      if (dist > 15) fee = 99;
      else if (dist > 10) fee = 50;
      else if (dist > 5) fee = 30;
      else fee = 0; // Local delivery free
      
      setShippingFee(fee);
      
      // Auto-switch to online if too far for COD
      if (dist > 15 && paymentMethod === 'cod') setPaymentMethod('online');

      const url = `https://www.google.com/maps?q=${mapCoords.lat},${mapCoords.lng}`;
      setLocationUrl(url);
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${mapCoords.lat}&lon=${mapCoords.lng}&format=json&accept-language=en`);
        const data = await response.json();
        if (data && data.address) {
          const addr = data.address;
          const road = addr.road || addr.suburb || addr.neighbourhood || addr.pedestrian || addr.construction || '';
          const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.municipality || '';
          const stateName = addr.state || '';
          const pCode = addr.postcode || '';
          const detail = addr.amenity || addr.tourism || addr.neighbourhood || addr.suburb || addr.building || '';
          
          if (road) setAddress(road);
          if (cityName) setCity(cityName);
          if (detail && detail !== road) setAddressDetail(detail);
          
          if (stateName) {
            // Find the closest match in indianStates
            const matchedState = indianStates.find(s => 
              stateName.toLowerCase().includes(s.toLowerCase()) || 
              s.toLowerCase().includes(stateName.toLowerCase())
            );
            if (matchedState) setState(matchedState);
            else setState(stateName);
          }
          
          if (pCode) {
            // Clean postcode to 6 digits for India
            const cleanCode = pCode.replace(/\D/g, '').slice(0, 6);
            if (cleanCode.length === 6) setPinCode(cleanCode);
          }
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      } finally {
        setIsGeocoding(false);
        setShowMap(false);
        alert("📍 Delivery pin synchronized and address auto-filled.");
      }
    } else {
      alert("Please tap on the map to place your delivery pin first.");
    }
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutStep === 1) {
      setCheckoutStep(2);
      window.scrollTo(0, 0);
      return;
    }
    
    setProcessing(true);
    
    const subtotal = items.reduce((acc, it) => acc + (parseFloat(it.price) * (it.quantity || 1)), 0);
    const discount = subtotal * 0.20;
    const finalTotal = subtotal - discount + shippingFee;

    const createOrderRecord = async (paymentId: string = "COD_PENDING") => {
      try {
        const newOrder = {
          customer: customerName || 'Guest User',
          email: email || '',
          phone: `${countryCode} ${phone}`.trim(),
          address: `${address}, ${addressDetail}, ${city}, ${state} - ${pinCode}`,
          locationUrl: locationUrl || '',
          distance: distance ? `${distance.toFixed(2)} km` : '0 km',
          shippingFee: shippingFee,
          paymentMethod: paymentMethod,
          paymentId: paymentId,
          total: finalTotal,
          status: 'Processing',
          date: new Date().toISOString(),
          items: items.map(it => ({ id: it.id, name: it.name, image: it.image, price: it.price, quantity: it.quantity || 1 }))
        };
        
        await addDoc(collection(db, 'orders'), newOrder);
        
        // Stock Update
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
        
        // Cleanup
        localStorage.removeItem('ecozero_checkout_item');
        localStorage.removeItem('ecozero_cart');
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (err) {
        console.error("Error creating order:", err);
        alert("Critical failure during order persistence.");
        setProcessing(false);
      }
    };

    if (paymentMethod === 'online') {
      if (!(window as any).Razorpay) {
        alert("Razorpay SDK could not be loaded. Please check your internet connection and try again.");
        setProcessing(false);
        return;
      }

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: Math.round(finalTotal * 100), // amount in paise
        currency: "INR",
        name: "EcoZero",
        description: "Organic & Sustainable Marketplace",
        image: "https://i.ibb.co/bc2b31e802ebfbc0450bf45cfef8cf02/logo.png",
        handler: function (response: any) {
          createOrderRecord(response.razorpay_payment_id);
        },
        prefill: {
          name: customerName,
          email: email,
          contact: phone
        },
        theme: {
          color: "#cddc39"
        },
        modal: {
          ondismiss: function() {
            setProcessing(false);
          }
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } else {
      await createOrderRecord();
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
  const total = subtotal - discount + shippingFee;

  const inputStyle = {
    width: '100%',
    padding: '1.2rem',
    borderRadius: '16px',
    border: `1px solid ${colors.border}`,
    background: 'rgba(255, 255, 255, 0.05)',
    color: '#ffffff',
    fontSize: '1rem',
    outline: 'none',
    marginBottom: '1.2rem',
  };

  return (
    <div className="page-main-wrapper" style={{ background: 'var(--bg-color)', paddingBottom: '6rem', color: '#fff', fontFamily: 'var(--font-inter), sans-serif' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        <Script 
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />

        {success ? (
          <div className="success-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: `1px solid ${colors.border}`, padding: '6rem 2rem', borderRadius: '40px', textAlign: 'center' }}>
            <div style={{ background: 'rgba(20, 104, 69, 0.1)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>
              <CheckCircle2 size={50} color={colors.accent} />
            </div>
            <h3 className="success-title" style={{ fontSize: '3rem', marginBottom: '1.5rem', fontWeight: 900, color: colors.accent }}>Transaction Confirmed</h3>
            <p className="success-desc" style={{ color: colors.textMuted, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem', lineHeight: '1.6' }}>
              Welcome to the movement. Your order has been registered in our carbon-neutral pipeline.
            </p>
            <button className="success-btn" onClick={() => router.push('/orders')} style={{ padding: '1.2rem 4rem', fontSize: '1.1rem', borderRadius: '35px', background: colors.accent, color: '#fff', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
              Track Manifest &rarr;
            </button>
            <style dangerouslySetInnerHTML={{ __html: `
              @media (max-width: 600px) {
                .success-card { padding: 3rem 1rem !important; }
                .success-title { font-size: 2rem !important; }
                .success-desc { font-size: 1rem !important; }
                .success-btn { padding: 1rem 2rem !important; font-size: 1rem !important; }
              }
            `}} />
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '3rem', paddingTop: '120px' }}>
              <Link href="/menu" onClick={(e) => { if (checkoutStep === 2) { e.preventDefault(); setCheckoutStep(1); } }} style={{ color: '#cddc39', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                <ArrowLeft size={20} /> {checkoutStep === 1 ? 'BACK TO MENU' : 'BACK TO INFO'}
              </Link>
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 10vw, 4.5rem)', 
              fontWeight: 900, 
              marginBottom: '2rem', 
              letterSpacing: '-0.05em', 
              color: '#ffffff',
              lineHeight: 0.9,
              fontFamily: 'Oswald, sans-serif'
            }}>
              CHECK OUT <span style={{ color: colors.accent }}>NOW</span>
            </h1>
            
            <div className="checkout-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem', alignItems: 'start' }}>
              
              <div className="checkout-form-col">
                <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {checkoutStep === 1 && (
                    <>
                      {/* SECTION 01 */}
                      <div className="form-card-section" style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        borderRadius: '28px', 
                        padding: '2rem', 
                        border: `1px solid ${colors.border}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
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
                          01. Contact Info
                        </h3>
                        <input style={inputStyle} placeholder="Identity Email" required type="email" value={email} onChange={e=>setEmail(e.target.value)} />
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.2rem', alignItems: 'stretch' }}>
                          <div style={{ 
                            ...inputStyle, width: 'auto', marginBottom: 0, 
                            display: 'flex', alignItems: 'center', gap: '8px', 
                            padding: '0 1.2rem', background: 'rgba(20, 104, 69, 0.08)',
                            height: '58px', flexShrink: 0
                          }}>
                            <span style={{ fontSize: '1.2rem' }}>🇮🇳</span>
                            <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>+91</span>
                          </div>
                          <input 
                            style={{ ...inputStyle, marginBottom: 0, flex: 1, height: '58px' }} 
                            placeholder="10-Digit Mobile Number" 
                            required 
                            type="tel" 
                            value={phone} 
                            onChange={e => {
                              let val = e.target.value.replace(/\D/g, '');
                              if (val.startsWith('0')) val = val.substring(1);
                              setPhone(val.slice(0, 10));
                            }} 
                          />
                        </div>
    
                        <style dangerouslySetInnerHTML={{ __html: `
                          .country-code-option:hover { background: rgba(20, 104, 69, 0.05); }
                        `}} />
                      </div>

                      {/* SECTION 02 */}
                      <div className="form-card-section" style={{ 
                        background: 'rgba(255, 255, 255, 0.03)', 
                        borderRadius: '28px', 
                        padding: '2rem', 
                        border: `1px solid ${colors.border}`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
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
                            02. Shipping Info
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
                            <MapPin size={14} /> {locationUrl ? 'Address Saved' : 'Set Location'}
                          </button>
                        </div>
                        <input style={inputStyle} placeholder="Full Name" required value={customerName} onChange={e=>setCustomerName(e.target.value)} />
                        <input style={inputStyle} placeholder="Address" required value={address} onChange={e=>setAddress(e.target.value)} />
                        <input style={inputStyle} placeholder="Road, Apartment, Near by hotel, etc.." value={addressDetail} onChange={e=>setAddressDetail(e.target.value)} />
                        <div className="address-sub-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', flexWrap: 'wrap' }}>
                          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="City" value={city} onChange={e=>setCity(e.target.value)} />
                          
                          {/* State Dropdown */}
                          <div style={{ position: 'relative' }}>
                            <div 
                              onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
                              style={{ ...inputStyle, marginBottom: 0, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                              <span style={{ color: state ? colors.text : colors.textMuted }}>{state || 'Select State'}</span>
                              <ChevronDown size={18} style={{ transition: '0.3s', transform: isStateDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                            </div>
                            {isStateDropdownOpen && (
                              <div style={{ 
                                position: 'absolute', bottom: '100%', left: 0, right: 0, 
                                maxHeight: '200px', overflowY: 'auto', background: '#fff', 
                                zIndex: 100, border: `1px solid ${colors.border}`, 
                                borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                marginBottom: '5px'
                              }}>
                                {indianStates.map(s => (
                                  <div 
                                    key={s} 
                                    onClick={() => { setState(s); setIsStateDropdownOpen(false); }}
                                    style={{ padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '0.9rem', color: colors.text }}
                                    className="state-option"
                                  >
                                    {s}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <input style={{ ...inputStyle, marginBottom: 0 }} placeholder="Pin Code" value={pinCode} onChange={e=>setPinCode(e.target.value)} maxLength={6} />
                        </div>
    
                        <style dangerouslySetInnerHTML={{ __html: `
                          .state-option:hover { background: rgba(20, 104, 69, 0.05); }
                          @media (max-width: 600px) {
                            .address-sub-grid { grid-template-columns: 1fr !important; }
                          }
                        `}} />
                      </div>
                    </>
                  )}

                  {checkoutStep === 2 && (
                    <div className="form-card-section" style={{ 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      borderRadius: '28px', 
                      padding: '2rem', 
                      border: `2px solid ${colors.accent}`,
                      boxShadow: '0 8px 30px rgba(20, 104, 69, 0.1)',
                      marginBottom: '1rem'
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
                        03. Payment Method
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div 
                          onClick={() => setPaymentMethod('online')}
                          style={{ 
                            padding: '1.2rem', border: `2px solid ${paymentMethod === 'online' ? colors.accent : '#eee'}`, 
                            borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                            background: paymentMethod === 'online' ? 'rgba(20, 104, 69, 0.05)' : 'transparent',
                            transition: '0.3s'
                          }}
                        >
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${colors.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             {paymentMethod === 'online' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.accent }} />}
                          </div>
                          <div>
                             <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>Online Payment</p>
                             <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(4, 28, 11, 0.6)' }}>Credit/Debit Card, UPI, Net Banking</p>
                          </div>
                        </div>

                        <div 
                          onClick={() => {
                             if (distance && distance > 15) {
                                alert("COD is only available within 15km of our headquarters. Please use Online Payment for this distance.");
                                return;
                             }
                             setPaymentMethod('cod');
                          }}
                          style={{ 
                            padding: '1.2rem', border: `2px solid ${paymentMethod === 'cod' ? colors.accent : '#eee'}`, 
                            borderRadius: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px',
                            background: paymentMethod === 'cod' ? 'rgba(20, 104, 69, 0.05)' : 'transparent',
                            transition: '0.3s',
                            opacity: (distance && distance > 15) ? 0.5 : 1
                          }}
                        >
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: `2px solid ${colors.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             {paymentMethod === 'cod' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: colors.accent }} />}
                          </div>
                          <div>
                             <p style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: '#ffffff' }}>Cash on Delivery (COD)</p>
                             <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(4, 28, 11, 0.6)' }}>
                                {distance && distance > 15 
                                  ? `Not available for this distance (${distance.toFixed(1)} km)` 
                                  : 'Pay when you receive your order'
                                }
                             </p>
                          </div>
                        </div>
                      </div>

                      <p onClick={() => setCheckoutStep(1)} style={{ marginTop: '1.5rem', fontSize: '0.8rem', fontWeight: 700, color: colors.accent, textAlign: 'center', cursor: 'pointer', textDecoration: 'underline' }}>
                        &larr; Back to Information
                      </p>
                    </div>
                  )}

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
                    {processing ? "PLACING ORDER..." : (checkoutStep === 1 ? "NEXT: CHOOSE PAYMENT" : "PLACE ORDER NOW")}
                  </button>
                </form>
              </div>

              <div className="checkout-summary-col">
                <div className="summary-card" style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '35px', padding: '2.5rem', border: `1px solid ${colors.border}`, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '2.5rem', color: '#ffffff', fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Cart Summary <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 10px', background: 'rgba(20, 104, 69, 0.1)', color: colors.accent, borderRadius: '20px' }}>SECURE</span>
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
                        <div style={{ fontWeight: 900, color: '#ffffff' }}>₹{(parseFloat(it.price) * (it.quantity || 1)).toFixed(0)}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: `1px dashed ${colors.border}`, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.textMuted, fontSize: '0.85rem', fontWeight: 700 }}><span>Items Total</span><span>₹{(subtotal - discount).toFixed(0)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: colors.accent, fontSize: '0.85rem', fontWeight: 800 }}><span>Shipping {distance ? `(${distance.toFixed(1)} km)` : ''}</span><span>{shippingFee > 0 ? `₹${shippingFee}` : 'FREE'}</span></div>
                    
                    <div className="grand-total-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: colors.accent, margin: '1.5rem -2.5rem -2.5rem', padding: '2.5rem', borderBottomLeftRadius: '35px', borderBottomRightRadius: '35px', color: '#fff' }}>
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
          <div className="map-modal-card" style={{ background: '#fff', width: '100%', maxWidth: '800px', borderRadius: '32px', overflow: 'hidden', position: 'relative' }}>
             <div className="map-modal-inner" style={{ padding: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#ffffff', fontSize: '2.2rem', fontWeight: 900, fontFamily: 'Oswald, sans-serif', textTransform: 'uppercase' }}>Select Delivery <span style={{ color: colors.accent }}>Pin</span></h3>
                    <p style={{ color: colors.pale, margin: '8px 0 0', fontWeight: 600, fontSize: '0.9rem' }}>Tap exactly where you want your order delivered.</p>
                  </div>
                  <button onClick={() => setShowMap(false)} style={{ background: '#f8f8f8', border: 'none', width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                </div>
                <div id="map-picker" style={{ width: '100%', height: '400px', borderRadius: '24px', background: '#f0f0f0', border: '1px solid #eee' }}></div>
                <div className="confirm-btn-wrap" style={{ marginTop: '2.5rem', display: 'flex', gap: '1.2rem' }}>
                   <button onClick={() => setShowMap(false)} style={{ flex: 1, padding: '1.2rem', borderRadius: '40px', border: '2px solid #eee', background: 'transparent', fontWeight: 800, cursor: 'pointer' }}>Cancel</button>
                   <button 
                     onClick={confirmMapLocation} 
                     disabled={isGeocoding}
                     style={{ 
                       flex: 2, padding: '1.2rem', borderRadius: '40px', border: 'none', 
                       background: colors.accent, color: '#fff', fontWeight: 900, 
                       cursor: isGeocoding ? 'not-allowed' : 'pointer', textTransform: 'uppercase',
                       display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                       opacity: isGeocoding ? 0.7 : 1
                     }}
                   >
                     {isGeocoding ? <><Loader2 size={20} className="animate-spin" /> Identifying...</> : 'Confirm Pin'}
                   </button>
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
        @media (max-width: 600px) {
          .map-modal-inner { padding: 1.2rem !important; }
          .map-modal-card { border-radius: 20px !important; }
          #map-picker { height: 350px !important; }
          .map-modal-inner h3 { fontSize: 1.6rem !important; }
          .map-modal-inner p { fontSize: 0.8rem !important; }
          .confirm-btn-wrap { flex-direction: column-reverse !important; gap: 0.8rem !important; }
          
          /* Checkout Responsiveness */
          .form-card-section { padding: 1.2rem !important; }
          .summary-card { padding: 1.5rem !important; }
          .grand-total-section { margin: 1.5rem -1.5rem -1.5rem !important; padding: 1.5rem !important; }
          
          /* Success Screen Responsiveness */
          .success-card { padding: 4rem 1.2rem !important; border-radius: 24px !important; }
          .success-title { font-size: 2rem !important; margin-bottom: 1rem !important; }
          .success-desc { font-size: 1rem !important; margin-bottom: 2rem !important; padding: 0 10px !important; }
          .success-btn { padding: 1rem 2.5rem !important; font-size: 1rem !important; width: 100% !important; }
        }
        @media (max-width: 400px) {
           .map-modal-inner { padding: 1rem !important; }
           #map-picker { height: 300px !important; }
           .summary-card { padding: 1rem !important; border-radius: 24px !important; }
           .form-card-section { padding: 1rem !important; border-radius: 20px !important; }
           .grand-total-section { margin: 1.5rem -1rem -1rem !important; padding: 1.5rem 1rem !important; }
           .grand-total-section span:first-child { font-size: 1rem !important; }
           .grand-total-section span:last-child { font-size: 1.8rem !important; }
           
           .success-card { padding: 3rem 1rem !important; }
           .success-title { font-size: 1.8rem !important; }
           .success-desc { font-size: 0.9rem !important; }
        }
      `}} />
    </div>
  );
}
