'use client'; 

import { useState, useEffect } from 'react';
import { Search, Loader2, PackageSearch, Filter, Heart, ChevronLeft, SlidersHorizontal, Plus } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useMemo } from 'react';

export default function MenuPage() {
  const router = useRouter();
  const categoryGradients: any = {
    'All': 'linear-gradient(135deg, #FFEFBA 0%, #FFFFFF 100%)',
    'Dairy Products': 'linear-gradient(135deg, #FF9A9E 0%, #FAD0C4 100%)',
    'Fruits and Vegetables': 'linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)',
    'Meat and Poultry': 'linear-gradient(135deg, #fee140 0%, #fa709a 100%)',
    'Snacks': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  };
  const categoryImages: any = {
    'All': 'https://api.iconify.design/lucide:layout-grid.svg',
    'Dairy Products': 'https://api.iconify.design/lucide:milk.svg',
    'Fruits and Vegetables': 'https://api.iconify.design/lucide:apple.svg',
    'Meat and Poultry': 'https://api.iconify.design/lucide:beef.svg',
    'Snacks': 'https://api.iconify.design/lucide:cookie.svg'
  };
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
    // Load wishlist from local storage
    const stored = JSON.parse(localStorage.getItem('ecozero_wishlist') || '[]');
    setWishlist(Array.isArray(stored) ? stored.map((p: any) => p.id) : []);
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const fetchedProducts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Extract unique categories
      const cats = Array.from(new Set(fetchedProducts.map((p: any) => p.category).filter(Boolean)));
      setCategories(['All', ...cats]);
      
      // Sort newest products first
      fetchedProducts.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setProducts(fetchedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
    setIsLoading(false);
  };

  const toggleWishlist = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    let currentWishlist = JSON.parse(localStorage.getItem('ecozero_wishlist') || '[]');
    if (!Array.isArray(currentWishlist)) currentWishlist = [];

    const exists = currentWishlist.find((p: any) => p.id === product.id);
    let newWishlist;
    
    if (exists) {
      newWishlist = currentWishlist.filter((p: any) => p.id !== product.id);
    } else {
      newWishlist = [...currentWishlist, product];
    }

    localStorage.setItem('ecozero_wishlist', JSON.stringify(newWishlist));
    setWishlist(newWishlist.map((p: any) => p.id));
  };

  const quickAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    const cart = JSON.parse(localStorage.getItem('ecozero_cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);
    
    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }
    
    localStorage.setItem('ecozero_cart', JSON.stringify(cart));
    // Dispatch custom event for Navbar and Dock to update
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  return (
    <div className="page-main-wrapper" style={{ paddingTop: '120px', minHeight: '100vh', background: 'var(--bg-color)' }}>
      <div className="container">
        
        {/* MOBILE HEADER */}
        <div className="mobile-header">
           <button className="circle-btn" onClick={() => router.back()}>
             <ChevronLeft size={20} />
           </button>
           <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111' }}>All Products</h2>
           <div style={{ width: '40px' }} />
        </div>

        {/* Desktop Header */}
        <div className="desktop-only" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'rgb(4, 28, 11)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Eco Menu</h1>
            <p style={{ color: '#5a7a40', fontSize: '1.1rem', fontWeight: 500 }}>Browse our live catalog of premium eco-friendly products.</p>
          </div>
          
          <div style={{ 
            display: 'flex', alignItems: 'center', background: '#fff', 
            padding: '0.8rem 1.5rem', borderRadius: '40px', 
            border: '1.5px solid rgba(60, 120, 20, 0.2)', width: '100%', 
            maxWidth: '350px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            transition: '0.3s'
          }} className="search-container">
            <Search size={20} color="#146845" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'rgb(4, 28, 11)', marginLeft: '12px', outline: 'none', width: '100%', fontSize: '1rem', fontWeight: 600 }}
            />
          </div>
        </div>

        {/* MOBILE SEARCH & FILTER */}
        <div className="search-filter-row">
            <div className="mobile-search-bar">
               <Search size={18} color="#aaa" />
               <input 
                 type="text" 
                 placeholder="What's on your shopping list today?" 
                 value={searchQuery}
                 onChange={e => setSearchQuery(e.target.value)}
                 style={{ border: 'none', background: 'transparent', width: '100%', marginLeft: '10px', fontSize: '0.9rem', outline: 'none' }}
               />
            </div>
            <button className="filter-btn">
               <SlidersHorizontal size={18} />
            </button>
        </div>

        {/* MOBILE: Product types section label */}
        <div className="section-label-row">
           <h3 className="section-label">Product types</h3>
        </div>

        {/* MOBILE: Product Category Cards */}
        <div className="categories-scroll-wrapper mobile-only" style={{ overflowX: 'auto', margin: '0 -20px 2rem', padding: '0 20px 10px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
           <div style={{ display: 'flex', gap: '15px', width: 'max-content' }}>
              {categories.map((cat, i) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="category-card"
                    style={{
                      background: categoryGradients[cat] || `linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)`,
                      border: selectedCategory === cat ? '2px solid #111' : '1px solid rgba(0,0,0,0.05)'
                    }}
                  >
                    <span className="category-name">{cat === 'All' ? 'Full Catalog' : cat}</span>
                      <img 
                        src={categoryImages[cat] || 'https://api.iconify.design/lucide:box.svg'} 
                        className="category-img-placeholder" 
                        alt="" 
                        style={{ 
                          opacity: 0.25, filter: 'grayscale(1) brightness(0)', 
                        }} 
                      />
                  </button>
              ))}
           </div>
        </div>

        {/* Desktop category pills */}
        <div className="categories-scroll-wrapper desktop-only" style={{ overflowX: 'auto', margin: '0 -16px 3rem', padding: '0 16px 10px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <div className="categories-container" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', width: 'max-content', paddingRight: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', color: '#146845', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
              <Filter size={18} /> CATEGORIES:
            </div>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '10px 22px', borderRadius: '30px', border: 'none', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
                  background: selectedCategory === cat ? '#146845' : '#fcf7de', color: selectedCategory === cat ? '#fcf7de' : '#146845',
                  boxShadow: selectedCategory === cat ? '0 8px 20px rgba(60, 120, 20, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                  textTransform: 'capitalize', whiteSpace: 'nowrap'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products header (Found count) */}
        <div className="section-label-row">
           <h3 className="section-label">{filtered.length} products found</h3>
           <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FF5733' }}>See all</span>
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 0' }}>
            <Loader2 className="animate-spin" size={48} color="#146845" />
            <p style={{ color: '#5a7a40', fontSize: '1.1rem', marginTop: '1.5rem', fontWeight: 600 }}>Syncing Eco Inventory...</p>
          </div>
        ) : (
          <div className="products-grid">
            {filtered.length > 0 ? (
              filtered.map(product => {
                const isFav = wishlist.includes(product.id);
                return (
                  <div key={product.id} onClick={() => router.push(`/product/${product.id}`)} style={{ cursor: 'pointer' }}>
                    
                    {/* DESKTOP VIEW CARD */}
                    <div className="desktop-only product-link" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <div className="product-image-container" style={{ position: 'relative', borderRadius: '28px', overflow: 'hidden', height: '320px', marginBottom: '1.2rem', background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <Image 
                          className="scaled-img" 
                          src={product.image || 'https://via.placeholder.com/600x600'} 
                          alt={product.name} 
                          fill
                          style={{ objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1)' }} 
                        />
                        <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(255,255,255,0.95)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, color: 'rgb(4, 28, 11)', backdropFilter: 'blur(10px)', zIndex: 2 }}>{product.badge || 'ESSENTIAL'}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 14px' }}>
                        <div>
                          <h3 className="product-title" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', marginBottom: '0.3rem', height: '1.2em', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{product.name}</h3>
                          <p style={{ color: '#5a7a40', fontSize: '0.9rem', fontWeight: 500 }}>{product.category || 'Eco-Friendly'}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#5a7a40', textDecoration: 'line-through' }}>₹{(parseFloat(product.price) * 1.25).toFixed(0)}</p>
                          <p style={{ margin: 0, fontSize: '1.3rem', color: '#146845', fontWeight: 800 }}>₹{product.price}</p>
                        </div>
                      </div>
                    </div>

                    {/* MOBILE VIEW CARD (STANDARD UNIFORM DESIGN) */}
                    <div className="mobile-product-card mobile-only" onClick={() => router.push(`/product/${product.id}`)}>
                       <div className="mobile-product-img-wrapper" style={{ position: 'relative' }}>
                         <Image 
                           src={product.image || 'https://via.placeholder.com/600x600'} 
                           className="mobile-product-img" 
                           alt={product.name} 
                           fill
                           style={{ objectFit: 'cover', mixBlendMode: 'multiply' }}
                         />
                         <div className="mobile-essential-tag" style={{ zIndex: 2 }}>{product.badge || 'ESSENTIAL'}</div>
                       </div>
                       <div className="mobile-product-info">
                          <span className="mobile-product-title">{product.name}</span>
                          <span className="mobile-product-weight">{product.category || 'Eco'} &bull; 68 gm.</span>
                          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                             <span className="mobile-product-price">₹{product.price}</span>
                             <button className="mobile-add-btn" onClick={(e) => quickAddToCart(e, product)}>
                                <Plus size={14} />
                             </button>
                          </div>
                       </div>
                    </div>

                  </div>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '8rem 2rem', textAlign: 'center', background: '#fff', borderRadius: '32px', border: '2px dashed rgba(60, 120, 20, 0.1)' }}>
                <PackageSearch size={64} color="#146845" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.8rem', marginBottom: '0.8rem', fontWeight: 800, color: 'rgb(4, 28, 11)' }}>No products matched</h3>
                <button 
                  onClick={() => {setSelectedCategory('All'); setSearchQuery('');}}
                  style={{ marginTop: '2rem', padding: '12px 30px', borderRadius: '40px', border: 'none', background: '#146845', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >Reset Filters</button>
              </div>
            )}
          </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        
        .product-link:hover .scaled-img {
          transform: scale(1.08);
        }
        .product-link:hover .product-title {
          color: #146845 !important;
        }

        .search-container:focus-within {
          border-color: #146845 !important;
          box-shadow: 0 4px 20px rgba(60, 120, 20, 0.1) !important;
        }

        @media (max-width: 768px) {
          .ez-navbar { display: none !important; }
          .page-main-wrapper { padding: 0 !important; background: #fff !important; }
          .container { padding: 0 20px !important; }
          
          .mobile-header {
            display: flex !important;
            padding: 15px 0;
            justify-content: space-between;
            align-items: center;
          }
          .circle-btn {
            width: 40px; height: 40px; border-radius: 50%;
            background: #fff; border: 1.5px solid #eee;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.03);
          }
          
          .search-filter-row {
            display: flex !important;
            gap: 12px; margin-bottom: 25px;
          }
          .mobile-search-bar {
            flex: 1; display: flex; align-items: center;
            background: #f8f8f8; padding: 12px 18px; border-radius: 40px;
          }
          .filter-btn {
            width: 48px; height: 48px; border-radius: 50%;
            background: #111; color: #fff; border: none;
            display: flex; align-items: center; justify-content: center;
          }
          
          .section-label-row {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 15px;
          }
          .section-label { font-size: 1rem; font-weight: 800; color: #111; margin: 0; text-transform: none; letter-spacing: 0; }
          
          .category-card {
            width: 155px; flex-shrink: 0; border-radius: 18px;
            padding: 10px 15px; display: flex; flex-direction: row;
            align-items: center; justify-content: space-between; height: 65px;
            box-shadow: 0 8px 15px rgba(0,0,0,0.02);
            text-decoration: none; position: relative; overflow: hidden;
            border: 1px solid rgba(0,0,0,0.03); gap: 10px;
          }
          .category-name { font-size: 0.8rem; font-weight: 800; color: #111; z-index: 2; line-height: 1.1; max-width: 70%; text-align: left; }
          .category-img-placeholder {
            width: 35px; height: 35px; object-fit: contain; z-index: 2;
            flex-shrink: 0;
          }
          
          .products-grid {
             display: grid !important;
             grid-template-columns: 1fr 1fr !important;
             grid-auto-rows: 1fr !important; /* Forces all cards in a row to have same height */
             gap: 12px !important;
             padding: 0 4px 160px !important;
          }
          .mobile-product-card {
            background: #fff; border-radius: 20px; padding: 10px;
            display: flex; flex-direction: column; position: relative;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            border: 1px solid #f2f2f2;
            height: 100% !important;
            min-height: 280px;
          }
          .mobile-product-img-wrapper {
            width: 100%; height: 160px; /* Fixed height for image area to ensure alignment */
            background: #fdfdfd; border-radius: 14px;
            margin-bottom: 12px; overflow: hidden;
            display: flex; align-items: center; justify-content: center;
            position: relative;
          }
          .mobile-product-img {
            width: 100%; height: 100%; object-fit: cover;
            mix-blend-mode: multiply;
          }
          .mobile-essential-tag {
            position: absolute; bottom: 8px; left: 8px;
            background: rgba(255,255,255,0.9); padding: 4px 10px;
            border-radius: 20px; font-size: 0.6rem; font-weight: 800;
            color: #111; letter-spacing: 0.5px;
          }
          .mobile-product-info { 
            display: flex; flex-direction: column; flex: 1;
            gap: 2px; text-align: left;
          }
          .mobile-product-title { 
            font-size: 0.85rem; font-weight: 800; color: #111; 
            min-height: 2.3em; line-height: 1.15; margin-bottom: 2px;
            display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
            text-transform: capitalize;
          }
          .mobile-product-weight { font-size: 0.7rem; color: #bbb; font-weight: 600; margin-bottom: 8px; }
          .mobile-product-price { font-size: 1rem; font-weight: 900; color: #111; }
          .mobile-add-btn {
            width: 30px; height: 30px; border-radius: 50%;
            background: #111; color: #fff; border: none;
            display: flex; align-items: center; justify-content: center;
          }
          .discount-bubble {
            position: absolute; top: 6px; left: 6px;
            padding: 2px 7px; border-radius: 20px;
            background: #FF5A35; color: #fff; font-size: 8px; font-weight: 800;
            z-index: 2;
          }

          .desktop-only { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-header, .mobile-only, .search-filter-row, .section-label-row { display: none !important; }
          .products-grid {
             display: grid !important;
             grid-template-columns: repeat(3, 1fr) !important;
             gap: 32px !important;
          }
          .product-image-container {
             aspect-ratio: 1/1 !important;
             height: auto !important;
          }
        }
      `}} />
    </div>
  );
}
