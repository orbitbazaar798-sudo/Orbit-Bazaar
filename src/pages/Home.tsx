import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Truck, HandCoins, Activity, Headphones, ShoppingCart, Heart, Zap, Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';
import { store, Product, Notice } from '../lib/store';

const slides = [
  {
    id: 1,
    title: 'স্মার্ট ওয়াচ',
    subtitle: 'সেরা দামে আধুনিক স্মার্ট ওয়াচ',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&h=500&q=80',
    link: '/products',
    discount: '20% ছাড়'
  },
  {
    id: 2,
    title: 'ওয়্যারলেস ইয়ারবাড',
    subtitle: 'ক্লিয়ার সাউন্ড ও দীর্ঘ ব্যাটারি',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&h=500&q=80',
    link: '/products'
  },
  {
    id: 3,
    title: 'সিসি ক্যামেরা',
    subtitle: 'আপনার বাড়ির সর্বোচ্চ নিরাপত্তা',
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1200&h=500&q=80',
    link: '/products'
  },
  {
    id: 4,
    title: 'ইয়ারফোন',
    subtitle: 'দুর্দান্ত মিউজিক এক্সপেরিয়েন্স',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=1200&h=500&q=80',
    link: '/products'
  },
  {
    id: 5,
    title: 'মিনি হাত ফ্যান',
    subtitle: 'গরমে প্রশান্তির ছোঁয়া',
    image: 'https://i.postimg.cc/VN7Xk6BM/IMG-20230717-WA0059.webp',
    link: '/products'
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState(store.getCurrentUser());
  const [activeBanner, setActiveBanner] = useState<Notice | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanner = async () => {
      const notices = await store.getNotices();
      const banner = notices.find(n => n.type === 'banner');
      setActiveBanner(banner || null);
    };
    fetchBanner();

    const handleUpdate = () => fetchBanner();
    window.addEventListener('products-changed', handleUpdate);
    window.addEventListener('orders-changed', handleUpdate);

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    
    if (user) {
      setFavorites(store.getFavorites(user.id));
    }

    const handleFavoritesChange = () => {
      const currentUser = store.getCurrentUser();
      if (currentUser) {
        setFavorites(store.getFavorites(currentUser.id));
      }
    };

    const handleUserChange = () => {
      setUser(store.getCurrentUser());
    };

    window.addEventListener('favorites-changed', handleFavoritesChange);
    window.addEventListener('user-changed', handleUserChange);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('favorites-changed', handleFavoritesChange);
      window.removeEventListener('user-changed', handleUserChange);
      window.removeEventListener('products-changed', handleUpdate);
    };
  }, [user]);

  const handleToggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    store.toggleFavorite(user.id, productId);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'শুভ সকাল';
    if (hour >= 12 && hour < 16) return 'শুভ দুপুর';
    if (hour >= 16 && hour < 20) return 'শুভ বিকাল';
    return 'শুভ রাত্রি';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Banner From Admin */}
      <AnimatePresence>
        {activeBanner && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-yellow-400 text-black py-3 px-4 relative flex items-center justify-center overflow-hidden"
          >
             <div className="flex items-center gap-3 animate-pulse">
                <Bell className="w-5 h-5 flex-shrink-0" />
                <div className="text-center">
                  <span className="font-black mr-2 uppercase">{activeBanner.title}:</span>
                  <span className="font-bold">{activeBanner.content}</span>
                </div>
             </div>
             <button onClick={() => setActiveBanner(null)} className="absolute right-4 p-1 hover:bg-black/10 rounded-full transition-colors">
               <X className="w-4 h-4" />
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cash On Delivery Prominent Bar */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white text-center py-2 text-[10px] md:text-sm font-black shadow-md z-30 uppercase tracking-widest border-y border-white/20">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1.5">
            <HandCoins className="w-4 h-4 animate-bounce" />
            সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা!
          </span>
          <span className="opacity-50">|</span>
          <span className="text-yellow-300">পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</span>
        </div>
      </div>

      {/* Hero Slider Section */}
      <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <Link to={slides[currentSlide].link} className="block w-full h-full relative group">
              <img 
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title} 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-70 transition-opacity"
              />
              
              {/* Discount Badge */}
              {slides[currentSlide].discount && (
                <div className="absolute top-6 left-6 md:top-10 md:left-10 bg-[#FF0000] text-white text-sm md:text-lg font-bold px-4 py-2 rounded-full shadow-lg z-10 animate-pulse">
                  {slides[currentSlide].discount}
                </div>
              )}

              <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center z-10">
                {currentSlide === 0 && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-6"
                  >
                    <Logo className="h-20 md:h-28 drop-shadow-2xl" showText={false} />
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-black/40 backdrop-blur-sm px-6 py-2 rounded-full mb-4 border border-white/10"
                >
                  <span className="text-yellow-400 font-medium tracking-wide">আপনার আস্থার অর্বিট বাজার!</span>
                </motion.div>

                <motion.h1 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 drop-shadow-lg"
                >
                  {slides[currentSlide].title}
                </motion.h1>
                <motion.p 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-xl md:text-2xl mb-8 text-gray-200 drop-shadow-md"
                >
                  {slides[currentSlide].subtitle}
                </motion.p>
                <motion.span
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="inline-block bg-orange-500 text-white font-bold text-lg px-8 py-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
                >
                  অর্ডার করুন
                </motion.span>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 inline-block text-xs md:text-sm text-yellow-300"
                >
                  <span className="text-white/60">স্থায়ী লিঙ্ক: </span>
                   <a href="https://ais-pre-5zlzj5xsuxh5giav4j5bbv-520908111864.asia-southeast1.run.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">Orbit Bazaar (অর্বিট বাজার)</a>
                </motion.div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Dots */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                currentSlide === index ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side: 3 Products (75%) */}
            <div className="w-full md:w-3/4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { title: 'স্মার্ট ওয়াচ', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&h=500&q=80' },
                  { title: 'ওয়্যারলেস ইয়ারবাড', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=500&h=500&q=80' },
                  { title: 'সিসি ক্যামেরা', image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=500&h=500&q=80' }
                ].map((item, idx) => (
                  <Link to="/products" key={idx} className="group block relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="aspect-square overflow-hidden">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                      <h3 className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">{item.title}</h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side: View All Link (25%) */}
            <div className="w-full md:w-1/4 flex justify-center md:justify-end items-center">
              <Link to="/products" className="group flex items-center gap-2 text-[#00A3E1] hover:text-[#0082b3] transition-colors">
                <span className="text-lg font-semibold whitespace-nowrap">সকল পণ্য দেখুন</span>
                <motion.span
                  className="inline-block"
                  whileHover={{ x: 8 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  →
                </motion.span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Special Flash Offers Section */}
      <FlashOffers 
        favorites={favorites} 
        onToggleFavorite={handleToggleFavorite} 
      />

      {/* General Products Section */}
      <GeneralProducts 
        favorites={favorites} 
        onToggleFavorite={handleToggleFavorite} 
      />

      {/* Services Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center justify-center gap-2">
              <span className="text-blue-600">🛠</span> আমাদের সেবা সমূহ
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">কেন আপনি আমাদের বেছে নেবেন?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<ShieldCheck className="w-10 h-10 text-blue-600" />}
              title="১. শতভাগ আসল পণ্যের নিশ্চয়তা"
              description="আমরা সরাসরি অনুমোদিত ভেন্ডর থেকে পণ্য সংগ্রহ করি। ঘড়ি, ইয়ারবাড থেকে শুরু করে সিসি ক্যামেরা—প্রতিটি পণ্যই জেনুইন এবং গুণগত মানসম্পন্ন।"
            />
            <FeatureCard 
              icon={<Truck className="w-10 h-10 text-blue-600" />}
              title="২. দ্রুততম হোম ডেলিভারি"
              description="সারা বাংলাদেশে আমাদের হোম ডেলিভারি সেবা সচল। আপনি আপনার নির্ধারিত ঠিকানায় বসেই আমাদের পণ্য হাতে পাবেন। অর্ডার কনফার্ম হওয়ার পর দ্রুততম সময়ে ডেলিভারি নিশ্চিত করাই আমাদের লক্ষ্য।"
            />
            <FeatureCard 
              icon={<HandCoins className="w-10 h-10 text-blue-600" />}
              title="৩. ক্যাশ অন ডেলিভারি সুবিধা"
              description="অনলাইনে অর্ডার করার ক্ষেত্রে আস্থার সংকট দূর করতে আমরা দিচ্ছি ক্যাশ অন ডেলিভারি। পণ্য হাতে পেয়ে, চেক করে তারপর টাকা পরিশোধ করার সুযোগ পাবেন।"
            />
            <FeatureCard 
              icon={<Activity className="w-10 h-10 text-blue-600" />}
              title="৪. আধুনিক অর্ডার ট্র্যাকিং ও আপডেট"
              description="আপনার পণ্যটি প্যাকিং হয়েছে কি না বা কতদূর আসলো—তার প্রতিটি আপডেট আপনি অটোমেটিক মেসেজের মাধ্যমে জানতে পারবেন। আপনার ড্যাশবোর্ড থেকেও রিয়েল-টাইম স্ট্যাটাস চেক করতে পারবেন।"
            />
            <FeatureCard 
              icon={<Headphones className="w-10 h-10 text-blue-600" />}
              title="৫. নিরবচ্ছিন্ন কাস্টমার সাপোর্ট"
              description="পণ্য কেনা বা ব্যবহারের ক্ষেত্রে কোনো সমস্যা হলে আমাদের লাইভ চ্যাট বা হোয়াটসঅ্যাপের মাধ্যমে সরাসরি যোগাযোগ করুন। আমাদের টিম আপনাকে তাৎক্ষণিক সমাধান দিতে প্রস্তুত।"
            />
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-gray-50 dark:bg-gray-800/50 py-16 border-t border-gray-200 dark:border-gray-700 transition-colors">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">💡 বিশ্বাসযোগ্য ও ব্যবহারকারী-বান্ধব</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 mb-2">এক টাকাও আগে দিতে হবে না</h3>
              <p className="text-gray-600 dark:text-gray-400">গ্রাহক পণ্য হাতে পেয়ে পরিশোধ করবে। কোনো অগ্রিম পেমেন্টের ঝামেলা নেই।</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-lg text-blue-600 dark:text-blue-400 mb-2">100% নিরাপদ লেনদেন</h3>
              <p className="text-gray-600 dark:text-gray-400">বিকাশ এবং নগদ ব্যবস্থার মাধ্যমে নিরাপদ লেনদেন।</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center hover:shadow-md transition-all border border-gray-100 dark:border-gray-700">
      <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}

export function ProductCard({ 
  product, 
  isFavorite = false, 
  onToggleFavorite 
}: { 
  product: Product, 
  isFavorite?: boolean, 
  onToggleFavorite?: (id: string, e?: React.MouseEvent) => void 
}) {
  const isOffer = product.regularPrice && product.regularPrice > product.price;
  const discountPercent = isOffer ? Math.round(((product.regularPrice! - product.price) / product.regularPrice!) * 100) : 0;

  const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

  useEffect(() => {
    if (!product.offerEndsAt) return;
    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(product.offerEndsAt!).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }
      setTimeLeft({
        d: Math.floor(diff / (1000 * 60 * 60 * 24)),
        h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((diff % (1000 * 60)) / 1000)
      });
    };
    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [product.offerEndsAt]);

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden group relative flex flex-col h-full transition-colors"
    >
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
        {isOffer && (
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            <div className="bg-[#FF0000] text-white text-[10px] md:text-xs font-black px-2 py-1 rounded-md shadow-lg flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              -{discountPercent}% OFF
            </div>
            {timeLeft && (
              <div className="bg-orange-500 text-white text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md animate-pulse">
                {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
              </div>
            )}
            {!timeLeft && (
              <div className="bg-orange-500 text-white text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                🔥 Offer Product
              </div>
            )}
          </div>
        )}
        <Link to="/products" className="block w-full h-full">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </Link>
        
        {onToggleFavorite && (
          <button 
            onClick={(e) => onToggleFavorite(product.id, e)}
            className="absolute top-3 right-3 p-2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black rounded-full shadow-md z-10 transition-all hover:scale-110"
            title="Save for Later"
          >
            <Heart 
              className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-300'}`} 
            />
          </button>
        )}
      </div>
      
      <div className="p-4">
        <Link to="/products" className="block">
          <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">{product.category}</div>
          <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{product.name}</h3>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-black text-gray-900 dark:text-white">৳{product.price}</span>
            {isOffer && (
              <span className="text-xs text-gray-400 dark:text-gray-500 line-through">৳{product.regularPrice}</span>
            )}
          </div>
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 text-[10px] text-orange-600 dark:text-orange-400 font-medium">
            <Activity className="w-3 h-3" />
            Limited Stock Available
          </div>
          <Link 
            to="/products"
            className="w-full bg-orange-500 text-white text-center py-2 rounded-lg font-bold text-xs hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-3 h-3" />
            অর্ডার করুন
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function FlashOffers({ 
  favorites, 
  onToggleFavorite 
}: { 
  favorites: string[], 
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void 
}) {
  const [offerProducts, setOfferProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchOffers = async () => {
      const allProducts = await store.getProducts();
      const offers = allProducts.filter(p => p.regularPrice && p.regularPrice > p.price);
      setOfferProducts(offers.slice(0, 15));
    };
    fetchOffers();

    const handleProductsChanged = () => fetchOffers();
    window.addEventListener('products-changed', handleProductsChanged);
    return () => window.removeEventListener('products-changed', handleProductsChanged);
  }, []);

  if (offerProducts.length === 0) return null;

  return (
    <section className="py-16 bg-white dark:bg-gray-900 overflow-hidden transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="bg-red-600 p-2 rounded-lg">
              <Zap className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">🔥 Special Flash Offers</h2>
              <p className="text-gray-500 dark:text-gray-400">Limited Time Offer - Hurry Up!</p>
            </div>
          </div>
          <Link to="/products" className="text-red-600 dark:text-red-400 font-bold hover:underline">View All Offers →</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {offerProducts.map(product => (
            <div key={product.id}>
              <ProductCard 
                product={product} 
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function GeneralProducts({ 
  favorites, 
  onToggleFavorite 
}: { 
  favorites: string[], 
  onToggleFavorite: (id: string, e?: React.MouseEvent) => void 
}) {
  const [generalProducts, setGeneralProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchGeneral = async () => {
      const allProducts = await store.getProducts();
      const general = allProducts.filter(p => !p.regularPrice || p.regularPrice <= p.price);
      setGeneralProducts(general.slice(0, 15));
    };
    fetchGeneral();

    const handleProductsChanged = () => fetchGeneral();
    window.addEventListener('products-changed', handleProductsChanged);
    return () => window.removeEventListener('products-changed', handleProductsChanged);
  }, []);

  if (generalProducts.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800/50 overflow-hidden border-t border-gray-100 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">অন্যান্য পণ্যসমূহ</h2>
            <p className="text-gray-500 dark:text-gray-400">আমাদের সেরা কালেকশন</p>
          </div>
          <Link to="/products" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">সকল পণ্য →</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {generalProducts.map(product => (
            <div key={product.id}>
              <ProductCard 
                product={product} 
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
