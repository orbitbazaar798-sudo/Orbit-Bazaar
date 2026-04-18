import { Link, Outlet, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User as UserIcon, LogOut, Menu, X, Search, Facebook, ShoppingBag, Settings, Moon, Sun, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { store, User } from '../lib/store';
import WelcomePopup from './WelcomePopup';
import Logo from './Logo';

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => localStorage.getItem('theme') as 'light'|'dark' || 'light');
  const [lang, setLang] = useState<'BN' | 'EN'>(() => localStorage.getItem('lang') as 'BN'|'EN' || 'BN');
  const [user, setUser] = useState<User | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const labels = {
    Home: lang === 'BN' ? 'হোম' : 'Home',
    Products: lang === 'BN' ? 'প্রোডাক্টস' : 'Products',
    AboutUs: lang === 'BN' ? 'আমাদের সম্পর্কে' : 'About Us',
    ContactUs: lang === 'BN' ? 'যোগাযোগ' : 'Contact Us',
    Settings: lang === 'BN' ? 'সেটিংস' : 'Settings',
    Admin: lang === 'BN' ? 'অ্যাডমিন' : 'Admin',
    Favorites: lang === 'BN' ? 'ফেভারিট' : 'Favorites',
    Cart: lang === 'BN' ? 'কার্ট' : 'Cart',
    Profile: lang === 'BN' ? 'প্রোফাইল' : 'Profile',
    Logout: lang === 'BN' ? 'লগআউট' : 'Logout',
    Login: lang === 'BN' ? 'লগইন' : 'Login',
    SearchPlaceholder: lang === 'BN' ? 'পণ্য খুঁজুন...' : 'Search for products...'
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    setUser(store.getCurrentUser());
    
    const handleStorageChange = () => {
      setUser(store.getCurrentUser());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('user-changed', handleStorageChange);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Increment visitor count
    store.incrementVisitorCount();
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-changed', handleStorageChange);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleLogout = () => {
    store.setCurrentUser(null);
    window.dispatchEvent(new Event('user-changed'));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-300">
      <WelcomePopup />
      <header className={`bg-black shadow-md border-b border-gray-800 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'py-1' : 'py-3'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center gap-4">
            {/* Left: Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/" className="flex items-center">
                <Logo className={`transition-all duration-300 ${isScrolled ? 'h-10' : 'h-14'}`} />
              </Link>
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-10">
              <Link to="/" className="text-gray-300 hover:text-yellow-500 font-bold text-lg transition-all hover:scale-105">{labels.Home}</Link>
              <Link to="/products" className="text-gray-300 hover:text-yellow-500 font-bold text-lg transition-all hover:scale-105">{labels.Products}</Link>
              <Link to="/about" className="text-gray-300 hover:text-yellow-500 font-bold text-lg transition-all hover:scale-105">{labels.AboutUs}</Link>
              <Link to="/contact" className="text-gray-300 hover:text-yellow-500 font-bold text-lg transition-all hover:scale-105">{labels.ContactUs}</Link>
            </nav>

            {/* Right: Search & Icons */}
            <div className="hidden lg:flex items-center gap-6 flex-shrink-0">
              {/* Search Bar (Desktop) */}
              <div className="hidden xl:block w-72">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder={labels.SearchPlaceholder} 
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent placeholder-gray-400 text-sm shadow-inner"
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                </div>
              </div>
              
              <div className="flex items-center space-x-5">
                <div className="relative">
                  <button 
                    onClick={() => setIsSettingsOpen(!isSettingsOpen)} 
                    className="text-gray-300 hover:text-yellow-500 flex flex-col items-center gap-1 transition-colors group"
                  >
                    <Settings className="w-6 h-6" />
                    <span className="text-[10px] font-bold">{labels.Settings}</span>
                  </button>
                  {isSettingsOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 text-sm font-bold flex items-center gap-2">
                        <Globe className="w-4 h-4" /> 
                        ভাষা / Language
                      </div>
                      <div className="flex px-4 py-2 gap-2 border-b border-gray-100 dark:border-gray-700">
                        <button onClick={() => { setLang('BN'); setIsSettingsOpen(false); }} className={`flex-1 py-1 rounded-md text-xs font-bold ${lang === 'BN' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>বাংলা</button>
                        <button onClick={() => { setLang('EN'); setIsSettingsOpen(false); }} className={`flex-1 py-1 rounded-md text-xs font-bold ${lang === 'EN' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>English</button>
                      </div>
                      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700 text-sm font-bold flex items-center gap-2">
                        {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                        থিম / Theme
                      </div>
                      <div className="flex px-4 py-2 gap-2">
                        <button onClick={() => { setTheme('light'); setIsSettingsOpen(false); }} className={`flex-1 py-1 rounded-md text-xs font-bold ${theme === 'light' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Light</button>
                        <button onClick={() => { setTheme('dark'); setIsSettingsOpen(false); }} className={`flex-1 py-1 rounded-md text-xs font-bold ${theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>Dark</button>
                      </div>
                    </div>
                  )}
                </div>

                {user?.role === 'admin' && (
                  <Link to="/admin" className="relative text-gray-300 hover:text-yellow-500 transition-colors group">
                    <div className="flex flex-col items-center gap-1">
                      <div className="relative">
                        <ShoppingBag className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-pulse">!</span>
                      </div>
                      <span className="text-[10px] font-bold">{labels.Admin}</span>
                    </div>
                  </Link>
                )}

                <Link to="/dashboard?tab=favorites" className="text-gray-300 hover:text-red-500 flex flex-col items-center gap-1 transition-colors group">
                  <Heart className="w-6 h-6 group-hover:fill-red-500" />
                  <span className="text-[10px] font-bold">{labels.Favorites}</span>
                </Link>
                
                <Link to="/cart" className="text-gray-300 hover:text-yellow-500 flex flex-col items-center gap-1 transition-colors group">
                  <ShoppingCart className="w-6 h-6" />
                  <span className="text-[10px] font-bold">{labels.Cart}</span>
                </Link>

                {user ? (
                  <div className="flex items-center space-x-5">
                    <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-300 hover:text-yellow-500 flex flex-col items-center gap-1 transition-colors group">
                      <UserIcon className="w-6 h-6" />
                      <span className="text-[10px] font-bold">{labels.Profile}</span>
                    </Link>
                    <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 flex flex-col items-center gap-1 transition-colors group">
                      <LogOut className="w-6 h-6" />
                      <span className="text-[10px] font-bold">{labels.Logout}</span>
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="text-gray-300 hover:text-yellow-500 flex flex-col items-center gap-1 transition-colors group">
                    <UserIcon className="w-6 h-6" />
                    <span className="text-[10px] font-bold">{labels.Login}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center gap-4">
              <Link to="/cart" className="text-gray-300 hover:text-yellow-500 transition-colors">
                <ShoppingCart className="w-6 h-6" />
              </Link>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-300 hover:text-yellow-500 transition-colors">
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="lg:hidden bg-gray-900 border-t border-gray-800">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <div className="flex justify-center py-4 border-b border-gray-800 mb-2">
                <Logo className="h-10" showText={false} />
              </div>
              
              {/* Settings Dropdown on Mobile */}
              <div className="px-3 py-2 border-b border-gray-800 mb-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 font-bold text-sm">Theme / থিম</span>
                  <div className="flex gap-2">
                    <button onClick={() => setTheme('light')} className={`px-2 py-1 rounded text-xs font-bold ${theme === 'light' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300'}`}>Light</button>
                    <button onClick={() => setTheme('dark')} className={`px-2 py-1 rounded text-xs font-bold ${theme === 'dark' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300'}`}>Dark</button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-bold text-sm">Language / ভাষা</span>
                  <div className="flex gap-2">
                    <button onClick={() => setLang('BN')} className={`px-2 py-1 rounded text-xs font-bold ${lang === 'BN' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300'}`}>বাংলা</button>
                    <button onClick={() => setLang('EN')} className={`px-2 py-1 rounded text-xs font-bold ${lang === 'EN' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-300'}`}>English</button>
                  </div>
                </div>
              </div>

              <Link to="/" className="block px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>{labels.Home}</Link>
              <Link to="/products" className="block px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>{labels.Products}</Link>
              <Link to="/about" className="block px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>{labels.AboutUs}</Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>{labels.ContactUs}</Link>
              <Link to="/dashboard?tab=favorites" className="block px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-red-500 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>{labels.Favorites}</Link>
              
              {user ? (
                <>
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="block px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>{user.role === 'admin' ? labels.Admin : labels.Profile}</Link>
                  <Link to="/cart" className="block px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>{labels.Cart}</Link>
                  <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-red-500 hover:bg-gray-800 rounded-md transition-colors">{labels.Logout}</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-yellow-500 rounded-md transition-colors" onClick={() => setIsMenuOpen(false)}>{labels.Login}</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-6">
              <Logo className="h-16 items-start" />
            </div>
            <p className="text-gray-400 text-sm">
              আপনার অনলাইন কেনাকাটার সেরা গন্তব্য। আমরা দিচ্ছি ১০০% নিরাপদ ও ঝামেলামুক্ত কেনাকাটার নিশ্চয়তা।
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/products" className="hover:text-white">Products</Link></li>
              <li><Link to="/about" className="hover:text-white">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><span className="text-gray-500">Terms & Conditions</span></li>
              <li><span className="text-gray-500">Return Policy</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Phone: 01675674183</li>
              <li>Email: orbitbazaar798@gmail.com</li>
              <li>Address: জয়দেবপুর,গাজীপুর সিটি,গাজীপুর ঢাকা বাংলাদেশ।</li>
            </ul>
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4">আমাদের সাথে থাকুন</h4>
              <div className="flex gap-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=61587215409432" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-[#1877F2] text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-sm"
                  title="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
           <div className="mb-2">
            Website: <a href="https://ais-pre-5zlzj5xsuxh5giav4j5bbv-520908111864.asia-southeast1.run.app" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Orbit Bazaar (অর্বিট বাজার)</a>
          </div>
          &copy; {new Date().getFullYear()} Orbit Bazaar. All rights reserved.
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/8801675674183"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:scale-110 hover:shadow-xl transition-all z-50 flex items-center justify-center"
        aria-label="Chat on WhatsApp"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
