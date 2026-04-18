import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { store, Product, Order } from '../lib/store';
import { Heart, ShoppingBag, User as UserIcon, Star, LogOut } from 'lucide-react';

export default function UserDashboard() {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as any) || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'favorites'>(initialTab as any);

  useEffect(() => {
    const tab = searchParams.get('tab') as 'profile' | 'orders' | 'favorites';
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [favorites, setFavorites] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const user = store.getCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
      const allProducts = await store.getProducts();
      const favIds = store.getFavorites(user.id);
      setFavorites(allProducts.filter(p => favIds.includes(p.id)));
      
      console.log('UserDashboard: fetching orders for user:', user.id);
      const userOrders = await store.getUserOrders(user.id);
      console.log('UserDashboard: orders received:', userOrders.length);
      setOrders(userOrders);
    };
    
    fetchData();

    const handleDataChange = () => {
      fetchData();
    };

    window.addEventListener('favorites-changed', handleDataChange);
    window.addEventListener('orders-changed', handleDataChange);
    return () => {
      window.removeEventListener('favorites-changed', handleDataChange);
      window.removeEventListener('orders-changed', handleDataChange);
    };
  }, [user?.id, navigate]);

  const handleRemoveFavorite = async (productId: string) => {
    if (user) {
      store.toggleFavorite(user.id, productId);
      const allProducts = await store.getProducts();
      const favIds = store.getFavorites(user.id);
      setFavorites(allProducts.filter(p => favIds.includes(p.id)));
    }
  };

  const handleAddToCart = (productId: string) => {
    store.addToCart(productId);
    alert('পণ্যটি কার্টে যোগ করা হয়েছে!');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 text-gray-900">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg md:text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-gray-900 truncate">{user.name}</h2>
                <p className="text-xs md:text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                  activeTab === 'profile' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">প্রোফাইল</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                  activeTab === 'orders' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">অর্ডার হিস্ট্রি</span>
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                  activeTab === 'favorites' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Heart className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">সেভ করা পণ্য</span>
              </button>
              <button
                onClick={() => {
                  store.setCurrentUser(null);
                  window.dispatchEvent(new Event('user-changed'));
                  navigate('/');
                }}
                className="flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap md:mt-4"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">লগআউট</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 text-gray-900">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">প্রোফাইল ম্যানেজমেন্ট</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                  <input type="text" value={user.name} readOnly className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল</label>
                  <input type="email" value={user.email} readOnly className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">অর্ডার হিস্ট্রি</h3>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">আপনি এখনও কোনো অর্ডার করেননি।</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="font-medium text-gray-900">অর্ডার #{order.id}</div>
                          <div className="text-sm text-gray-500">তারিখ: {new Date(order.date).toLocaleDateString()}</div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize
                          ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                            order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : 
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                            'bg-green-100 text-green-800'}`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2 flex justify-between">
                        <span>{order.items.length} টি পণ্য</span>
                        <span className="uppercase text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {order.paymentMethod}
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-[10px] text-gray-500 bg-gray-50 px-2 py-1 rounded flex justify-between">
                            <span>পণ্য আইডি: {item.productId}</span>
                            <span>পরিমাণ: {item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                        <div className="font-bold text-gray-900">
                          মোট: ৳{order.totalAmount}
                        </div>
                        <div className={`text-xs font-bold px-2 py-1 rounded ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {order.paymentStatus === 'paid' ? 'PAID' : 'UNPAID'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">সেভ করা পণ্য (My Favorites)</h3>
              {favorites.length === 0 ? (
                <p className="text-gray-500 text-center py-8">আপনার কোনো সেভ করা পণ্য নেই।</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {favorites.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
                      <div className="relative h-48 bg-gray-100">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => handleRemoveFavorite(product.id)}
                          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-transform text-red-500"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-bold text-gray-900 mb-1">{product.name}</h4>
                        <p className="text-gray-900 font-bold mb-4">৳{product.price}</p>
                        <button 
                          onClick={() => handleAddToCart(product.id)}
                          className="mt-auto w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium shadow-sm"
                        >
                          দ্রুত অর্ডার করুন
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
