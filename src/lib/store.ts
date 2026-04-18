export type Product = {
  id: string;
  name: string;
  price: number; // Sale Price
  regularPrice?: number; // Regular Price
  description: string;
  image: string; // Primary image
  images?: string[]; // Multiple images
  category: string;
  offerEndsAt?: string | null;
  createdAt?: string;
};

export type User = {
  id: string;
  name: string;
  email: string | null;
  phone_number: string | null;
  role: 'customer' | 'admin';
};

export type Order = {
  id: string;
  userId: string;
  items: { productId: string; quantity: number }[];
  totalAmount: number;
  deliveryCharge: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  paymentStatus: 'pending' | 'paid';
  date: string;
  address: string;
  phone: string;
  customerName: string;
  customerEmail: string;
};

export type Notice = {
  id: number;
  title: string;
  content: string;
  type: 'popup' | 'banner';
  is_active: number;
  duration_ends_at: string | null;
  created_at: string;
};

export type Review = {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'স্মার্ট ওয়াচ',
    price: 1200,
    regularPrice: 1500,
    description: 'উন্নত মানের স্মার্ট ওয়াচ, হার্ট রেট মনিটর এবং ব্লুটুথ কলিং সুবিধা সহ।',
    image: 'https://picsum.photos/seed/watch/400/400',
    images: ['https://picsum.photos/seed/watch1/400/400', 'https://picsum.photos/seed/watch2/400/400'],
    category: 'Electronics'
  },
  {
    id: '2',
    name: 'ওয়্যারলেস ইয়ারবাড',
    price: 850,
    regularPrice: 1000,
    description: 'ক্লিয়ার সাউন্ড এবং দীর্ঘ ব্যাটারি লাইফ।',
    image: 'https://picsum.photos/seed/earbuds/400/400',
    images: ['https://picsum.photos/seed/earbuds1/400/400', 'https://picsum.photos/seed/earbuds2/400/400'],
    category: 'Electronics'
  },
  {
    id: '3',
    name: 'লেদার ওয়ালেট',
    price: 500,
    description: 'প্রিমিয়াম কোয়ালিটি লেদার ওয়ালেট।',
    image: 'https://picsum.photos/seed/wallet/400/400',
    images: ['https://picsum.photos/seed/wallet1/400/400'],
    category: 'Fashion'
  }
];

const API_URL = '';

