import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { store, Notice } from '../lib/store';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [promoImage, setPromoImage] = useState<string | null>(null);
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromoAndNotices = async () => {
      const imageUrl = await store.getPromoImage();
      setPromoImage(imageUrl);

      const notices = await store.getNotices();
      const popupNotice = notices.find(n => n.type === 'popup');
      if (popupNotice) {
        setActiveNotice(popupNotice);
        setIsOpen(true);
      } else {
        const hasSeenPopup = sessionStorage.getItem('orbit_welcome_seen');
        if (!hasSeenPopup) {
          setIsOpen(true);
          sessionStorage.setItem('orbit_welcome_seen', 'true');
        }
      }
    };
    fetchPromoAndNotices();

    const handleDataUpdate = () => fetchPromoAndNotices();
    window.addEventListener('products-changed', handleDataUpdate);

    return () => window.removeEventListener('products-changed', handleDataUpdate);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 17) {
      return "শুভ সকাল! আপনার দিনটি ভালো কাটুক অর্বিট বাজারের সাথে।";
    } else {
      return "শুভ সন্ধ্যা! আজকের সেরা অফারগুলো দেখে নিন।";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`bg-gray-900 border border-[#00A3E1] rounded-2xl shadow-2xl max-w-md w-full relative text-center overflow-hidden ${promoImage ? 'p-0' : 'p-6 sm:p-8'}`}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-1 transition-colors z-20"
            >
              <X className="w-6 h-6" />
            </button>
            
            {activeNotice ? (
              <div className="p-6 sm:p-8">
                <span className="inline-block bg-purple-600 text-white font-bold px-3 py-1 rounded-full text-xs mb-4 uppercase tracking-wider animate-pulse">
                  Important Notice
                </span>
                <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
                  {activeNotice.title}
                </h2>
                <div className="text-gray-300 mb-6 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto no-scrollbar">
                  {activeNotice.content}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-[#00A3E1] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#0082b3] transition-colors shadow-lg"
                >
                  ঠিক আছে
                </button>
              </div>
            ) : promoImage ? (
              <div className="w-full relative cursor-pointer" onClick={() => { setIsOpen(false); navigate('/products'); }}>
                <img src={promoImage} alt="Welcome Promo" className="w-full h-auto object-cover max-h-[80vh]" referrerPolicy="no-referrer" />
              </div>
            ) : (
              <div className="mb-6">
                <span className="inline-block bg-[#00A3E1] text-white font-bold px-3 py-1 rounded-full text-xs mb-4 uppercase tracking-wider">
                  Special Offer
                </span>
                <h2 className="text-2xl font-bold text-white mb-4 leading-tight">
                  স্বাগতম অর্বিট বাজারে! 🛍️
                </h2>
                <p className="text-[#00A3E1] font-medium mb-4 text-lg">
                  {getGreeting()}
                </p>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  আমাদের আধুনিক গেজেট কালেকশন দেখতে এসেছেন বলে আমরা আনন্দিত। আপনার জন্য রয়েছে স্পেশাল ডিসকাউন্ট!
                </p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    navigate('/products');
                  }}
                  className="w-full bg-[#00A3E1] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#0082b3] transition-colors shadow-lg"
                >
                  কেনাকাটা শুরু করুন
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
