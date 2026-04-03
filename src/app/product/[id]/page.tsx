'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMemo } from 'react';
import { doc, getDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Loader2, Star, ChevronDown, ChevronUp, ShoppingCart, Zap, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [addedPopup, setAddedPopup] = useState(false);
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newReviewImage, setNewReviewImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const [activeAccordion, setActiveAccordion] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<number>(1);
  const [quantity, setQuantity] = useState(1);
  const [direction, setDirection] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const images: string[] = (product?.images && product.images.length > 0) ? product.images : [product?.image].filter(Boolean);

  const handleNext = () => {
    setDirection(1);
    setActiveImageIdx((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setActiveImageIdx((prev) => (prev - 1 + images.length) % images.length);
  };

  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('ecozero_cart') || '[]');
      setCartCount(cart.reduce((total: number, item: any) => total + item.quantity, 0));
    };
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  useEffect(() => {
    if (id) {
      fetchProductData();
      checkWishlistStatus();
    }
  }, [id]);

  const checkWishlistStatus = () => {
    const stored = JSON.parse(localStorage.getItem('ecozero_wishlist') || '[]');
    if (Array.isArray(stored)) {
      setIsWishlisted(stored.some((p: any) => p.id === id));
    }
  };

  const toggleWishlist = () => {
    if (!product) return;
    const stored = JSON.parse(localStorage.getItem('ecozero_wishlist') || '[]');
    let newList = [];
    if (isWishlisted) {
      newList = stored.filter((p: any) => p.id !== product.id);
    } else {
      newList = [...stored, product];
    }
    localStorage.setItem('ecozero_wishlist', JSON.stringify(newList));
    setIsWishlisted(!isWishlisted);
  };

  const fetchProductData = async () => {
    try {
      const docRef = doc(db, 'products', id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const productData = { id: docSnap.id, ...docSnap.data() } as any;
        setProduct(productData);

        try {
          const revQ = query(collection(db, 'reviews'), where('productId', '==', docSnap.id));
          const revSnap = await getDocs(revQ);
          const revData = revSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          revData.sort((a: any, b: any) => b.createdAt - a.createdAt);
          setReviews(revData);
        } catch (e) {}
      }
    } catch (error) {} finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('ecozero_cart') || '[]');
    const existingIndex = cart.findIndex((item: any) => item.id === product.id);
    if (existingIndex > -1) {
      cart[existingIndex].quantity += quantity;
    } else {
      cart.push({ ...product, quantity: quantity });
    }
    localStorage.setItem('ecozero_cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAddedPopup(true);
    setTimeout(() => setAddedPopup(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    localStorage.setItem('ecozero_checkout_item', JSON.stringify({ ...product, quantity: quantity }));
    const user = localStorage.getItem('ecozero_user');
    if (!user) {
      localStorage.setItem('redirect_after_login', '/checkout');
      router.push('/login');
    } else {
      router.push('/checkout');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const userStr = localStorage.getItem('ecozero_user');
    let user = null;
    if (userStr) {
      try { user = JSON.parse(userStr); } catch (err) { user = { name: userStr.split('@')[0] }; }
    }
    if (!user) {
      alert("Please login to write a review!");
      router.push('/login');
      return;
    }
    if (!newReviewText.trim()) return;

    setIsSubmittingReview(true);
    try {
      const newRev = {
        productId: id,
        userName: user.name || 'Eco Member',
        rating: newReviewRating,
        text: newReviewText,
        image: newReviewImage,
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, 'reviews'), newRev);
      setReviews(prev => [{ id: docRef.id, ...newRev }, ...prev]);
      setShowReviewForm(false);
      setNewReviewText('');
      setNewReviewRating(5);
      setNewReviewImage(null);
    } catch (error) {
      alert("Failed to post review.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too big (max 5MB)");
      return;
    }

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=bc2b31e802ebfbc0450bf45cfef8cf02`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setNewReviewImage(data.data.url);
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      alert("Error connecting to ImgBB.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F0' }}>
        <Loader2 className="animate-spin" size={40} color="#1C4E3A" />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F6F0', color: '#111', fontSize: '2rem', fontWeight: 800 }}>
        Product Not Found
      </div>
    );
  }

  const hasOldPrice = product.oldPrice && product.oldPrice > parseFloat(product.price);
  const originalPrice = hasOldPrice ? product.oldPrice : parseFloat(product.price) * 1.33;
  const discountPercentage = Math.round(((originalPrice - parseFloat(product.price)) / originalPrice) * 100);
  const averageRating = reviews.length > 0 ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const displayRating = averageRating.replace('.', ',');

  // Calculate review star distribution
  let starCounts: { [key: number]: number } = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating as keyof typeof starCounts] += 1;
    }
  });

  const maxStars = Math.max(...Object.values(starCounts), 1);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700&family=Inter:wght@400;500;600;700;800&display=swap');
        
        .buy-page {
          background-color: #F8F6F0;
          min-height: 100vh;
          padding: 120px 20px 80px;
          font-family: 'Inter', sans-serif;
          color: #111;
        }
        .buy-container {
          max-width: 1100px;
          margin: 0 auto;
        }
        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 60px;
        }
        
        /* IMAGE SECTION */
        .image-showcase {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .main-image {
          position: relative;
          background: transparent;
          border-radius: 54px;
          padding: 0;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .main-image-inner {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .carousel-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          transition: 0.2s;
          color: #111;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .carousel-btn:hover {
          background: #fff;
          transform: translateY(-50%) scale(1.1);
        }
        .carousel-btn.prev { left: 15px; }
        .carousel-btn.next { right: 15px; }
        
        .carousel-dots {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 10;
        }
        .dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(0,0,0,0.2);
          cursor: pointer;
          transition: 0.2s;
        }
        .dot.active {
          background: #295A43;
          width: 20px;
          border-radius: 4px;
        }
        .thumbnails {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .thumb-box {
          background: #fff;
          border-radius: 12px;
          padding: 0;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 2px solid transparent;
          transition: 0.2s;
          box-shadow: 0 4px 15px rgba(0,0,0,0.02);
          overflow: hidden;
        }
        .thumb-box.active {
          border-color: #295A43;
        }
        .thumb-box:hover:not(.active) {
          border-color: rgba(41, 90, 67, 0.3);
        }
        .thumb-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        /* INFO SECTION */
        .product-title {
          font-family: 'Oswald', sans-serif;
          font-size: 3.2rem;
          line-height: 1.1;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          margin-bottom: 8px;
          color: #111;
        }
        .product-subtitle {
          color: #888;
          font-size: 0.95rem;
          margin-bottom: 30px;
        }
        .price-row {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }
        .old-price {
          color: #aaa;
          text-decoration: line-through;
          font-size: 1.2rem;
          font-weight: 700;
        }
        .new-price {
          font-size: 2.2rem;
          font-weight: 800;
          color: #111;
        }
        .discount-badge {
          background: #295A43;
          color: #fff;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
        }
        .rating-stars-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 35px;
        }
        .stars-container {
          display: flex;
          color: #F5B800;
          gap: 2px;
        }
        .review-count-text {
          color: #888;
          font-size: 0.85rem;
          font-weight: 600;
        }
        
        /* COLOR PICKER */
        .color-section {
          margin-bottom: 35px;
        }
        .color-label {
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 12px;
          color: #111;
        }
        .color-options {
          display: flex;
          gap: 12px;
        }
        .color-circle {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          border: 1px solid rgba(0,0,0,0.1);
          outline-offset: 3px;
        }
        .color-circle.active {
          outline: 2px solid #295A43;
        }
        
        /* ACCORDION */
        .accordions-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 40px;
        }
        .accordion {
          background: #fff;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .accordion-header {
          padding: 18px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          background: #fff;
          border: none;
          width: 100%;
          color: #111;
          text-align: left;
        }
        .accordion-content {
          padding: 0 20px 20px;
          font-size: 0.85rem;
          color: #666;
          line-height: 1.6;
        }
        
        /* BUTTONS */
        .action-buttons {
          display: flex;
          gap: 20px;
        }
        .btn-add {
          flex: 1;
          background: #fff;
          color: #295A43;
          border: 2px solid #295A43;
          padding: 16px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-add:hover {
          background: rgba(41, 90, 67, 0.05);
        }
        .btn-checkout {
          flex: 1;
          background: #295A43;
          color: #fff;
          border: 2px solid #295A43;
          padding: 16px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-checkout:hover {
          background: #1C4E3A;
        }
        
        /* REVIEWS SECTION */
        .reviews-section {
          margin-top: 80px;
          padding-top: 60px;
          border-top: 1px solid rgba(0,0,0,0.08);
        }
        .reviews-title {
          font-family: 'Oswald', sans-serif;
          color: #295A43;
          font-size: 2rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 50px;
        }
        .reviews-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 60px;
        }
        .big-rating {
          display: flex;
          align-items: baseline;
          font-family: 'Oswald', sans-serif;
          color: #111;
        }
        .big-rating-number {
          font-size: 6rem;
          line-height: 1;
          letter-spacing: -2px;
        }
        .big-rating-slash {
          font-size: 1.5rem;
          color: #888;
          font-family: 'Inter', sans-serif;
          margin-left: 5px;
        }
        .review-count-small {
          color: #111;
          font-weight: 700;
          font-size: 0.8rem;
          margin: 10px 0 25px;
        }
        .progress-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .progress-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .progress-star-text {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #F5B800;
          font-weight: 700;
          font-size: 0.8rem;
          width: 30px;
        }
        .progress-track {
          flex: 1;
          height: 6px;
          background: #fff;
          border-radius: 10px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: #295A43;
          border-radius: 10px;
        }
        
        .review-cards-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 25px;
        }
        .review-card {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(0,0,0,0.04);
        }
        .review-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .review-author {
          font-weight: 700;
          color: #111;
          font-size: 0.9rem;
        }
        .review-text {
          color: #666;
          font-size: 0.85rem;
          line-height: 1.6;
          margin-bottom: 25px;
          flex: 1;
        }
        .review-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .review-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #E8E2D2;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-weight: 700;
          font-size: 0.8rem;
          overflow: hidden;
        }
        .review-date {
          font-size: 0.75rem;
          color: #aaa;
          font-weight: 500;
        }
        
        .empty-reviews-state {
          grid-column: span 2;
          text-align: center;
          padding: 60px;
          background: #fff;
          border-radius: 16px;
          border: 2px dashed #ddd;
          color: #888;
        }
        
        .load-more-btn {
          background: #295A43;
          color: #fff;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          margin: 40px auto 0;
          display: block;
          cursor: pointer;
        }
        
        @media (max-width: 900px) {
          .buy-page { padding: 0 !important; background: var(--bg-color) !important; }
          .buy-container { width: 100% !important; padding: 0 !important; }
          .main-grid { grid-template-columns: 1fr; gap: 0 !important; }
          .image-showcase { background: #fff; padding: 0; position: relative; border-top-left-radius: 40px; border-top-right-radius: 40px; overflow: hidden; margin: 0; width: 100% !important; max-width: 100% !important; }
          .main-image { padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; height: auto !important; aspect-ratio: 1 / 1 !important; background: #fff; width: 100% !important; }
          .main-image-inner { width: 100% !important; height: 100% !important; display: block !important; position: relative !important; }
          .main-image img { width: 100% !important; height: auto !important; min-height: 40vh; object-fit: contain; mix-blend-mode: multiply; display: block; }
          .carousel-dots { bottom: 15px !important; }
          .thumbnails { display: none !important; }
          
          .mobile-header {
            position: fixed; top: 0; left: 0; right: 0; 
            padding: 15px 20px; display: flex !important;
            justify-content: space-between; align-items: center;
            background: var(--bg-color); z-index: 1000;
          }
          .mobile-header-title { font-weight: 700; font-size: 1.1rem; color: #111; }
          .circle-btn {
            width: 40px; height: 40px; border-radius: 50%;
            background: #fff; border: 1.5px solid #eee;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 8px rgba(0,0,0,0.03);
            cursor: pointer;
          }
          
          .mobile-details-body { padding: 20px 25px 120px; position: relative; }
          .product-title { font-size: 1.5rem !important; font-family: 'Inter', sans-serif !important; text-transform: none !important; font-weight: 800 !important; letter-spacing: -0.5px !important; margin-bottom: 6px !important; }
          .product-subtitle { margin-bottom: 20px !important; font-size: 0.85rem !important; display: flex; align-items: center; gap: 6px; }
          
          .quantity-capsule {
            display: flex !important; width: fit-content; margin: 0 auto 24px;
            background: #fff; border: 1px solid #f0f0f0; border-radius: 40px;
            padding: 4px; align-items: center; gap: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.04);
            position: relative; z-index: 10;
          }
          .qty-btn { width: 36px; height: 36px; border-radius: 50%; border: none; font-size: 1.2rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; font-weight: 500; }
          .qty-btn-minus { background: transparent; color: #999; }
          .qty-btn-plus { background: #000; color: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.15); }
          
          .info-pills-row { display: flex; align-items: center; gap: 10px; margin-top: 15px; }
          .new-price { font-size: 1.6rem !important; font-weight: 900 !important; color: #111; }
          .old-price { font-size: 1rem !important; color: #ccc !important; text-decoration: line-through; font-weight: 700; }
          .discount-badge { background: #000 !important; color: #fff !important; font-size: 0.65rem !important; font-weight: 900 !important; padding: 4px 10px !important; border-radius: 10px !important; }
          
          .promo-banner {
            display: flex !important; padding: 14px 18px; border-radius: 12px;
            background: linear-gradient(135deg, #fffbeb 0%, #fff7ed 100%);
            border: 1px solid #fef3c7;
            margin: 20px 0; gap: 12px; align-items: flex-start;
          }
          .promo-banner p { font-size: 0.78rem; margin: 0; line-height: 1.5; color: #92400e; font-weight: 600; }
          
          .description-section { margin-top: 25px; }
          .description-title { font-weight: 800; font-size: 1rem; margin-bottom: 12px; display: block; }
          .description-text { font-size: 0.85rem; line-height: 1.6; color: #555; }
          
          .mobile-footer-cta {
             position: fixed; bottom: 0; left: 0; right: 0;
             padding: 15px 20px 35px; background: rgba(252, 247, 222, 0.95); backdrop-filter: blur(10px); 
             border-top: 1px solid rgba(0,0,0,0.03); z-index: 100;
          }
          .mobile-btn-cart {
            width: 100%; padding: 18px; border-radius: 50px;
            background: #111; color: #fff; border: none;
            font-weight: 800; font-size: 1.05rem;
            display: flex; align-items: center; justify-content: center; gap: 12px;
            cursor: pointer;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
          }

          .desktop-only { display: none !important; }

          .reviews-section { padding: 40px 25px; border-top: 8px solid #f8f8f8; margin-top: 0; }
          .reviews-grid { grid-template-columns: 1fr; gap: 40px; }
          .review-cards-grid { grid-template-columns: 1fr; gap: 20px; }
          .reviews-title { font-size: 1.4rem; margin-bottom: 25px; }
          .big-rating-number { font-size: 4rem; }
          .big-rating-slash { font-size: 1.2rem; }
          .progress-bars { max-width: 100%; }
          .review-card { padding: 20px; border: 1.5px solid #eee; }
          .empty-reviews-state { grid-column: span 1 !important; }
        }
        @media (min-width: 901px) {
          .mobile-only { display: none !important; }
        }
      `}} />

      <div className="buy-page">
        {/* MOBILE OVERRIDE HEADER WITH CLOSE BUTTON & CART */}
        <div className="mobile-only" style={{ padding: '20px 25px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-color)', position: 'relative', zIndex: 10 }}>
           <button onClick={() => router.back()} style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
             <ChevronLeft size={24} color="#111" strokeWidth={2.5} />
           </button>
           
           <button onClick={() => router.push('/cart')} style={{ position: 'relative', width: '45px', height: '45px', borderRadius: '50%', background: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 25px rgba(0,0,0,0.06)', cursor: 'pointer' }}>
             <ShoppingCart size={22} color="#111" strokeWidth={2.5} />
             {cartCount > 0 && (
               <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#FF5A35', color: '#fff', width: '18px', height: '18px', borderRadius: '50%', fontSize: '0.65rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--bg-color)' }}>
                 {cartCount}
               </span>
             )}
           </button>
        </div>

        <div className="buy-container">
          
          <div className="main-grid">
            {/* LEFT: IMAGES */}
            <div className="image-showcase">
              <div className="main-image">
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeImageIdx}
                      initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
                      transition={{ duration: 0.4, type: 'spring', stiffness: 300, damping: 30 }}
                      className="main-image-inner"
                      style={{ position: 'relative', width: '100%', height: '100%', minHeight: '350px' }}
                    >
                      <Image 
                        src={images[activeImageIdx] || 'https://via.placeholder.com/800x800?text=Product'} 
                        alt={product.name} 
                        fill
                        priority={true}
                        style={{ objectFit: 'cover' }}
                        draggable={false} 
                      />
                    </motion.div>
                </AnimatePresence>

                {images.length > 1 && (
                  <>
                    <button className="carousel-btn prev" onClick={(e) => { e.stopPropagation(); handlePrev(); }}>
                      <ChevronLeft size={24} />
                    </button>
                    <button className="carousel-btn next" onClick={(e) => { e.stopPropagation(); handleNext(); }}>
                      <ChevronRight size={24} />
                    </button>
                    <div className="carousel-dots">
                      {images.map((_, i) => (
                        <div 
                          key={i} 
                          className={`dot ${activeImageIdx === i ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); setActiveImageIdx(i); }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="thumbnails desktop-only">
                {images.slice(0, 3).map((img, i) => (
                  <div 
                    key={i} 
                    className={'thumb-box ' + (activeImageIdx === i ? 'active' : '')} 
                    onClick={() => setActiveImageIdx(i)}
                    style={{ position: 'relative' }}
                  >
                    <Image src={img} alt="" fill style={{ objectFit: 'cover' }} />
                  </div>
                ))}
              </div>

            </div>
            
            {/* QUANTITY PICKER MOBILE */}
            <div className="quantity-capsule mobile-only" style={{ marginTop: '20px', marginBottom: '10px' }}>
                <button className="qty-btn qty-btn-minus" onClick={() => setQuantity(Math.max(1, quantity - 1))}>&minus;</button>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{quantity < 10 ? `0${quantity}` : quantity}</span>
                <button className="qty-btn qty-btn-plus" onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            
            {/* RIGHT DETAILS (DESKTOP) */}
            <div className="desktop-only text-content-col">
              <h1 className="product-title">{product.name}</h1>
              <p className="product-subtitle">{product.category} &bull; Minimalist design for everyday living</p>
              
              <div className="price-row">
                <span className="old-price">${originalPrice.toFixed(2)}</span>
                <span className="new-price">${parseFloat(product.price).toFixed(2)}</span>
                <span className="discount-badge">-25% Disc</span>
              </div>
              
              <div className="rating-stars-row">
                <div className="stars-container">
                  {[1,2,3,4,5].map(s => <Star key={s} size={14} fill={s <= Math.round(parseFloat(averageRating)) ? 'currentColor' : 'none'} color={s <= Math.round(parseFloat(averageRating)) ? 'currentColor' : '#ddd'} />)}
                </div>
                <span className="review-count-text">({averageRating}) {reviews.length} Reviews &bull; {Math.max(product.stock * 5, 230)} Sold</span>
              </div>
              
              <div className="accordions-container">
                <div className="accordion">
                  <button className="accordion-header" onClick={() => setActiveAccordion(activeAccordion === 1 ? 0 : 1)}>
                    Descriptions <ChevronDown size={18} style={{ transform: activeAccordion === 1 ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
                  </button>
                  {activeAccordion === 1 && (
                    <div className="accordion-content">
                      {product.description || "Designed for the modern professional, this minimalist aesthetic focuses on quality materials and sustainable practices."}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="action-buttons-wrap" style={{ marginTop: '40px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  background: '#f8f8f8', border: '1px solid #eee', 
                  borderRadius: '35px', padding: '6px 12px',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.02)'
                }}>
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', border: '1px solid #eee', color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>-</button>
                  <span style={{ fontWeight: 800, minWidth: '35px', textAlign: 'center', fontSize: '1.1rem', color: '#111' }}>{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fff', border: '1px solid #eee', color: '#111', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>+</button>
                </div>
                
                <button 
                  onClick={toggleWishlist} 
                  style={{ 
                    width: '56px', height: '56px', borderRadius: '50%', 
                    border: '1px solid #eee', 
                    background: isWishlisted ? '#fff5f5' : '#fff', 
                    cursor: 'pointer', transition: '0.3s', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.04)'
                  }}
                >
                  <Heart size={22} fill={isWishlisted ? "#ff4d4d" : "none"} color={isWishlisted ? "#ff4d4d" : "#ddd"} />
                </button>

                <button 
                  className="btn-add-cart-outline" 
                  onClick={handleAddToCart}
                  style={{ 
                    height: '56px', padding: '0 30px', borderRadius: '35px', 
                    border: '2px solid #146845', background: 'transparent',
                    color: '#146845', fontWeight: 900, cursor: 'pointer',
                    fontSize: '1rem', flex: 1, minWidth: '180px',
                    transition: '0.3s'
                  }}
                >
                  {addedPopup ? 'Linked to Cart!' : 'Add to Collection'}
                </button>
                
                <button 
                  className="btn-checkout-primary" 
                  onClick={handleBuyNow}
                  style={{ 
                    height: '56px', padding: '0 40px', borderRadius: '35px', 
                    border: 'none', background: '#146845',
                    color: '#fff', fontWeight: 900, cursor: 'pointer',
                    fontSize: '1.2rem', flex: 1.5, minWidth: '220px',
                    boxShadow: '0 12px 25px rgba(20, 104, 69, 0.15)',
                    transition: '0.3s'
                  }}
                >
                  Order Now
                </button>
              </div>
            </div>

            {/* MOBILE DETAILS BODY */}
            <div className="mobile-details-body mobile-only">
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                 <div style={{ flex: 1 }}>
                    <h1 className="product-title" style={{ fontSize: '1.4rem', fontWeight: 900 }}>{product.name}</h1>
                    <div className="product-subtitle" style={{ color: '#aaa', fontWeight: 700, marginTop: '4px' }}>
                      <Zap size={14} fill="#8BC34A" stroke="#8BC34A" style={{ marginRight: '4px' }} /> Available on fast delivery
                    </div>
                 </div>
                 <button onClick={toggleWishlist} style={{ background: 'none', border: 'none', color: isWishlisted ? '#ff4d4d' : '#ccc', padding: '5px' }}>
                    <Heart size={26} fill={isWishlisted ? "#ff4d4d" : "none"} />
                 </button>
               </div>

               <div className="info-pills-row" style={{ marginTop: '18px' }}>
                  <span className="new-price" style={{ fontSize: '1.6rem', fontWeight: 900 }}>${parseFloat(product.price).toFixed(2)}</span>
                  <span className="old-price" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ccc', marginLeft: '8px' }}>${originalPrice.toFixed(2)}</span>
                  <div className="discount-badge" style={{ marginLeft: '10px' }}>20%</div>
                  <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '0.95rem' }}>
                    <Star size={18} fill="#F5B800" color="#F5B800" /> {averageRating} Rating
                  </div>
               </div>

               <div className="promo-banner">
                  <div style={{ 
                    minWidth: '20px', height: '20px', borderRadius: '50%', 
                    border: '1.5px solid #92400e', color: '#92400e', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: '11px', fontWeight: '900' 
                  }}>!</div>
                  <p>This promo is limited and may change at anytime depending on product availability.</p>
               </div>

               <div className="description-section">
                 <span className="description-title" style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '8px' }}>Description</span>
                 <p className="description-text" style={{ fontSize: '0.88rem', color: '#666', lineHeight: '1.6' }}>
                   {product.description || "Designed for the modern professional, this minimalist aesthetic focuses on quality materials and sustainable practices."}
                   <span style={{ fontWeight: 800, color: '#111', marginLeft: '5px', cursor: 'pointer', borderBottom: '1px solid #111' }}>Read More</span>
                 </p>
               </div>

               <div className="mobile-footer-cta">
                 <button className="mobile-btn-cart" onClick={handleAddToCart}>
                    {addedPopup ? <Loader2 className="animate-spin" size={22} /> : <ShoppingCart size={22} />}
                    {addedPopup ? 'Added To Cart!' : 'Add To Cart'}
                 </button>
               </div>
            </div>
          </div>
          
          {/* REVIEWS */}
          <div className="reviews-section">
            <h2 className="reviews-title">RATING &amp; REVIEWS</h2>
            
            <div className="reviews-grid">
              
              <div className="rating-summary-col">
                <div className="big-rating">
                  <span className="big-rating-number">{displayRating}</span>
                  <span className="big-rating-slash">/ 5</span>
                </div>
                <div className="review-count-small">({reviews.length} Verified Reviews)</div>
                
                <div className="progress-bars">
                  {[5,4,3,2,1].map(star => {
                    const count = starCounts[star] || 0;
                    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={star} className="progress-row">
                        <div className="progress-star-text"><Star size={12} fill="currentColor" /> {star}</div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: percentage + '%' }}></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              
              <div className="reviews-list-col">
                <div className="review-cards-grid">
                  {reviews.length > 0 ? (
                    reviews.map(r => (
                      <div className="review-card" key={r.id}>
                        <div className="review-card-header">
                          <div className="review-author">{r.userName}</div>
                          <ChevronUp size={16} color="#bbb" />
                        </div>
                        <div className="stars-container" style={{ margin: '0 0 15px' }}>
                          {[1,2,3,4,5].map(s => <Star key={s} size={13} fill={s <= r.rating ? 'currentColor' : 'none'} color={s <= r.rating ? 'currentColor' : '#ddd'} />)}
                        </div>
                        <div className="review-text">"{r.text}"</div>
                        {r.image && (
                          <div style={{ marginBottom: '15px', cursor: 'zoom-in' }} onClick={() => setLightboxImage(r.image)}>
                            <img src={r.image} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px' }} alt="Review" />
                          </div>
                        )}
                        <div className="review-footer">
                          <div className="review-avatar">{r.userName.charAt(0).toUpperCase()}</div>
                          <div className="review-date">{new Date(r.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-reviews-state">
                      <Star size={32} style={{ marginBottom: '12px', opacity: 0.3 }} />
                      <p style={{ fontWeight: 700, marginBottom: '4px' }}>No reviews yet</p>
                      <p style={{ fontSize: '0.85rem' }}>Be the first one to share your thoughts about this product!</p>
                    </div>
                  )}
                </div>
                
                <button className="load-more-btn" onClick={() => setShowReviewForm(!showReviewForm)}>
                  {showReviewForm ? 'Cancel Application' : 'Load More'}
                </button>

                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} style={{ marginTop: '30px', background: '#fff', padding: '24px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '5px', marginBottom: '15px' }}>
                      {[1,2,3,4,5].map(s => (
                        <button type="button" key={s} onClick={() => setNewReviewRating(s)} style={{ background:'none', border:'none', cursor:'pointer', color:'#F5B800' }}>
                          <Star size={20} fill={s <= newReviewRating ? 'currentColor' : 'none'} color={s <= newReviewRating ? 'currentColor' : '#ccc'} />
                        </button>
                      ))}
                    </div>
                      <textarea 
                        value={newReviewText} required 
                        onChange={e => setNewReviewText(e.target.value)} 
                        placeholder="Write your review here..."
                        style={{ width:'100%', padding:'15px', borderRadius:'8px', border:'1px solid #ddd', minHeight:'100px', marginBottom:'15px', fontFamily:'inherit' }}
                      />
                      
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '8px', color: '#666' }}>Attachment Photo (Optional)</label>
                        {newReviewImage ? (
                          <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                            <img src={newReviewImage} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                            <button type="button" onClick={() => setNewReviewImage(null)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#d33', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px' }}>×</button>
                          </div>
                        ) : (
                          <div style={{ 
                            border: '1px dashed #ddd', 
                            borderRadius: '8px', 
                            padding: '15px', 
                            textAlign: 'center',
                            cursor: 'pointer',
                            position: 'relative'
                          }}>
                            {isUploadingImage ? 'Uploading...' : 'Click to Upload Photo'}
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleImageUpload}
                              style={{ 
                                position: 'absolute', 
                                inset: 0, 
                                opacity: 0, 
                                cursor: 'pointer', 
                                visibility: isUploadingImage ? 'hidden' : 'visible' 
                              }} 
                            />
                          </div>
                        )}
                      </div>

                      <button type="submit" disabled={isSubmittingReview || isUploadingImage} style={{ background:'#295A43', color:'#fff', padding:'12px 24px', borderRadius:'8px', border:'none', fontWeight:700, cursor:'pointer' }}>
                        {isSubmittingReview ? 'Submitting...' : 'Submit'}
                      </button>
                  </form>
                )}
              </div>
            </div>
            
          </div>
          
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          style={{ 
            position: 'fixed', 
            inset: 0, 
            backgroundColor: 'rgba(0,0,0,0.85)', 
            zIndex: 3000, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            cursor: 'zoom-out',
            backdropFilter: 'blur(10px)',
            padding: '40px'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }} onClick={e => e.stopPropagation()}>
            <img src={lightboxImage} style={{ width: 'auto', height: 'auto', maxWidth: '100%', maxHeight: '90vh', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} alt="Review Full" />
            <button 
              onClick={() => setLightboxImage(null)}
              style={{ 
                position: 'absolute', 
                top: '-20px', 
                right: '-20px', 
                background: '#fff', 
                color: '#000', 
                border: 'none', 
                borderRadius: '50%', 
                width: '40px', 
                height: '40px', 
                cursor: 'pointer', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                fontSize: '20px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
