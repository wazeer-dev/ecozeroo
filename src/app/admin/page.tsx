'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  PackageSearch, 
  Truck, 
  LogOut, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag,
  Plus,
  Trash2,
  Image as ImageIcon,
  Users,
  Search,
  ChevronRight,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  ClipboardList,
  Edit2,
  Shield,
  Bell,
  Tag,
  Clock,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';

// Premium ECOZERO Color Palette - Light Mode Overhaul
const colors = {
  bg: '#D7E8BC',          // Light Sage (User Request)
  surface: 'rgba(4, 28, 11, 0.05)', 
  surfaceSolid: '#e1efc8', // Slightly more saturated sage for cards/sidebar
  border: 'rgba(4, 28, 11, 0.12)',
  accent: '#3c7814',      // Deeper forest green for clarity on light bg
  pale: '#041c0b',        // Darkest green for primary contrast
  text: '#041c0b',        // Solid dark forest green text
  textMuted: 'rgba(4, 28, 11, 0.65)'
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'delivery' | 'customers' | 'notifications' | 'descriptions' | 'auth'>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Product State
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [specifications, setSpecifications] = useState('');
  const [features, setFeatures] = useState('');
  const [expandedProductContent, setExpandedProductContent] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const handleExportPDF = () => {
    const originalTitle = document.title;
    const orderId = selectedOrder?.id || 'order';
    document.title = `ECOZERO_Manifest_${orderId}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 100);
  };

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // Notifications State
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifDesc, setNotifDesc] = useState('');
  const [notifType, setNotifType] = useState('update');
  const [notifTarget, setNotifTarget] = useState('all'); // 'all' or specific user email
  const [showNotifModal, setShowNotifModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Products
      const productsSnapshot = await getDocs(collection(db, 'products'));
      const productsData = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      productsData.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setProducts(productsData);

      // Fetch Orders
      const ordersSnapshot = await getDocs(collection(db, 'orders'));
      const ordersData = ordersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() as any }))
        .filter(order => order.status !== 'Cancelled');
      ordersData.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
      setOrders(ordersData);

      // Fetch Users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      setUsers(usersData);

      // Fetch Notifications
      const notifSnapshot = await getDocs(collection(db, 'notifications'));
      const notifData = notifSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      notifData.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setAdminNotifications(notifData);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=bc2b31e802ebfbc0450bf45cfef8cf02`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setImages(prev => [...prev, result.data.url]);
        setUploadProgress(100);
      } else {
        alert("Upload failed: " + result.error.message);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to connect to ImgBB.");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        category: category || 'General',
        image: images[0] || '', // Fallback for old code
        images: images,
        description: description,
        specifications: specifications,
        features: features,
        updatedAt: new Date().toISOString()
      };
      
      if (editingProduct) {
        // Update existing product
        const docRef = doc(db, 'products', editingProduct.id);
        await updateDoc(docRef, productData);
        setProducts(products.map(p => p.id === editingProduct.id ? { ...p, ...productData } : p));
        setSuccessMsg(`Updated ${name} successfully!`);
      } else {
        // Add new product
        const newProduct = { ...productData, createdAt: new Date().toISOString() };
        const docRef = await addDoc(collection(db, 'products'), newProduct);
        setProducts([{ id: docRef.id, ...newProduct }, ...products]);
        setSuccessMsg(`Added ${name} successfully!`);
      }
      
      setName('');
      setPrice('');
      setStock('');
      setCategory('');
      setImages([]);
      setDescription('');
      setSpecifications('');
      setFeatures('');
      setEditingProduct(null);
      setTimeout(() => {
        setSuccessMsg('');
        setShowAddModal(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Failed to save product. Check console.");
    }
  };

  const startEditProduct = (product: any) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setCategory(product.category);
    setImages(product.images || (product.image ? [product.image] : []));
    setDescription(product.description || '');
    setSpecifications(product.specifications || '');
    setFeatures(product.features || '');
    setShowAddModal(true);
  };

  const updateDelivery = async (id: string, newStatus: string) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status in live database.");
    }
  };

  const updateDeliveryDate = async (id: string, newDate: string) => {
    try {
      const orderRef = doc(db, 'orders', id);
      await updateDoc(orderRef, { deliveryDate: newDate });
      setOrders(orders.map(o => o.id === id ? { ...o, deliveryDate: newDate } : o));
    } catch (error) {
      console.error("Error updating delivery date:", error);
      alert("Failed to update delivery date in live database.");
    }
  };

  const deleteProduct = async (id: string) => {
    if(!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product. Check Firebase console permissions.");
    }
  };

  const deleteUser = async (id: string, email: string) => {
    if(!confirm(`PERMANENT ACTION: Delete user account for ${email}?`)) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      setUsers(users.filter(u => u.id !== id));
      setShowUserDetail(false);
      alert("User record purged successfully.");
    } catch (error) {
      console.error("Error purging user:", error);
      alert("Failed to delete user record.");
    }
  };

  // Prevent background scrolling if modal is open
  useEffect(() => {
    if (showAddModal || showOrderDetail || showUserDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showAddModal, showOrderDetail, showUserDetail, showNotifModal]);

  const handleSaveNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!notifTitle || !notifDesc) {
        alert("Please fill in both title and content.");
        return;
      }

      const newNotif = {
        title: notifTitle,
        desc: notifDesc,
        type: notifType || 'update',
        target: notifTarget, // 'all' or user email
        createdAt: new Date().toISOString(),
      };

      console.log("Attempting to save notification to Firestore...", newNotif);
      const docRef = await addDoc(collection(db, 'notifications'), newNotif);
      console.log("Notification saved with ID:", docRef.id);

      setAdminNotifications(prev => [{ id: docRef.id, ...newNotif }, ...prev]);
      
      // Reset form
      setNotifTitle('');
      setNotifDesc('');
      setNotifType('update');
      setNotifTarget('all');
      setShowNotifModal(false);
      
      setSuccessMsg("Broadcast released successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error: any) {
      console.error("CRITICAL: handleSaveNotification failed:", error);
      alert(`Firebase Broadcast Error: ${error.message || "Unknown Error"}. Ensure your Firestore Rules allow writes to the 'notifications' collection.`);
    }
  };

  const deleteNotification = async (id: string) => {
    if(!confirm("Delete this notification?")) return;
    try {
      await deleteDoc(doc(db, 'notifications', id));
      setAdminNotifications(adminNotifications.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const totalRevenue = orders.reduce((sum: any, order: any) => sum + (order.total || 0), 0);

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: colors.bg, color: colors.text, fontFamily: 'var(--font-inter), sans-serif' }}>
      {/* Dynamic Style Injection for Responsive Admin Panel */}
      <style dangerouslySetInnerHTML={{__html: `
        .navbar { display: none !important; }
        body { background-color: ${colors.bg} !important; margin: 0; padding: 0; }
        .admin-layout { padding-top: 0 !important; }
        
        @media (max-width: 900px) {
          .admin-sidebar { 
            position: fixed !important; 
            top: 0; 
            left: 0; 
            z-index: 10000; 
            height: 100vh !important; 
            transform: translateX(-100%); 
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
            box-shadow: 20px 0 50px rgba(0,0,0,0.5);
            width: 280px !important;
          }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-content { padding: 1.5rem !important; margin-left: 0 !important; }
          .mobile-menu-btn { display: flex !important; }
          .admin-header h2 { font-size: 1.8rem !important; }
          .stat-grid { grid-template-columns: 1fr !important; gap: 1rem !important; }
          .admin-modal { width: 95% !important; margin: 0 auto; max-height: 90vh !important; }
          .admin-modal-inner { padding: 1.5rem !important; }
          .admin-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; background: rgba(0,0,0,0.2); border-radius: 12px; }
          table { min-width: 700px; }
          .admin-header { margin-bottom: 2rem !important; flex-direction: column; align-items: flex-start !important; gap: 1rem; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media print {
          @page { 
            margin: 0; 
            size: portrait;
          }
          html, body {
            height: 100%;
            overflow: hidden !important;
            background: #fff !important;
          }
          .no-print, .admin-sidebar, .admin-content, .mobile-menu-btn, .admin-header { 
            display: none !important; 
          }
          /* Hide the dark modal overlay and its siblings */
          div[style*="position: fixed"][style*="background: rgba(0,0,0"] {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: transparent !important;
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            backdrop-filter: none !important;
          }
          #order-manifest-print { 
            position: relative !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: auto !important;
            margin: 0 !important;
            padding: 2cm !important;
            background: white !important;
            border: none !important;
            box-shadow: none !important;
            break-after: avoid;
            break-inside: avoid;
          }
          #order-manifest-print * { 
            color: black !important; 
            border-color: #000 !important; 
            background-color: transparent !important; 
            box-shadow: none !important; 
          }
          #order-manifest-print img.qr-image { filter: grayscale(100%); background: white !important; }
          #order-manifest-print img:not(.qr-image) { filter: grayscale(100%); }
        }
      `}} />

      {/* Mobile Top Bar */}
      <div className="no-print mobile-menu-btn" style={{ display: 'none', position: 'fixed', top: 15, left: 15, zIndex: 999 }}>
        <button onClick={() => setIsSidebarOpen(true)} style={{ background: colors.accent, border: 'none', color: colors.bg, padding: '12px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <LayoutDashboard size={24} />
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 9998 }}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <div className={`no-print admin-sidebar ${isSidebarOpen ? 'open' : ''}`} style={{ width: '300px', background: colors.surfaceSolid, borderRight: `1px solid ${colors.border}`, padding: '2.5rem 0', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '0 2.5rem', marginBottom: '3.5rem' }}>
          <h1 style={{ color: colors.text, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-1px', fontFamily: 'var(--font-outfit), sans-serif', margin: 0 }}>
            ECO<span style={{ color: colors.accent }}>ZERO ADMIN</span>
          </h1>
          <p style={{ color: colors.accent, fontSize: '0.8rem', marginTop: '0.4rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 600 }}>Command Center</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, padding: '0 1.2rem' }}>
          {[
            { id: 'overview', icon: LayoutDashboard, label: 'Dashboard' },
            { id: 'products', icon: PackageSearch, label: 'Inventory' },
            { id: 'delivery', icon: Truck, label: 'Logistics' },
            { id: 'customers', icon: Users, label: 'CRM Database' },
            { id: 'auth', icon: Shield, label: 'Authentication' },
            { id: 'descriptions', icon: ClipboardList, label: 'Market Content' },
            { id: 'notifications', icon: Bell, label: 'Push Updates' }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setIsSidebarOpen(false); }}
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.4rem', width: '100%', 
                  borderRadius: '14px', 
                  background: isActive ? colors.accent : 'transparent', 
                  color: isActive ? colors.bg : colors.pale, 
                  border: 'none', cursor: 'pointer', textAlign: 'left', 
                  fontWeight: isActive ? 700 : 500, fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <tab.icon size={20} /> 
                <span>{tab.label}</span>
              </button>
            )
          })}
          
          <div style={{ marginTop: 'auto', borderTop: `1px solid ${colors.border}`, paddingTop: '1.5rem', marginBottom: '1rem' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.4rem', width: '100%', borderRadius: '14px', color: colors.pale, textDecoration: 'none', fontWeight: 500, transition: 'all 0.2s' }}>
              <LogOut size={20} /> Exit Terminal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="admin-content" style={{ flex: 1, height: '100vh', overflowY: 'auto', padding: '3.5rem' }}>
        
        {/* Page Header */}
        <div className="no-print admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
          <div>
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.6rem', fontFamily: 'var(--font-outfit), sans-serif', fontWeight: 800 }}>
              {activeTab === 'overview' && 'System Analytics'}
              {activeTab === 'products' && 'Core Inventory'}
              {activeTab === 'delivery' && 'Logistics & Orders'}
              {activeTab === 'customers' && 'Entity Management'}
              {activeTab === 'auth' && 'Authentication Hub'}
              {activeTab === 'notifications' && 'Communication Hub'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.accent, boxShadow: `0 0 10px ${colors.accent}` }}></div>
              <p style={{ color: colors.textMuted, fontSize: '1rem', margin: 0 }}>Backend Live: Secure Connection Active</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', background: colors.surfaceSolid, padding: '0.8rem 1.2rem', borderRadius: '18px', border: `1px solid ${colors.border}` }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: colors.accent, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="Admin Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <p style={{ fontSize: '0.9rem', fontWeight: 700, color: colors.text, margin: 0 }}>ECOZERO ADMIN</p>
              <p style={{ fontSize: '0.75rem', color: colors.accent, margin: 0 }}>Root Privileges</p>
            </div>
          </div>
        </div>

        {/* Dashboard Overview */}
        {activeTab === 'overview' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', marginBottom: '4rem' }}>
              <div style={{ background: colors.surfaceSolid, padding: '2.2rem', borderRadius: '28px', border: `1px solid ${colors.border}`, position: 'relative', overflow: 'hidden' }}>
                <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</p>
                <h3 style={{ fontSize: '2.6rem', fontWeight: 800, margin: 0, color: colors.text }}>₹{totalRevenue.toFixed(0)}</h3>
                <DollarSign size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }} />
              </div>
              
              <div style={{ background: colors.surfaceSolid, padding: '2.2rem', borderRadius: '28px', border: `1px solid ${colors.border}`, position: 'relative', overflow: 'hidden' }}>
                <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Processed Orders</p>
                <h3 style={{ fontSize: '2.6rem', fontWeight: 800, margin: 0, color: colors.text }}>{orders.length}</h3>
                <ShoppingBag size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }} />
              </div>

              <div style={{ background: colors.surfaceSolid, padding: '2.2rem', borderRadius: '28px', border: `1px solid ${colors.border}`, position: 'relative', overflow: 'hidden' }}>
                <p style={{ color: colors.textMuted, fontSize: '0.9rem', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Inventory Count</p>
                <h3 style={{ fontSize: '2.6rem', fontWeight: 800, margin: 0, color: colors.text }}>{products.length}</h3>
                <PackageSearch size={60} style={{ position: 'absolute', right: '-10px', bottom: '-10px', opacity: 0.05 }} />
              </div>
            </div>

            <div style={{ background: colors.surfaceSolid, borderRadius: '28px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '2rem', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Real-Time Activity</h3>
                <button onClick={() => setActiveTab('delivery')} style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', background: 'rgba(136, 198, 95, 0.1)', color: colors.accent, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Logistics Hub &rarr;</button>
              </div>
              <div className="admin-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '1.5rem 2.5rem', color: colors.pale, fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>Entity</th>
                      <th style={{ padding: '1.5rem 2.5rem', color: colors.pale, fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>Assets</th>
                      <th style={{ padding: '1.5rem 2.5rem', color: colors.pale, fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '1.5rem 2.5rem', color: colors.pale, fontWeight: 600, fontSize: '0.9rem', textTransform: 'uppercase' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.05)`, transition: 'background 0.2s' }}>
                        <td style={{ padding: '1.5rem 2.5rem', fontWeight: 600, color: colors.text }}>{order.customer || 'Real Order'}</td>
                        <td style={{ padding: '1.5rem 2.5rem', color: colors.textMuted, fontSize: '0.9rem' }}>
                          {order.items?.length || 1} Item(s)
                        </td>
                        <td style={{ padding: '1.5rem 2.5rem' }}>
                          <span style={{ 
                            padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                            background: order.status === 'Delivered' ? 'rgba(136, 198, 95, 0.15)' : 'rgba(255, 165, 0, 0.15)',
                            color: order.status === 'Delivered' ? colors.accent : '#ffa500'
                          }}>
                            {order.status?.toUpperCase() || 'LIVE'}
                          </span>
                        </td>
                        <td style={{ padding: '1.5rem 2.5rem', fontWeight: 800, color: colors.accent }}>₹{(order.total || 0).toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Product Management */}
        {activeTab === 'products' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
              <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1.1rem 2.2rem', background: colors.accent, color: colors.bg, border: 'none', borderRadius: '35px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: `0 10px 30px rgba(136, 198, 95, 0.3)` }}>
                <Plus size={22} /> Add New Asset
              </button>
            </div>

            <div style={{ background: colors.surfaceSolid, borderRadius: '28px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <div className="admin-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale, fontWeight: 600 }}>Visual</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale, fontWeight: 600 }}>Product Metadata</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale, fontWeight: 600 }}>Category</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale, fontWeight: 600 }}>Supply</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale, fontWeight: 600 }}>Price</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale, fontWeight: 600, textAlign: 'right' }}>Ops</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <img src={product.image} alt="" style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />
                        </td>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <div style={{ fontWeight: 700, color: colors.text, fontSize: '1.1rem' }}>{product.name}</div>
                          <div style={{ fontSize: '0.75rem', color: colors.textMuted, marginTop: '4px', fontFamily: 'monospace' }}>{product.id}</div>
                        </td>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <span style={{ padding: '0.4rem 0.8rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', fontSize: '0.85rem' }}>{product.category}</span>
                        </td>
                        <td style={{ padding: '1.5rem 2rem', fontWeight: 700, color: product.stock < 10 ? '#ff6b6b' : '#fff' }}>{product.stock}</td>
                        <td style={{ padding: '1.5rem 2rem', fontWeight: 800, color: colors.accent }}>${parseFloat(product.price).toFixed(2)}</td>
                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end' }}>
                            <button onClick={() => startEditProduct(product)} style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', color: '#fff', cursor: 'pointer' }}><Edit2 size={18} /></button>
                            <button onClick={() => deleteProduct(product.id)} style={{ padding: '0.6rem', background: 'rgba(255,107,107,0.1)', border: 'none', borderRadius: '10px', color: '#ff6b6b', cursor: 'pointer' }}><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Deliveries Tab */}
        {activeTab === 'delivery' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ background: colors.surfaceSolid, borderRadius: '28px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <div className="admin-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale }}>Order Segment</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale }}>Recipient</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale }}>Assets</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale }}>Total</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale }}>Status Pipeline</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale }}>Schedule</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr 
                        key={order.id} 
                        onClick={() => { setSelectedOrder(order); setShowOrderDetail(true); }}
                        style={{ cursor: 'pointer', borderBottom: `1px solid rgba(255,255,255,0.05)` }}
                      >
                        <td style={{ padding: '1.5rem 2rem', fontFamily: 'monospace', fontSize: '0.85rem', color: colors.textMuted }}>{order.id?.slice(-8) || 'Order-X'}</td>
                        <td style={{ padding: '1.5rem 2rem', fontWeight: 600 }}>{order.customer}</td>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <div style={{ color: colors.text, fontSize: '0.9rem', fontWeight: 600 }}>{order.items?.[0]?.name || 'Real Order'}</div>
                          <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>{order.items?.length > 1 ? `+ ${order.items.length - 1} more items` : 'Single Item Package'}</div>
                        </td>
                        <td style={{ padding: '1.5rem 2rem', fontWeight: 800, color: colors.accent }}>₹{(order.total || 0).toFixed(0)}</td>
                        <td style={{ padding: '1.5rem 2rem' }} onClick={(e) => e.stopPropagation()}>
                          <select 
                            value={order.status} 
                            onChange={(e) => updateDelivery(order.id, e.target.value)}
                            style={{ background: colors.surfaceSolid, color: colors.text, border: `1px solid ${colors.border}`, padding: '0.6rem 1rem', borderRadius: '12px', outline: 'none' }}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </td>
                        <td style={{ padding: '1.5rem 2rem' }} onClick={(e) => e.stopPropagation()}>
                           <input 
                            type="date" 
                            value={order.deliveryDate || ''} 
                            onChange={(e) => updateDeliveryDate(order.id, e.target.value)}
                            style={{ background: colors.surfaceSolid, color: colors.text, border: `1px solid ${colors.border}`, padding: '0.6rem', borderRadius: '12px' }}
                           />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Customers Tab */}
        {activeTab === 'customers' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {users.map((user) => (
                <div 
                  key={user.id}
                  onClick={() => { setSelectedUser(user); setShowUserDetail(true); }}
                  style={{ background: colors.surfaceSolid, padding: '2rem', borderRadius: '28px', border: `1px solid ${colors.border}`, cursor: 'pointer', transition: 'transform 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: colors.accent, color: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, overflow: 'hidden' }}>
                      {user.avatar || user.photoURL || user.profileImage ? (
                        <img src={user.avatar || user.photoURL || user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        user.name?.charAt(0)
                      )}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.2rem', color: colors.text }}>{user.name}</h4>
                      <p style={{ margin: 0, color: colors.accent, fontSize: '0.85rem', fontWeight: 600 }}>Verified Identity</p>
                    </div>
                  </div>
                  <div style={{ color: colors.textMuted, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Mail size={16} /> {user.email}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={16} /> {user.phone || 'Network Offline'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Customers Tab Content Removed for brevity in chunk but will be kept */}
        
        {/* Authentication Tab - Firestore Users as Auth list */}
        {activeTab === 'auth' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ background: colors.surfaceSolid, borderRadius: '28px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '2rem', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800, color: colors.text }}>Identity Management</h3>
                   <p style={{ margin: '0.4rem 0 0', color: colors.textMuted, fontSize: '0.9rem' }}>Users currently registered for platform access</p>
                 </div>
                 <button style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.8rem 1.6rem', borderRadius: '14px', background: colors.accent, color: colors.bg, border: 'none', fontWeight: 700, cursor: 'not-allowed', opacity: 0.7 }}>
                   <Plus size={18} /> Add User
                 </button>
              </div>
              
              <div className="admin-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                   <thead>
                     <tr style={{ background: 'rgba(136, 198, 95, 0.05)' }}>
                       <th style={{ padding: '1.5rem 2rem', color: colors.pale, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Identifier</th>
                       <th style={{ padding: '1.5rem 2rem', color: colors.pale, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Providers</th>
                       <th style={{ padding: '1.5rem 2rem', color: colors.pale, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>Created</th>
                       <th style={{ padding: '1.5rem 2rem', color: colors.pale, fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase' }}>User UID</th>
                     </tr>
                   </thead>
                   <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: colors.textMuted }}>No users for this project yet</td>
                        </tr>
                      ) : users.map(user => (
                        <tr key={user.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.05)`, transition: '0.2s' }}>
                          <td style={{ padding: '1.5rem 2rem', color: colors.text, fontWeight: 600 }}>{user.email}</td>
                          <td style={{ padding: '1.5rem 2rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(136, 198, 95, 0.1)', borderRadius: '8px', border: `1px solid rgba(136, 198, 95, 0.2)` }}>
                              <Lock size={14} color={colors.accent} />
                              <span style={{ fontSize: '0.85rem', color: colors.accent, fontWeight: 700 }}>Password</span>
                            </div>
                          </td>
                          <td style={{ padding: '1.5rem 2rem', color: colors.textMuted, fontSize: '0.9rem' }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Mar 15, 2026'}</td>
                          <td style={{ padding: '1.5rem 2rem' }}>
                            <span style={{ fontFamily: 'monospace', color: colors.accent, background: 'rgba(136, 198, 95, 0.08)', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', border: `1px solid rgba(136, 198, 95, 0.15)` }}>{user.id}</span>
                          </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'notifications' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2.5rem' }}>
              <button onClick={() => setShowNotifModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '1.1rem 2.2rem', background: colors.accent, color: colors.bg, border: 'none', borderRadius: '35px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', boxShadow: `0 10px 30px rgba(136, 198, 95, 0.3)` }}>
                <Bell size={22} /> Broadcast Update
              </button>
            </div>

            <div style={{ background: colors.surfaceSolid, borderRadius: '28px', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
              <div className="admin-table-wrap">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale }}>Type</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale }}>Notification Content</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale }}>Broadcast Date</th>
                      <th style={{ padding: '1.5rem 2rem', color: colors.pale, textAlign: 'right' }}>Ops</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminNotifications.map(notif => (
                      <tr key={notif.id} style={{ borderBottom: `1px solid rgba(255,255,255,0.05)` }}>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <span style={{ 
                            padding: '0.4rem 0.8rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', fontSize: '0.8rem',
                            color: colors.accent, fontWeight: 700, textTransform: 'uppercase'
                          }}>
                            {notif.type}
                          </span>
                        </td>
                        <td style={{ padding: '1.5rem 2rem' }}>
                          <div style={{ fontWeight: 700, color: colors.text, fontSize: '1.1rem' }}>{notif.title}</div>
                          <div style={{ fontSize: '0.85rem', color: colors.textMuted, marginTop: '4px' }}>{notif.desc}</div>
                        </td>
                        <td style={{ padding: '1.5rem 2rem', color: colors.textMuted, fontSize: '0.9rem' }}>
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '1.5rem 2rem', textAlign: 'right' }}>
                          <button onClick={() => deleteNotification(notif.id)} style={{ padding: '0.6rem', background: 'rgba(255,107,107,0.1)', border: 'none', borderRadius: '10px', color: '#ff6b6b', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Market Content / Descriptions Management */}
        {activeTab === 'descriptions' && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '2.5rem' }}>
              {products.map(product => (
                <div key={product.id} style={{ 
                  background: '#fff', 
                  borderRadius: '32px', 
                  padding: '2rem', 
                  border: `1px solid ${colors.border}`, 
                  boxShadow: '0 15px 45px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: expandedProductContent === product.id ? '2rem' : '0rem'
                }}>
                  <div 
                    onClick={() => setExpandedProductContent(expandedProductContent === product.id ? null : product.id)}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <img src={product.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', color: colors.text, fontWeight: 800 }}>{product.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: colors.accent, fontWeight: 700 }}>CONTENT ASSETS</p>
                      </div>
                    </div>
                    <ChevronDown size={24} color={colors.accent} strokeWidth={2.5} style={{ transform: expandedProductContent === product.id ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                  </div>
                  
                  {expandedProductContent === product.id && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                    {/* Description Section */}
                    <div>
                        <label style={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Descriptions</label>
                        <textarea 
                          defaultValue={product.description}
                          placeholder="General product narrative..."
                          onBlur={async (e) => {
                            const val = e.target.value;
                            if (val === product.description) return;
                            await updateDoc(doc(db, 'products', product.id), { description: val });
                            setProducts(products.map(p => p.id === product.id ? { ...p, description: val } : p));
                          }}
                          style={{ width: '100%', minHeight: '100px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '15px', background: '#fcfcfc', fontSize: '0.9rem', color: '#444', outline: 'none' }}
                        />
                        <div style={{ marginTop: '5px' }}>
                           <span style={{ color: '#111', fontWeight: 800, fontSize: '0.85rem' }}>Read More.</span>
                        </div>
                    </div>

                    {/* Specs & Features side-by-side */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                       <div>
                          <label style={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Specifications</label>
                          <textarea 
                            defaultValue={product.specifications}
                            placeholder="Dimensions, Weight..."
                            onBlur={async (e) => {
                              const val = e.target.value;
                              if (val === product.specifications) return;
                              await updateDoc(doc(db, 'products', product.id), { specifications: val });
                              setProducts(products.map(p => p.id === product.id ? { ...p, specifications: val } : p));
                            }}
                            style={{ width: '100%', minHeight: '80px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '12px', background: '#fcfcfc', fontSize: '0.85rem', color: '#444', outline: 'none' }}
                          />
                       </div>
                       <div>
                          <label style={{ fontSize: '0.7rem', color: colors.textMuted, fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>Features</label>
                          <textarea 
                            defaultValue={product.features}
                            placeholder="Bullet points (one per line)..."
                            onBlur={async (e) => {
                              const val = e.target.value;
                              if (val === product.features) return;
                              await updateDoc(doc(db, 'products', product.id), { features: val });
                              setProducts(products.map(p => p.id === product.id ? { ...p, features: val } : p));
                            }}
                            style={{ width: '100%', minHeight: '80px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '12px', padding: '12px', background: '#fcfcfc', fontSize: '0.85rem', color: '#444', outline: 'none' }}
                          />
                       </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); window.open(`/product/${product.id}`, '_blank'); }}
                        style={{ flex: 1, background: colors.surfaceSolid, color: colors.text, border: 'none', padding: '12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Live View
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); startEditProduct(product); }}
                        style={{ flex: 1, background: colors.accent, color: colors.bg, border: 'none', padding: '12px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Global Config
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* MODALS SECTION */}

      {/* Add/Edit Product Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: '1rem' }}>
          <div className="admin-modal" style={{ background: colors.surfaceSolid, border: `1px solid ${colors.border}`, borderRadius: '32px', width: '95%', maxWidth: '550px', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
            <div className="admin-modal-inner" style={{ padding: '2.5rem' }}>
              <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: colors.pale, fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem' }}>{editingProduct ? 'Modify Asset' : 'Register New Asset'}</h2>
              
              <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Asset Label</label>
                   <input required value={name} onChange={e=>setName(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', background: colors.bg, border: `1px solid ${colors.border}`, color: '#fff', outline: 'none' }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Price (USD)</label>
                      <input type="number" step="0.01" required value={price} onChange={e=>setPrice(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', background: colors.bg, border: `1px solid ${colors.border}`, color: '#fff', outline: 'none' }} />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Product Stock</label>
                      <input type="number" required value={stock} onChange={e=>setStock(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', background: colors.bg, border: `1px solid ${colors.border}`, color: '#fff', outline: 'none' }} />
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Segment/Category</label>
                   <input required value={category} onChange={e=>setCategory(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', background: colors.bg, border: `1px solid ${colors.border}`, color: '#fff', outline: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Product Description</label>
                   <textarea value={description} onChange={e=>setDescription(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, outline: 'none', resize: 'vertical', minHeight: '100px' }} placeholder="Enter extended details..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Specifications</label>
                      <textarea value={specifications} onChange={e=>setSpecifications(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, outline: 'none', resize: 'vertical', minHeight: '80px' }} placeholder="Weight, Capacity, Materials..." />
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                      <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Core Features</label>
                      <textarea value={features} onChange={e=>setFeatures(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', background: colors.bg, border: `1px solid ${colors.border}`, color: colors.text, outline: 'none', resize: 'vertical', minHeight: '80px' }} placeholder="Functional highlights..." />
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Asset Visual Gallery (Carousel)</label>
                   
                   {/* Multiple Images Display */}
                   <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      {images.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${colors.accent}` }}>
                           <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                           <button 
                             type="button"
                             onClick={() => removeImage(idx)}
                             style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(211, 47, 47, 0.9)', color: '#fff', border: 'none', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 900 }}
                           >
                             &times;
                           </button>
                        </div>
                      ))}
                      {/* Empty state slots for better UI feel */}
                      {images.length < 3 && [...Array(3 - images.length)].map((_, i) => (
                        <div key={i} style={{ width: '80px', height: '80px', borderRadius: '12px', border: `2px dashed ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.border }}>
                           <Plus size={20} />
                        </div>
                      ))}
                   </div>

                   <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, position: 'relative' }}>
                        <input 
                          type="file" 
                          id="asset-upload" 
                          accept="image/*" 
                          onChange={handleImageUpload} 
                          style={{ display: 'none' }} 
                        />
                        <label 
                          htmlFor="asset-upload" 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '10px',
                            padding: '1.1rem', 
                            borderRadius: '16px', 
                            background: isUploading ? 'rgba(136, 198, 95, 0.1)' : 'rgba(255,255,255,0.05)', 
                            border: `2px dashed ${isUploading ? colors.accent : colors.border}`, 
                            color: isUploading ? colors.accent : colors.pale,
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            transition: '0.3s'
                          }}
                        >
                          {isUploading ? `Uploading ${Math.round(uploadProgress)}%...` : <><Plus size={18} /> Add Image</>}
                        </label>
                      </div>
                      
                      <div style={{ flex: 1 }}>
                        <input 
                          placeholder="Or paste external URL..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.currentTarget as HTMLInputElement).value;
                              if (val) {
                                setImages(prev => [...prev, val]);
                                (e.currentTarget as HTMLInputElement).value = '';
                              }
                            }
                          }}
                          style={{ 
                            width: '100%',
                            padding: '1.2rem', 
                            borderRadius: '16px', 
                            background: colors.bg, 
                            border: `1px solid ${colors.border}`, 
                            color: '#fff', 
                            outline: 'none',
                            fontSize: '0.9rem'
                          }} 
                        />
                        <p style={{ fontSize: '0.7rem', color: colors.pale, marginTop: '5px' }}>Press Enter to add pasted URL</p>
                      </div>
                   </div>
                   
                   {images.length > 0 && (
                     <div style={{ marginTop: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.accent }}></div>
                        <span style={{ color: colors.accent, fontSize: '0.75rem', fontWeight: 600 }}>{images.length} Image(s) Queued</span>
                     </div>
                   )}
                </div>

                <button type="submit" style={{ padding: '1.4rem', borderRadius: '20px', background: colors.accent, color: colors.bg, border: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', marginTop: '1rem' }}>
                  {editingProduct ? 'Commit Changes' : 'Execute Registration'}
                </button>
              </form>
              {successMsg && <p style={{ color: colors.accent, textAlign: 'center', marginTop: '1.5rem', fontWeight: 700 }}>{successMsg}</p>}
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal (Printable) */}
      {showOrderDetail && selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(15px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: '1rem' }}>
          <div id="order-manifest-print" className="admin-modal" style={{ background: colors.surfaceSolid, border: `1px solid ${colors.border}`, borderRadius: '32px', width: '95%', maxWidth: '850px', maxHeight: '85vh', overflowY: 'auto', position: 'relative' }}>
             <div className="admin-modal-inner" style={{ padding: '2.5rem' }}>
                <button onClick={() => setShowOrderDetail(false)} className="no-print" style={{ position: 'absolute', top: '30px', right: '30px', background: colors.bg, border: 'none', color: colors.accent, width: '45px', height: '45px', borderRadius: '50%', cursor: 'pointer', fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3.5rem' }}>
                   <div>
                      <h1 style={{ fontSize: '3rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px', color: colors.text }}>
                        ECO<span style={{ color: colors.accent }}>ZERO</span>
                      </h1>
                      <p style={{ color: colors.accent, fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', marginTop: '0.2rem' }}>Sustainability Hub</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>Logistics</h2>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', margin: 0, color: colors.textMuted }}>Manifest</h2>
                   </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.8fr', gap: '3rem', marginBottom: '3rem' }}>
                   <div>
                      <p style={{ color: colors.accent, fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>Recipient Header</p>
                      <h4 style={{ fontSize: '1.4rem', margin: 0 }}>{selectedOrder.customer}</h4>
                      <p style={{ color: colors.textMuted, marginTop: '8px' }}>{selectedOrder.email}</p>
                      <p style={{ color: colors.textMuted, marginTop: '4px' }}>{selectedOrder.phone || 'No phone provided'}</p>
                      <p style={{ color: colors.textMuted, marginTop: '4px' }}>{selectedOrder.address || 'No address provided'}</p>
                   </div>
                   <div style={{ textAlign: 'center' }}>
                      {selectedOrder.locationUrl ? (
                        <div className="qr-container" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                           <p style={{ color: colors.accent, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.8rem', fontSize: '0.7rem' }}>Logistics QR Link</p>
                           <img 
                             className="qr-image"
                             src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(selectedOrder.locationUrl)}`} 
                             alt="QR" 
                             style={{ background: '#fff', padding: '10px', borderRadius: '12px', border: `1px solid ${colors.border}`, width: '100px', height: '100px' }} 
                           />
                           <span style={{ fontSize: '0.6rem', color: colors.textMuted, marginTop: '8px' }}>GPS PIN RECORDED</span>
                        </div>
                      ) : (
                        <div className="qr-container" style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', opacity: 0.3 }}>
                           <p style={{ color: colors.accent, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.8rem', fontSize: '0.7rem' }}>Logistics QR Link</p>
                           <div className="qr-image" style={{ background: 'rgba(255,255,255,0.05)', width: '100px', height: '100px', borderRadius: '12px', border: `1px dashed ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.textMuted, fontSize: '0.6rem' }}>NO PIN</div>
                        </div>
                      )}
                   </div>
                   <div style={{ textAlign: 'right' }}>
                      <p style={{ color: colors.accent, fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem' }}>Segment ID</p>
                      <h4 style={{ fontSize: '1.4rem', margin: 0, fontFamily: 'monospace' }}>{selectedOrder.id}</h4>
                      <p style={{ color: colors.textMuted, marginTop: '8px' }}>{new Date(selectedOrder.date).toLocaleString()}</p>
                   </div>
                </div>

                {/* Tracking Stepper Preview (Thematic) */}
                <div className="no-print" style={{ 
                  background: 'rgb(215, 232, 188)', 
                  borderRadius: '24px', 
                  padding: '2.5rem 1.5rem', 
                  marginBottom: '3rem',
                  border: '1px solid rgba(60, 120, 20, 0.2)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '600px', margin: '0 auto' }}>
                    <div style={{ position: 'absolute', top: '22px', left: '30px', right: '30px', height: '2px', background: 'rgba(60, 120, 20, 0.2)', zIndex: 0 }}>
                       <div style={{ 
                         height: '100%', 
                         background: 'rgb(60, 120, 20)', 
                         width: selectedOrder.status === 'Delivered' ? '100%' : selectedOrder.status === 'Shipped' ? '50%' : '0%', 
                         transition: 'width 1s ease' 
                       }}></div>
                    </div>
                    {[
                      { l: 'Processing', i: Clock, s: 'Processing' },
                      { l: 'Shipped', i: Truck, s: 'Shipped' },
                      { l: 'Delivered', i: CheckCircle2, s: 'Delivered' }
                    ].map((step, idx) => {
                      const Icon = step.i;
                      const active = selectedOrder.status === step.s || (step.s === 'Processing') || (step.s === 'Shipped' && selectedOrder.status === 'Delivered');
                      // Simpler logic for active:
                      const isComplete = (idx === 0) || (idx === 1 && (selectedOrder.status === 'Shipped' || selectedOrder.status === 'Delivered')) || (idx === 2 && selectedOrder.status === 'Delivered');
                      
                      return (
                        <div key={idx} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <div style={{ 
                            width: '44px', 
                            height: '44px', 
                            borderRadius: '50%', 
                            background: isComplete ? 'rgb(136, 198, 95)' : 'rgba(60, 120, 20, 0.05)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'rgb(4, 28, 11)',
                            border: isComplete ? '2px solid rgb(60, 120, 20)' : '1px solid rgba(60, 120, 20, 0.1)',
                            transition: '0.3s'
                          }}>
                            <Icon size={20} strokeWidth={2.5} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: isComplete ? 'rgb(4, 28, 11)' : 'rgba(60, 120, 20, 0.4)' }}>{step.l}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '2.5rem', border: `1px solid ${colors.border}` }}>
                   <h4 style={{ marginBottom: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Inventory Items</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      {selectedOrder.items?.map((it: any, i: number) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                           <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                              <img src={it.image} style={{ width: '50px', height: '50px', borderRadius: '10px' }} alt="" />
                              <div>
                                 <p style={{ margin: 0, fontWeight: 700 }}>{it.name}</p>
                                 <p style={{ margin: 0, fontSize: '0.8rem', color: colors.textMuted }}>ID: {it.id || 'SYS-GEN'}</p>
                              </div>
                           </div>
                           <p style={{ fontWeight: 800 }}>₹{parseFloat(it.price).toFixed(0)}</p>
                        </div>
                      ))}
                   </div>
                   <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>Final Value</p>
                      <p style={{ fontSize: '2.2rem', fontWeight: 900, color: colors.accent }}>₹{(selectedOrder.total || 0).toFixed(0)}</p>
                   </div>
                </div>

                <div className="no-print" style={{ marginTop: '3.5rem', display: 'flex', gap: '1.5rem' }}>
                   <button onClick={() => setShowOrderDetail(false)} style={{ flex: 1, padding: '1.2rem', borderRadius: '18px', background: 'transparent', border: `1px solid ${colors.border}`, color: colors.text, fontWeight: 700, cursor: 'pointer' }}>Close Manifest</button>
                   <button onClick={handleExportPDF} style={{ flex: 1, padding: '1.2rem', borderRadius: '18px', background: colors.accent, color: colors.bg, border: 'none', fontWeight: 800, cursor: 'pointer', boxShadow: `0 10px 20px rgba(136, 198, 95, 0.2)` }}>Export PDF Component</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showUserDetail && selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: '1rem' }}>
          <div className="admin-modal" style={{ background: colors.surfaceSolid, border: `1px solid ${colors.border}`, borderRadius: '32px', width: '95%', maxWidth: '600px', padding: '2.5rem', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
             <button onClick={() => setShowUserDetail(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: colors.pale, fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
             <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: colors.accent, color: colors.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, overflow: 'hidden' }}>
                  {selectedUser.avatar || selectedUser.photoURL || selectedUser.profileImage ? (
                    <img src={selectedUser.avatar || selectedUser.photoURL || selectedUser.profileImage} alt={selectedUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    selectedUser.name?.charAt(0)
                  )}
                </div>
                <div>
                   <h2 style={{ margin: 0, fontSize: '2.2rem', color: colors.text }}>{selectedUser.name}</h2>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <p style={{ color: colors.accent, margin: 0, fontWeight: 700 }}>Data Entity Profile</p>
                     <button 
                       onClick={() => deleteUser(selectedUser.id, selectedUser.email)}
                       style={{ background: 'rgba(255,0,0,0.1)', color: '#ff4444', border: '1px solid rgba(255,0,0,0.2)', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                     >
                       PURGE RECORD
                     </button>
                   </div>
                </div>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '18px', border: `1px solid ${colors.border}` }}>
                   <p style={{ fontSize: '0.8rem', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Email Endpoint</p>
                   <p style={{ margin: 0, fontSize: '1.1rem', color: colors.text }}>{selectedUser.email}</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '18px', border: `1px solid ${colors.border}` }}>
                   <p style={{ fontSize: '0.8rem', color: colors.textMuted, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Phone Link</p>
                   <p style={{ margin: 0, fontSize: '1.1rem', color: colors.text }}>{selectedUser.phone || 'Unknown Network'}</p>
                </div>
                <div style={{ background: colors.surface, padding: '1.5rem', borderRadius: '18px', border: `1px solid ${colors.border}` }}>
                   <p style={{ fontSize: '0.8rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Location</p>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.text }}>
                     <MapPin size={18} />
                     <p style={{ margin: 0, fontSize: '1.1rem' }}>{selectedUser.address || selectedUser.location || 'Location pinning inactive'}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Broadcast Notification Modal */}
      {showNotifModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20000, padding: '1rem' }}>
          <div className="admin-modal" style={{ background: colors.surfaceSolid, border: `1px solid ${colors.border}`, borderRadius: '32px', width: '95%', maxWidth: '500px', padding: '2.5rem', position: 'relative', maxHeight: '85vh', overflowY: 'auto' }}>
             <button onClick={() => setShowNotifModal(false)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', color: colors.pale, fontSize: '2rem', cursor: 'pointer' }}>&times;</button>
             <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2.5rem' }}>Broadcast Update</h2>
             
             <form onSubmit={handleSaveNotification} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Update Title</label>
                   <input required value={notifTitle} onChange={e=>setNotifTitle(e.target.value)} placeholder="e.g. New Batch Arrived" style={{ padding: '1.2rem', borderRadius: '16px', background: colors.surfaceSolid, border: `1px solid ${colors.border}`, color: colors.text, outline: 'none' }} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Update Content</label>
                   <textarea required value={notifDesc} onChange={e=>setNotifDesc(e.target.value)} placeholder="Enter full update message..." style={{ padding: '1.2rem', borderRadius: '16px', background: colors.surfaceSolid, border: `1px solid ${colors.border}`, color: colors.text, outline: 'none', minHeight: '120px', resize: 'none' }} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Information Type</label>
                   <select value={notifType} onChange={e=>setNotifType(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', background: colors.bg, border: `1px solid ${colors.border}`, color: '#fff', outline: 'none' }}>
                      <option value="update">General Update</option>
                      <option value="offer">Special Offer</option>
                      <option value="order">Order Notice</option>
                   </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                   <label style={{ fontSize: '0.9rem', color: colors.accent, fontWeight: 700, textTransform: 'uppercase' }}>Target Audience</label>
                   <select value={notifTarget} onChange={e=>setNotifTarget(e.target.value)} style={{ padding: '1.2rem', borderRadius: '16px', background: colors.bg, border: `1px solid ${colors.border}`, color: '#fff', outline: 'none' }}>
                      <option value="all">Global Broadcast (All Guests)</option>
                      <optgroup label="Specific Profile" style={{ background: colors.bg }}>
                         {users.map(u => (
                           <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                         ))}
                      </optgroup>
                   </select>
                </div>

                <button type="submit" style={{ padding: '1.4rem', borderRadius: '20px', background: colors.accent, color: colors.bg, border: 'none', fontWeight: 800, fontSize: '1.1rem', cursor: 'pointer', marginTop: '1rem' }}>
                  Release Broadcast
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}

