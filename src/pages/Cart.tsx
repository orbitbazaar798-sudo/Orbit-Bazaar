import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store, Product } from '../lib/store';
import { Trash2, ShoppingBag, CheckCircle2, Minus, Plus } from 'lucide-react';
import Logo from '../components/Logo';

export default function Cart() {
  const [cartItems, setCartItems] = useState<{ product: Product; quantity: number }[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad'>('cod');
  const [toastMessage, setToastMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const user = store.getCurrentUser();
  const navigate = useNavigate();

  const DELIVERY_CHARGE = 130;

  useEffect(() => {
    const init = async () => {
      await loadCart();
      const savedInfo = store.getCustomerInfo();
      if (savedInfo && (savedInfo.name || savedInfo.phone || savedInfo.email || savedInfo.address)) {
        setName(savedInfo.name || '');
        setEmail(savedInfo.email || '');
        setPhone(savedInfo.phone || '');
        setAddress(savedInfo.address || '');
      } else if (user) {
        setName(user.name || '');
        setEmail(user.email || '');
        setPhone(user.phone_number || '');
      }
    };
    init();
  }, [user]);

  const loadCart = async () => {
    const cart = store.getCart();
    const products = await store.getProducts();
    
    const items = cart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    }).filter(Boolean) as { product: Product; quantity: number }[];
    
    setCartItems(items);
  };

  const handleRemove = async (productId: string) => {
    store.removeFromCart(productId);
    await loadCart();
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    store.updateCartQuantity(productId, newQuantity);
    await loadCart();
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) return;

    // Save customer info for future auto-fill
    store.setCustomerInfo({ name, email, phone, address });

    const totalAmount = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) + DELIVERY_CHARGE;

    await store.addOrder({
      id: 'ORD' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: user.id,
      items: cartItems.map(item => ({ productId: item.product.id, quantity: item.quantity })),
      totalAmount,
      deliveryCharge: DELIVERY_CHARGE,
      status: 'pending',
      paymentMethod,
      paymentStatus: 'pending',
      date: new Date().toISOString(),
      address,
      phone,
      customerName: name,
      customerEmail: email
    });

    // Simulate Admin Notification
    alert(`🔔 অ্যাডমিন নোটিফিকেশন:\nনতুন অর্ডার এসেছে!\nনাম: ${name}\nমোবাইল: ${phone}\n(অ্যাডমিনের WhatsApp 01675674183 এ মেসেজ পাঠানো হয়েছে)`);

    store.clearCart();
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
      navigate('/dashboard?tab=orders', { replace: true });
    }, 3000);
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const total = subtotal > 0 ? subtotal + DELIVERY_CHARGE : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative">
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 text-gray-900">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center animate-bounce-short">
            <div className="mb-6 flex justify-center">
              <Logo className="h-12" showText={false} dark={false} />
            </div>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">ধন্যবাদ!</h3>
            <p className="text-gray-600 text-lg">
              আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। আমাদের প্রতিনিধি শীঘ্রই আপনাকে ফোন করবেন।
            </p>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-gray-900 mb-8">শপিং কার্ট</h1>

      <div className="flex flex-col lg:flex-row gap-8 text-gray-900">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">আপনার কার্ট খালি!</p>
                <button 
                  onClick={() => navigate('/products')}
                  className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  কেনাকাটা করুন
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center py-4 border-b border-gray-100 last:border-0">
                    <div className="flex gap-4 w-full">
                      <img src={item.product.image} alt={item.product.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{item.product.name}</h3>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                            <button 
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                              className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-1 font-medium text-gray-900 border-x border-gray-300">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                              className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-blue-600 font-bold mt-2">৳{item.product.price * item.quantity}</p>
                      </div>
                      <button 
                        onClick={() => handleRemove(item.product.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors self-start"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Checkout Form */}
        {cartItems.length > 0 && (
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">অর্ডার সামারি</h2>
                <Logo className="h-8" showText={false} dark={false} />
              </div>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>সাবটোটাল</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span>৳{DELIVERY_CHARGE}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-lg pt-3 border-t border-gray-100">
                  <span>সর্বমোট</span>
                  <span>৳{total}</span>
                </div>
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg mb-6 text-sm font-medium">
                💰 ক্যাশ অন ডেলিভারি – পণ্য হাতে পেয়ে, দেখে তারপরই পেমেন্ট করুন!
              </div>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">নাম</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-gray-900"
                    placeholder="আপনার পুরো নাম লিখুন"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">মোবাইল নাম্বার</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-gray-900"
                    placeholder="০১৭XXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ইমেইল (ঐচ্ছিক)</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-gray-900"
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">হোম ডেলিভারি ঠিকানা</label>
                  <textarea 
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none text-gray-900"
                    rows={3}
                    placeholder="বাসা নম্বর, রোড নম্বর, এলাকা এবং জেলা"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">পেমেন্ট মেথড</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'bkash' | 'nagad')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-gray-900"
                  >
                    <option value="cod">ক্যাশ অন ডেলিভারি (COD)</option>
                    <option value="bkash">বিকাশ (bKash)</option>
                    <option value="nagad">নগদ (Nagad)</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-orange-500 text-white font-bold py-3 rounded-lg hover:bg-orange-600 transition-colors mt-4 shadow-md"
                >
                  অর্ডার কনফার্ম করুন
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