export const store = {
  getProducts: async (): Promise<Product[]> => {
    try {
      console.log('Fetching products from API...');
      const res = await fetch(`${API_URL}/api/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      console.log('Products fetched:', data.length);
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      return INITIAL_PRODUCTS;
    }
  },
  addProduct: async (product: Product) => {
    console.log('Sending add product request...', product);
    const res = await fetch(`${API_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    });
    console.log('Add product response status:', res.status);
    if (res.ok) window.dispatchEvent(new Event('products-changed'));
    return res.ok;
  },
  deleteProduct: async (id: string) => {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: 'DELETE'
    });
    if (res.ok) window.dispatchEvent(new Event('products-changed'));
    return res.ok;
  },
  updateProduct: async (updatedProduct: Product) => {
    const res = await fetch(`${API_URL}/api/products/${updatedProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct)
    });
    if (res.ok) window.dispatchEvent(new Event('products-changed'));
    return res.ok;
  },
  
  getFavorites: (userId: string): string[] => {
    const favs = localStorage.getItem(`orbit_favs_${userId}`);
    return favs ? JSON.parse(favs) : [];
  },
  toggleFavorite: (userId: string, productId: string) => {
    const favs = store.getFavorites(userId);
    if (favs.includes(productId)) {
      localStorage.setItem(`orbit_favs_${userId}`, JSON.stringify(favs.filter(id => id !== productId)));
    } else {
      localStorage.setItem(`orbit_favs_${userId}`, JSON.stringify([...favs, productId]));
    }
    window.dispatchEvent(new Event('favorites-changed'));
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetch(`${API_URL}/api/orders`);
      if (!res.ok) throw new Error('Failed to fetch orders');
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  getUserOrders: async (userId: string): Promise<Order[]> => {
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}/orders`);
      if (!res.ok) throw new Error('Failed to fetch user orders');
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },
  addOrder: async (order: Order) => {
    const res = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (res.ok) window.dispatchEvent(new Event('orders-changed'));
    return res.ok;
  },
  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (res.ok) window.dispatchEvent(new Event('orders-changed'));
    return res.ok;
  },
  updatePaymentStatus: async (orderId: string, paymentStatus: Order['paymentStatus']) => {
    const res = await fetch(`${API_URL}/api/orders/${orderId}/payment`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentStatus })
    });
    if (res.ok) window.dispatchEvent(new Event('orders-changed'));
    return res.ok;
  },

  getCart: (): { productId: string; quantity: number }[] => {
    const cart = localStorage.getItem('orbit_cart');
    return cart ? JSON.parse(cart) : [];
  },
  addToCart: (productId: string) => {
    const cart = store.getCart();
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += 1;
      localStorage.setItem('orbit_cart', JSON.stringify(cart));
    } else {
      localStorage.setItem('orbit_cart', JSON.stringify([...cart, { productId, quantity: 1 }]));
    }
  },
  removeFromCart: (productId: string) => {
    const cart = store.getCart();
    localStorage.setItem('orbit_cart', JSON.stringify(cart.filter(item => item.productId !== productId)));
  },
  updateCartQuantity: (productId: string, quantity: number) => {
    const cart = store.getCart();
    if (quantity <= 0) {
      store.removeFromCart(productId);
      return;
    }
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
      existing.quantity = quantity;
      localStorage.setItem('orbit_cart', JSON.stringify(cart));
    }
  },
  clearCart: () => {
    localStorage.removeItem('orbit_cart');
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem('orbit_current_user');
    return user ? JSON.parse(user) : null;
  },
  setCurrentUser: (user: User | null) => {
    if (user) {
      localStorage.setItem('orbit_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('orbit_current_user');
    }
  },

  getAdminCredentials: () => {
    const creds = localStorage.getItem('orbit_admin_creds');
    return creds ? JSON.parse(creds) : { name: 'নাঈমুর রহমান', password: '234000' };
  },
  setAdminCredentials: (name: string, password: string) => {
    localStorage.setItem('orbit_admin_creds', JSON.stringify({ name, password }));
  },

  getCustomerInfo: () => {
    const info = localStorage.getItem('orbit_customer_info');
    return info ? JSON.parse(info) : { name: '', phone: '', email: '', address: '' };
  },
  setCustomerInfo: (info: { name: string; phone: string; email: string; address: string }) => {
    localStorage.setItem('orbit_customer_info', JSON.stringify(info));
  },

  // Admin Stats & Notifications
  getAdminStats: async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`);
      return res.ok ? await res.json() : { visitors: 0, logins: 0, users: 0, products: 0, orders: 0, revenue: 0 };
    } catch {
      return { visitors: 0, logins: 0, users: 0, products: 0, orders: 0, revenue: 0 };
    }
  },
  
  incrementVisitorCount: async () => {
    try {
      await fetch(`${API_URL}/api/stats/visitor`, { method: 'POST' });
    } catch {}
  },
  
  getNotifications: async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/notifications`);
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    }
  },
  
  markNotificationsRead: async () => {
    try {
      await fetch(`${API_URL}/api/admin/notifications/read`, { method: 'POST' });
    } catch {}
  },

  getPromoImage: async (): Promise<string | null> => {
    try {
      const res = await fetch(`${API_URL}/api/promo`);
      if (res.ok) {
        const data = await res.json();
        return data.imageUrl || null;
      }
      return null;
    } catch {
      return null;
    }
  },

  getNotices: async (): Promise<Notice[]> => {
    try {
      const res = await fetch(`${API_URL}/api/notices`);
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    }
  },

  getAdminNotices: async (): Promise<Notice[]> => {
    try {
      const res = await fetch(`${API_URL}/api/admin/notices`);
      return res.ok ? await res.json() : [];
    } catch {
      return [];
    }
  },

  addNotice: async (notice: Partial<Notice>) => {
    const res = await fetch(`${API_URL}/api/admin/notices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notice)
    });
    return res.ok;
  },

  deleteNotice: async (id: number) => {
    const res = await fetch(`${API_URL}/api/admin/notices/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  }
};
