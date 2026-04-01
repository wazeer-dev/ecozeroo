'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, PackageSearch, Filter, Heart } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MenuPage() {
  const router = useRouter();
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

  const filtered = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-main-wrapper">
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'rgb(4, 28, 11)', marginBottom: '0.5rem', letterSpacing: '-1px' }}>Eco Menu</h1>
            <p style={{ color: '#5a7a40', fontSize: '1.1rem', fontWeight: 500 }}>Browse our live catalog of premium eco-friendly products.</p>
          </div>
          
          {/* Search Bar */}
          <div style={{ 
            display: 'flex', alignItems: 'center', background: '#fff', 
            padding: '0.8rem 1.5rem', borderRadius: '40px', 
            border: '1.5px solid rgba(60, 120, 20, 0.2)', width: '100%', 
            maxWidth: '350px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            transition: '0.3s'
          }}
          className="search-container"
          >
            <Search size={20} color="#3c7814" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'rgb(4, 28, 11)', marginLeft: '12px', outline: 'none', width: '100%', fontSize: '1rem', fontWeight: 600 }}
            />
          </div>
        </div>

        {/* Category Pills */}
          <div className="categories-scroll-wrapper" style={{ overflowX: 'auto', margin: '0 -16px 3rem', padding: '0 16px 10px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            <div className="categories-container" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', width: 'max-content', paddingRight: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px', color: '#3c7814', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
                <Filter size={18} /> CATEGORIES:
              </div>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '10px 22px',
                    borderRadius: '30px',
                    border: 'none',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: selectedCategory === cat ? '#3c7814' : '#fff',
                    color: selectedCategory === cat ? '#fff' : '#3c7814',
                    boxShadow: selectedCategory === cat ? '0 8px 20px rgba(60, 120, 20, 0.2)' : '0 2px 8px rgba(0,0,0,0.05)',
                    textTransform: 'capitalize',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat) {
                      e.currentTarget.style.background = 'rgba(60, 120, 20, 0.08)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat) {
                      e.currentTarget.style.background = '#fff';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8rem 0' }}>
            <Loader2 className="animate-spin" size={48} color="#3c7814" />
            <p style={{ color: '#5a7a40', fontSize: '1.1rem', marginTop: '1.5rem', fontWeight: 600 }}>Syncing Eco Inventory...</p>
          </div>
        ) : (
          <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
            {filtered.length > 0 ? (
              filtered.map(product => {
                const isFav = wishlist.includes(product.id);
                return (
                  <Link 
                    href={`/product/${product.id}`}
                    key={product.id} 
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', transition: '0.3s', position: 'relative', width: '100%', height: '100%', justifyContent: 'space-between' }}
                    className="product-link"
                  >
                    <div className="product-card-top">
                      <div className="product-image-container" style={{ position: 'relative', borderRadius: '28px', overflow: 'hidden', height: '320px', marginBottom: '1.2rem', background: '#fff', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                      <img 
                        src={product.image || 'https://via.placeholder.com/600x600'} 
                        alt={product.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', transition: '0.5s transform cubic-bezier(0.2, 0, 0, 1)' }} 
                        className="scaled-img"
                      />
                      
                      <div style={{ position: 'absolute', bottom: '15px', left: '15px', background: 'rgba(255,255,255,0.95)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.75rem', fontWeight: 800, color: 'rgb(4, 28, 11)', backdropFilter: 'blur(4px)' }}>
                        ESSENTIAL
                      </div>

                      {/* Favorite Button */}
                      <button 
                        onClick={(e) => toggleWishlist(e, product)}
                        style={{
                          position: 'absolute', top: '15px', right: '15px',
                          width: '40px', height: '40px', borderRadius: '50%',
                          background: isFav ? '#3c7814' : 'rgba(255,255,255,0.9)',
                          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                          transition: '0.3s', zIndex: 15
                        }}
                        onMouseEnter={(e) => { if(!isFav) e.currentTarget.style.transform = 'scale(1.1)'; }}
                        onMouseLeave={(e) => { if(!isFav) e.currentTarget.style.transform = 'scale(1)'; }}
                      >
                        <Heart size={20} fill={isFav ? '#fff' : 'none'} color={isFav ? '#fff' : '#3c7814'} strokeWidth={2.5} />
                      </button>

                      {product.stock <= 0 && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(255,255,255,0.4)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                           <span style={{ background: '#d33', color: '#fff', padding: '0.6rem 1.8rem', borderRadius: '40px', fontWeight: 800, fontSize: '0.9rem', letterSpacing: '1px' }}>SOLD OUT</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '0 14px' }}>
                       <div style={{ flex: 1, paddingRight: '1rem', minWidth: 0 }}>
                          <h3 className="product-title" style={{ fontSize: '1.15rem', color: 'rgb(4, 28, 11)', fontWeight: 750, margin: 0, transition: '0.2s', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
                          <p style={{ color: '#5a7a40', fontSize: '0.9rem', marginTop: '4px', fontWeight: 500, textTransform: 'capitalize', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}>{product.category || 'Eco-Friendly'}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                           <p style={{ margin: 0, fontSize: '0.85rem', color: '#5a7a40', textDecoration: 'line-through', fontWeight: 500 }}>₹{(parseFloat(product.price) * 1.25).toFixed(0)}</p>
                           <p style={{ margin: 0, fontSize: '1.3rem', color: '#3c7814', fontWeight: 800 }}>₹{product.price}</p>
                        </div>
                     </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div style={{ gridColumn: '1 / -1', padding: '8rem 2rem', textAlign: 'center', background: '#fff', borderRadius: '32px', border: '2px dashed rgba(60, 120, 20, 0.1)' }}>
                <PackageSearch size={64} color="#3c7814" style={{ margin: '0 auto 1.5rem', opacity: 0.8 }} />
                <h3 style={{ fontSize: '1.8rem', marginBottom: '0.8rem', fontWeight: 800, color: 'rgb(4, 28, 11)' }}>No products matched</h3>
                <p style={{ color: '#5a7a40', fontSize: '1.1rem', fontWeight: 500 }}>Adjust your search or change category to explore more.</p>
                <button 
                  onClick={() => {setSelectedCategory('All'); setSearchQuery('');}}
                  style={{ marginTop: '2rem', padding: '12px 30px', borderRadius: '40px', border: 'none', background: '#3c7814', color: '#fff', fontWeight: 700, cursor: 'pointer', transition: '0.2s' }}
                >
                  Reset Filters
                </button>
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
          color: #3c7814 !important;
        }

        .search-container:focus-within {
          border-color: #3c7814 !important;
          box-shadow: 0 4px 20px rgba(60, 120, 20, 0.1) !important;
        }

        @media (max-width: 768px) {
          body { overflow-x: hidden !important; width: 100% !important; }
          h1 { font-size: 2.2rem !important; }
          .container { 
            padding: 0 16px !important; 
            width: 100% !important; 
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          .products-grid { 
            grid-template-columns: 1fr 1fr !important; 
            gap: 1rem !important; 
            width: 100% !important;
          }
          .product-link {
            height: auto !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .product-image-container {
            height: 180px !important;
            border-radius: 20px !important;
            aspect-ratio: 1 / 1 !important;
            margin-bottom: 0.8rem !important;
          }
          .product-title {
            font-size: 0.95rem !important;
            line-height: 1.2 !important;
          }
          .categories-scroll-wrapper {
             margin-bottom: 2rem !important;
             overflow-x: auto !important;
             -ms-overflow-style: none !important;
             scrollbar-width: none !important;
             padding-bottom: 20px !important;
          }
          .categories-scroll-wrapper::-webkit-scrollbar {
            display: none !important;
          }
          .categories-container {
            flex-wrap: nowrap !important;
            width: max-content !important;
            padding: 5px 16px 5px 0 !important;
            margin: 0 !important;
            display: flex !important;
            align-items: center !important;
            gap: 0.8rem !important;
          }
          .categories-container > button {
            flex-shrink: 0 !important;
            padding: 8px 18px !important;
            font-size: 0.82rem !important;
          }
        }
      `}} />
    </div>
  );
}
