import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { store, Product } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

function ProductItem({ 
  product, 
  favorites, 
  handleToggleFavorite, 
  openProductDetails, 
  handleAddToCart 
}: { 
  product: Product, 
  favorites: string[], 
  handleToggleFavorite: any, 
  openProductDetails: any, 
  handleAddToCart: any,
  key?: string
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
    <div 
      onClick={() => openProductDetails(product)}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all group cursor-pointer relative flex flex-col"
    >
      <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-700">
        {isOffer && (
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-1">
            <div className="bg-[#FF0000] text-white text-xs font-black px-3 py-1 rounded-md shadow-lg flex items-center gap-1 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full"></span>
              -{discountPercent}% OFF
            </div>
            {timeLeft && (
              <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md animate-pulse">
                {timeLeft.d}d {timeLeft.h}h {timeLeft.m}m {timeLeft.s}s
              </div>
            )}
            {!timeLeft && (
              <div className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                🔥 Offer Product
              </div>
            )}
          </div>
        )}
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          referrerPolicy="no-referrer"
        />
        <button 
          onClick={(e) => handleToggleFavorite(product.id, e)}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
          title="Save for Later"
        >
          <Heart 
            className={`w-5 h-5 ${favorites.includes(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} 
          />
        </button>
      </div>
      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1 sm:mb-2">{product.category}</div>
        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 line-clamp-1">{product.name}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">৳{product.price}</span>
            {isOffer && (
              <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 line-through">৳{product.regularPrice}</span>
            )}
          </div>
          <button 
            onClick={(e) => handleAddToCart(product.id, e)}
            className="flex items-center gap-1 sm:gap-2 bg-orange-500 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:bg-orange-600 transition-colors shadow-sm font-bold text-xs sm:text-base"
          >
            <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
            অর্ডার
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState(store.getCurrentUser());
  const [toastMessage, setToastMessage] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      const data = await store.getProducts();
      setProducts(data);
    };
    
    fetchProducts();
    if (user) {
      setFavorites(store.getFavorites(user.id));
    }

    const handleProductsChange = async () => {
      const data = await store.getProducts();
      setProducts(data);
    };

    const handleFavoritesChange = () => {
      if (user) {
        setFavorites(store.getFavorites(user.id));
      }
    };

    window.addEventListener('products-changed', handleProductsChange);
    window.addEventListener('favorites-changed', handleFavoritesChange);
    return () => {
      window.removeEventListener('products-changed', handleProductsChange);
      window.removeEventListener('favorites-changed', handleFavoritesChange);
    };
  }, [user]);

  useEffect(() => {
    let interval: any;
    if (selectedProduct && selectedProduct.images && selectedProduct.images.length > 1) {
      interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.images!.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedProduct]);

  const handleToggleFavorite = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    store.toggleFavorite(user.id, productId);
    setFavorites(store.getFavorites(user.id));
  };

  const handleAddToCart = (productId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    store.addToCart(productId);
    setToastMessage('পণ্যটি কার্টে যোগ করা হয়েছে!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedProduct?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % selectedProduct.images!.length);
    }
  };

  const prevImage = () => {
    if (selectedProduct?.images) {
      setCurrentImageIndex((prev) => (prev - 1 + selectedProduct.images!.length) % selectedProduct.images!.length);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative transition-colors">
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          {toastMessage}
        </div>
      )}
      <div className="text-center mb-12 relative overflow-hidden">
        <div className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-4 py-1.5 rounded-full font-black text-[10px] md:text-xs mb-4 border border-orange-200 dark:border-orange-800 shadow-sm animate-bounce">
          🚚 সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা!
        </div>
        <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">আমাদের পণ্যসমূহ</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 font-medium">সেরা মানের পণ্য, সাশ্রয়ী মূল্যে এবং আস্থার সাথে</p>
        <div className="mt-4 flex justify-center items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
          <span>১০০% জেনুইন</span>
          <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
          <span>দ্রুত ডেলিভারি</span>
          <span className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
          <span>চেক করে পেমেন্ট</span>
        </div>
        <div className="mt-6 text-sm">
          <span className="text-gray-400">স্থায়ী লিঙ্ক: </span>
          <a href="https://ais-pre-5zlzj5xsuxh5giav4j5bbv-520908111864.asia-southeast1.run.app" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Orbit Bazaar (অর্বিট বাজার)</a>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductItem 
            key={product.id}
            product={product}
            favorites={favorites}
            handleToggleFavorite={handleToggleFavorite}
            openProductDetails={openProductDetails}
            handleAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* Product Details Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden relative flex flex-col md:flex-row max-h-[90vh] border dark:border-gray-800"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 p-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-md z-10 transition-colors"
              >
                <X className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>

              {/* Image Gallery */}
              <div className="w-full md:w-1/2 bg-gray-100 dark:bg-gray-800 relative h-64 md:h-auto">
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={selectedProduct.images && selectedProduct.images.length > 0 
                      ? selectedProduct.images[currentImageIndex] 
                      : selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {selectedProduct.images && selectedProduct.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white rounded-full shadow-md transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white rounded-full shadow-md transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                      {selectedProduct.images.map((_, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-all ${currentImageIndex === idx ? 'bg-blue-600 w-4' : 'bg-gray-400'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Product Info */}
              <div className="w-full md:w-1/2 p-8 overflow-y-auto">
                <div className="text-sm text-blue-600 dark:text-blue-400 font-semibold mb-2 uppercase tracking-wider">{selectedProduct.category}</div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{selectedProduct.name}</h2>
                <div className="text-sm font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 inline-block px-2 py-1 rounded mb-4 border border-emerald-100 dark:border-emerald-800">
                  ✅ ১০০% প্রিমিয়াম কোয়ালিটি গ্যারান্টি!
                </div>

                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">৳{selectedProduct.price}</span>
                  {selectedProduct.regularPrice && selectedProduct.regularPrice > selectedProduct.price && (
                    <span className="text-xl text-gray-400 dark:text-gray-500 line-through">৳{selectedProduct.regularPrice}</span>
                  )}
                </div>

                {selectedProduct.regularPrice && selectedProduct.regularPrice > selectedProduct.price && (
                  <div className="flex items-center gap-2 mb-6">
                    <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">🔥 Limited Time Offer</span>
                    <span className="text-red-600 font-bold text-sm">-{Math.round(((selectedProduct.regularPrice - selectedProduct.price) / selectedProduct.regularPrice) * 100)}% OFF</span>
                  </div>
                )}

                <div className="prose prose-sm text-gray-600 dark:text-gray-400 mb-8">
                  <h4 className="text-gray-900 dark:text-white font-bold mb-2">পণ্যের বিবরণ:</h4>
                  <p>{selectedProduct.description}</p>
                  <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800 text-orange-800 dark:text-orange-300 text-xs font-medium">
                    ⏳ Hurry – Stock Limited! আমাদের এই অফারটি সীমিত সময়ের জন্য।
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => handleAddToCart(selectedProduct.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    অর্ডার করুন
                  </button>
                  <button 
                    onClick={() => handleToggleFavorite(selectedProduct.id)}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold border-2 transition-colors ${
                      favorites.includes(selectedProduct.id) 
                        ? 'border-red-500 text-red-500 bg-red-50' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${favorites.includes(selectedProduct.id) ? 'fill-current' : ''}`} />
                    সেভ করুন
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
