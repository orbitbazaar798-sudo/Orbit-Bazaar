import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store, Product, Order, Notice } from '../lib/store';
import { Plus, Edit, Trash2, Package, ShoppingBag, X, Upload, Settings, Activity, User as UserIcon, HandCoins, Box, Bell } from 'lucide-react';
import Logo from '../components/Logo';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'notices' | 'settings'>('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [stats, setStats] = useState({ visitors: 0, logins: 0, users: 0, products: 0, orders: 0, revenue: 0 });
  const [notifications, setNotifications] = useState<any[]>([]);
  
  // Notice Modal State
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newNoticeType, setNewNoticeType] = useState<'popup' | 'banner'>('popup');
  const [newNoticeDuration, setNewNoticeDuration] = useState('');
  
  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newRegularPrice, setNewRegularPrice] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newImages, setNewImages] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newOfferEndsAt, setNewOfferEndsAt] = useState('');

  // Delete Modal State
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  // Settings State
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [settingsMessage, setSettingsMessage] = useState('');

  const navigate = useNavigate();

  const [isProductsLoading, setIsProductsLoading] = useState(false);

  useEffect(() => {
    const user = store.getCurrentUser();
    if (!user || user.role !== 'admin') {
      navigate('/admin-login');
      return;
    }
    
    const fetchData = async () => {
      setIsProductsLoading(true);
      try {
        setProducts(await store.getProducts());
        setOrders(await store.getOrders());
        const adminStats = await store.getAdminStats();
        setStats(adminStats);
        setNotifications(await store.getNotifications());
      } finally {
        setIsProductsLoading(false);
      }
    };
    
    fetchData();
    
    // Load admin credentials for settings
    const creds = store.getAdminCredentials();
    setAdminName(creds.name);
    setAdminPassword(creds.password);

    const handleDataChange = async () => {
      setIsProductsLoading(true);
      try {
        setProducts(await store.getProducts());
        setOrders(await store.getOrders());
        setNotices(await store.getAdminNotices());
        const adminStats = await store.getAdminStats();
        setStats(adminStats);
        setNotifications(await store.getNotifications());
      } finally {
        setIsProductsLoading(false);
      }
    };
    window.addEventListener('products-changed', handleDataChange);
    window.addEventListener('orders-changed', handleDataChange);
    return () => {
      window.removeEventListener('products-changed', handleDataChange);
      window.removeEventListener('orders-changed', handleDataChange);
    };
  }, [navigate]);

  useEffect(() => {
    console.log('AdminDashboard: products state updated:', products.length);
  }, [products]);

  useEffect(() => {
    console.log('AdminDashboard: orders state updated:', orders.length);
  }, [orders]);

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    const success = await store.updateOrderStatus(orderId, status);
    if (success) {
      setOrders(await store.getOrders());
      setStats(await store.getAdminStats());
    }

    // Simulate SMS to customer
    let smsMessage = '';
    if (status === 'processing') {
       smsMessage = `Orbit Bazaar: ধন্যবাদ! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। অর্ডার আইডি: #${orderId}।`;
    } else if (status === 'shipped') {
       smsMessage = `Orbit Bazaar: আপনার পণ্যটি প্যাকেজিং শেষে ডেলিভারি গাড়িতে তোলা হয়েছে। দ্রুতই আপনার ঠিকানায় পৌঁছাবে।`;
    } else if (status === 'delivered') {
       smsMessage = `Orbit Bazaar: অভিনন্দন! আপনার পণ্যটি সফলভাবে পৌঁছে দেওয়া হয়েছে। আমাদের সাথে থাকার জন্য ধন্যবাদ।`;
    } else if (status === 'cancelled') {
       smsMessage = `Orbit Bazaar: দুঃখিত! আপনার অর্ডারটি (${orderId}) বাতিল করা হয়েছে। বিস্তারিত জানতে আমাদের সাথে যোগাযোগ করুন।`;
    }

    if (smsMessage) {
      alert(`📱 কাস্টমারের মোবাইলে SMS পাঠানো হয়েছে:\n\n"${smsMessage}"`);
    }
  };

  const handleUpdatePaymentStatus = async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    const success = await store.updatePaymentStatus(orderId, paymentStatus);
    if (success) {
      setOrders(await store.getOrders());
    }
  };

  const openAddModal = () => {
    setEditingProductId(null);
    setNewName('');
    setNewRegularPrice('');
    setNewPrice('');
    setNewDescription('');
    setNewImage('');
    setNewImages([]);
    setNewCategory('');
    setNewOfferEndsAt('');
    setIsProductModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProductId(product.id);
    setNewName(product.name);
    setNewRegularPrice(product.regularPrice ? product.regularPrice.toString() : '');
    setNewPrice(product.price.toString());
    setNewDescription(product.description);
    setNewImage(product.image);
    setNewImages(product.images || []);
    setNewCategory(product.category);
    setNewOfferEndsAt(product.offerEndsAt || '');
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attempting to save product...', { newName, newPrice, newImages });
    try {
      if (!newName || !newPrice) {
        alert('পণ্যের নাম এবং দাম অবশ্যই দিতে হবে।');
        return;
      }

      const productData: Product = {
        id: editingProductId || ('prod_' + Math.random().toString(36).substr(2, 9)),
        name: newName,
        price: Number(newPrice),
        regularPrice: newRegularPrice ? Number(newRegularPrice) : null as any,
        description: newDescription,
        image: newImage || (newImages.length > 0 ? newImages[0] : `https://picsum.photos/seed/${newName}/400/400`),
        images: newImages,
        category: newCategory || 'General',
        offerEndsAt: newOfferEndsAt || null
      };

      console.log('Product data to save:', productData);

      let success = false;
      if (editingProductId) {
        success = await store.updateProduct(productData);
      } else {
        success = await store.addProduct(productData);
      }
      
      if (success) {
        console.log('Product saved successfully');
        setProducts(await store.getProducts());
        setIsProductModalOpen(false);
        alert('পণ্যটি সফলভাবে সেভ করা হয়েছে।');
      } else {
        console.error('Failed to save product: store method returned false');
        alert('পণ্য সেভ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      }
    } catch (error) {
      console.error('Save product error:', error);
      alert('একটি ত্রুটি ঘটেছে: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      await store.deleteProduct(productToDelete);
      setProducts(await store.getProducts());
      setProductToDelete(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          setNewImages(prev => [...prev, result]);
          if (!newImage) setNewImage(result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setNewImages(prev => {
      const updated = prev.filter((_, i) => i !== index);
      if (index === 0 && updated.length > 0) {
        setNewImage(updated[0]);
      } else if (updated.length === 0) {
        setNewImage('');
      }
      return updated;
    });
  };

  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await store.addNotice({
      title: newNoticeTitle,
      content: newNoticeContent,
      type: newNoticeType,
      duration_ends_at: newNoticeDuration || null
    });
    if (success) {
      setNotices(await store.getAdminNotices());
      setIsNoticeModalOpen(false);
      setNewNoticeTitle('');
      setNewNoticeContent('');
      alert('নোটিশ সফলভাবে পাবলিশ করা হয়েছে!');
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (confirm('আপনি কি এই নোটিশটি মুছতে চান?')) {
      const success = await store.deleteNotice(id);
      if (success) {
        setNotices(await store.getAdminNotices());
      }
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.setAdminCredentials(adminName, adminPassword);
    
    // Update current user session name
    const currentUser = store.getCurrentUser();
    if (currentUser) {
      store.setCurrentUser({ ...currentUser, name: adminName });
      window.dispatchEvent(new Event('user-changed'));
    }
    
    setSettingsMessage('অ্যাডমিন সেটিংস সফলভাবে আপডেট করা হয়েছে!');
    setTimeout(() => setSettingsMessage(''), 3000);
  };

  const handleMarkRead = async () => {
    await store.markNotificationsRead();
    setNotifications(await store.getNotifications());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 transition-colors">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6 transition-colors">
            <div className="mb-4 md:mb-6 pb-4 md:pb-6 border-b border-gray-100 dark:border-gray-700 flex justify-center">
              <Logo className="h-10 md:h-12" showText={false} dark={false} />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6 text-center md:text-left">অ্যাডমিন প্যানেল</h2>
            <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 no-scrollbar">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                  activeTab === 'overview' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Activity className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">ওভারভিউ</span>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                  activeTab === 'products' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Package className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">পণ্য পরিচালনা</span>
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                  activeTab === 'orders' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">অর্ডার ট্র্যাকিং</span>
              </button>
              <button
                onClick={() => setActiveTab('notices')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                  activeTab === 'notices' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Bell className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">নোটিশ বোর্ড</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex-shrink-0 md:w-full flex items-center gap-2 md:gap-3 px-4 py-2 md:py-3 rounded-lg text-left transition-colors whitespace-nowrap ${
                  activeTab === 'settings' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base">অ্যাডমিন সেটিংস</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">অ্যাডমিন ওভারভিউ</h2>
                <button 
                  onClick={async () => {
                    setIsProductsLoading(true);
                    setStats(await store.getAdminStats());
                    setNotifications(await store.getNotifications());
                    setIsProductsLoading(false);
                  }}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                >
                  <Activity className={`w-4 h-4 ${isProductsLoading ? 'animate-spin' : ''}`} />
                  রিফ্রেশ করুন
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg text-white">
                  <div className="flex justify-between items-start mb-4">
                    <Activity className="w-8 h-8 opacity-50" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Real-time</span>
                  </div>
                  <div className="text-blue-100 text-sm font-medium mb-1">Total Visitors</div>
                  <div className="text-4xl font-bold">{stats.visitors}</div>
                  <div className="mt-4 text-xs text-blue-200">Total website visits tracked</div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6 rounded-2xl shadow-lg text-white">
                  <div className="flex justify-between items-start mb-4">
                    <UserIcon className="w-8 h-8 opacity-50" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Active</span>
                  </div>
                  <div className="text-purple-100 text-sm font-medium mb-1">Total Logins</div>
                  <div className="text-4xl font-bold">{stats.logins}</div>
                  <div className="mt-4 text-xs text-purple-200">Customer login sessions</div>
                </div>

                <div className="bg-gradient-to-br from-green-600 to-green-700 p-6 rounded-2xl shadow-lg text-white">
                  <div className="flex justify-between items-start mb-4">
                    <Package className="w-8 h-8 opacity-50" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Database</span>
                  </div>
                  <div className="text-green-100 text-sm font-medium mb-1">Total Customers</div>
                  <div className="text-4xl font-bold">{stats.users}</div>
                  <div className="mt-4 text-xs text-green-200">Registered user accounts</div>
                </div>

                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
                  <div className="flex justify-between items-start mb-4">
                    <Box className="w-8 h-8 opacity-50" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Inventory</span>
                  </div>
                  <div className="text-indigo-100 text-sm font-medium mb-1">Total Products</div>
                  <div className="text-4xl font-bold">{stats.products}</div>
                  <div className="mt-4 text-xs text-indigo-200">Total products in store</div>
                </div>

                <div className="bg-gradient-to-br from-orange-600 to-orange-700 p-6 rounded-2xl shadow-lg text-white">
                  <div className="flex justify-between items-start mb-4">
                    <ShoppingBag className="w-8 h-8 opacity-50" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Sales</span>
                  </div>
                  <div className="text-orange-100 text-sm font-medium mb-1">Total Orders</div>
                  <div className="text-4xl font-bold">{stats.orders}</div>
                  <div className="mt-4 text-xs text-orange-200">Total orders processed</div>
                </div>

                <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 rounded-2xl shadow-lg text-white lg:col-span-2">
                  <div className="flex justify-between items-start mb-4">
                    <HandCoins className="w-8 h-8 opacity-50" />
                    <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Earnings</span>
                  </div>
                  <div className="text-emerald-100 text-sm font-medium mb-1">Total Revenue</div>
                  <div className="text-4xl font-bold">৳{stats.revenue}</div>
                  <div className="mt-4 text-xs text-emerald-200">Total income from delivered orders</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-900">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                  <button onClick={handleMarkRead} className="text-xs text-blue-600 hover:underline">Mark all read</button>
                </div>
                <div className="space-y-4">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent activity.</p>
                  ) : (
                    notifications.slice(0, 10).map(n => (
                      <div key={n.id} className={`flex items-start gap-4 p-4 rounded-xl border border-gray-100 ${!n.is_read ? 'bg-blue-50/50' : 'bg-gray-50'}`}>
                        <div className={`p-2 rounded-lg ${
                          n.type === 'order' ? 'bg-orange-100 text-orange-600' :
                          n.type === 'login' ? 'bg-blue-100 text-blue-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {n.type === 'order' ? <ShoppingBag className="w-5 h-5" /> :
                           n.type === 'login' ? <UserIcon className="w-5 h-5" /> :
                           <Package className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{n.message}</div>
                          <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'products' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-900">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-gray-900">পণ্য তালিকা ({products.length})</h3>
                  <button 
                    onClick={async () => {
                      setProducts(await store.getProducts());
                      alert('পণ্য তালিকা রিফ্রেশ করা হয়েছে।');
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Refresh List"
                  >
                    <Activity className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  onClick={openAddModal}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold"
                >
                  <Plus className="w-4 h-4" />
                  নতুন পণ্য যোগ করুন
                </button>
              </div>

              <div className="overflow-x-auto -mx-6 md:mx-0">
                {isProductsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500">পণ্য লোড হচ্ছে...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>কোনো পণ্য পাওয়া যায়নি। নতুন পণ্য যোগ করুন।</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <table className="w-full text-left border-collapse hidden md:table">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="p-4 font-semibold text-gray-600">পণ্যের নাম</th>
                          <th className="p-4 font-semibold text-gray-600">দাম</th>
                          <th className="p-4 font-semibold text-gray-600">বিবরণ</th>
                          <th className="p-4 font-semibold text-gray-600 text-right">অপশন</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="p-4 font-medium text-gray-900 flex items-center gap-3">
                              <img src={product.image} alt={product.name} className="w-10 h-10 rounded object-cover" />
                              {product.name}
                            </td>
                            <td className="p-4 text-gray-600">
                              ৳{product.price}
                              {product.regularPrice && product.regularPrice > product.price && (
                                <span className="text-xs text-red-500 line-through ml-2">৳{product.regularPrice}</span>
                              )}
                            </td>
                            <td className="p-4 text-gray-600 truncate max-w-xs">{product.description}</td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => openEditModal(product)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setProductToDelete(product.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4">
                      {products.map((product) => (
                        <div key={product.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <div className="flex gap-4 mb-3">
                            <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate">{product.name}</h4>
                              <div className="text-blue-600 font-bold">
                                ৳{product.price}
                                {product.regularPrice && product.regularPrice > product.price && (
                                  <span className="text-xs text-red-500 line-through ml-2">৳{product.regularPrice}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                            <button 
                              onClick={() => openEditModal(product)}
                              className="flex items-center gap-1 px-3 py-1.5 text-blue-600 bg-blue-50 rounded-lg font-medium text-sm"
                            >
                              <Edit className="w-4 h-4" />
                              এডিট
                            </button>
                            <button 
                              onClick={() => setProductToDelete(product.id)}
                              className="flex items-center gap-1 px-3 py-1.5 text-red-600 bg-red-50 rounded-lg font-medium text-sm"
                            >
                              <Trash2 className="w-4 h-4" />
                              ডিলিট
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-900">
              <h3 className="text-xl font-bold text-gray-900 mb-6">অর্ডার ট্র্যাকিং</h3>
              {orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">কোনো অর্ডার পাওয়া যায়নি।</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="font-medium text-gray-900 flex items-center gap-3">
                          অর্ডার #{order.id}
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">তারিখ: {new Date(order.date).toLocaleDateString()}</div>
                        <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
                          <div className="text-sm font-semibold text-gray-800">কাস্টমার: {order.customerName}</div>
                          <div className="text-sm text-gray-600">মোবাইল: {order.phone}</div>
                          <div className="text-sm text-gray-600">ঠিকানা: {order.address}</div>
                          {order.customerEmail && <div className="text-sm text-gray-600">ইমেইল: {order.customerEmail}</div>}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                          মোট: ৳{order.totalAmount} | মেথড: <span className="uppercase font-medium">{order.paymentMethod}</span>
                        </div>
                        <div className="mt-3">
                          <div className="text-xs font-bold text-gray-400 uppercase mb-1">অর্ডারকৃত পণ্য:</div>
                          <div className="flex flex-wrap gap-2">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="bg-blue-50 text-blue-700 text-[10px] px-2 py-1 rounded border border-blue-100">
                                ID: {item.productId} (Qty: {item.quantity})
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">পেমেন্ট:</span>
                          <select 
                            value={order.paymentStatus}
                            onChange={(e) => handleUpdatePaymentStatus(order.id, e.target.value as Order['paymentStatus'])}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">স্ট্যাটাস:</span>
                          <select 
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                            className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-900">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">নোটিশ বোর্ড</h3>
                <button 
                  onClick={() => setIsNoticeModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-bold"
                >
                  <Plus className="w-4 h-4" />
                  নতুন নোটিশ দিন
                </button>
              </div>

              <div className="space-y-4">
                {notices.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">কোনো নোটিশ নেই।</p>
                ) : (
                  notices.map((notice) => (
                    <div key={notice.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{notice.title}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            notice.type === 'popup' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {notice.type}
                          </span>
                          {notice.duration_ends_at && (
                            <span className="text-[10px] text-gray-500 italic">
                              Ends: {new Date(notice.duration_ends_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{notice.content}</p>
                        <div className="text-[10px] text-gray-400 mt-2">পাবলিশড: {new Date(notice.created_at).toLocaleString()}</div>
                      </div>
                      <button 
                        onClick={() => handleDeleteNotice(notice.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-gray-900">
              <h3 className="text-xl font-bold text-gray-900 mb-6">অ্যাডমিন সেটিংস</h3>
              <div className="max-w-md">
                {settingsMessage && (
                  <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                    {settingsMessage}
                  </div>
                )}
                <form onSubmit={handleUpdateSettings} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">অ্যাডমিন নাম</label>
                    <input 
                      type="text" 
                      required 
                      value={adminName} 
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">নতুন পাসওয়ার্ড</label>
                    <input 
                      type="text" 
                      required 
                      value={adminPassword} 
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors mt-4"
                  >
                    সেভ করুন
                  </button>
                </form>

                <hr className="my-8 border-gray-200" />
                <h4 className="text-lg font-bold text-gray-900 mb-4">ওয়েবসাইট পপআপ ছবি (Welcome Promo)</h4>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const target = e.target as typeof e.target & { promoUrl: { value: string } };
                  await fetch('/api/admin/promo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: target.promoUrl.value || null })
                  });
                  alert('প্রোমো ছবি আপডেট হয়েছে!');
                }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ছবির লিংক (URL)</label>
                    <input 
                      name="promoUrl"
                      type="text" 
                      placeholder="https://example.com/promo.jpg"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">ওয়েবসাইটে ঢোকার সময় এই স্কয়ার বা পোর্ট্রেট ছবিটি দেখাবে। ডিলিট করতে ফাঁকা রেখে সেভ করুন।</p>
                  </div>
                  <button 
                    type="submit"
                    className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    ছবি সেভ করুন
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-gray-900">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {editingProductId ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                    <input 
                      type="text" 
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Regular Price</label>
                      <input 
                        type="number" 
                        value={newRegularPrice}
                        onChange={(e) => setNewRegularPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sale Price</label>
                      <input 
                        type="number" 
                        required
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Home">Home</option>
                      <option value="Beauty">Beauty</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Offer Ends At (Optional)</label>
                    <input 
                      type="datetime-local" 
                      value={newOfferEndsAt}
                      onChange={(e) => setNewOfferEndsAt(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                    <input 
                      type="file" 
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-500">Click to upload images</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {newImages.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img src={img} alt="" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  required
                  rows={4}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notice Modal */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-gray-900">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center transition-colors">
              <h3 className="text-xl font-bold text-gray-900">নতুন নোটিশ যোগ করুন</h3>
              <button onClick={() => setIsNoticeModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveNotice} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোটিশের টাইটেল</label>
                <input 
                  type="text" 
                  required
                  placeholder="যেমন: ধামাকা অফার!"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">নোটিশের বিষয়বস্তু</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="নোটিশের বিস্তারিত লিখুন..."
                  value={newNoticeContent}
                  onChange={(e) => setNewNoticeContent(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                ></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">টাইপ</label>
                  <select 
                    value={newNoticeType}
                    onChange={(e) => setNewNoticeType(e.target.value as 'popup' | 'banner')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  >
                    <option value="popup">Popup (মাঝখানে দেখাবে)</option>
                    <option value="banner">Banner (উপরে দেখাবে)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">শেষ হওয়ার সময় (ঐচ্ছিক)</label>
                  <input 
                    type="datetime-local" 
                    value={newNoticeDuration}
                    onChange={(e) => setNewNoticeDuration(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-6 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                  পাবলিশ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-gray-900">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Delete Product?</h3>
            <p className="text-gray-500 text-center mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors shadow-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
