import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../lib/store';
import Logo from '../components/Logo';

export default function Login() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || `সার্ভার ত্রুটি (Status: ${response.status})। আবার চেষ্টা করুন।`);
        return;
      }

      const data = await response.json().catch(() => ({ success: false, message: 'সার্ভার থেকে সঠিক তথ্য পাওয়া যায়নি।' }));
      console.log('Login response:', data);

      if (data.success) {
        store.setCurrentUser(data.user);
        window.dispatchEvent(new Event('user-changed'));
        navigate('/dashboard');
      } else {
        alert(data.message || 'লগইন ব্যর্থ হয়েছে।');
      }
    } catch (error: any) {
      console.error('Login fetch error:', error);
      alert('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-700">
        <div className="flex flex-col items-center">
          <Logo className="h-16 mb-4" showText={false} />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            লগইন করুন
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            অথবা{' '}
            <Link to="/register" className="font-medium text-[#00A3E1] hover:text-[#0082b3]">
              নতুন একাউন্ট তৈরি করুন
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="login-id" className="sr-only">মোবাইল নম্বর অথবা ইমেইল</label>
              <input
                id="login-id"
                name="loginId"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#00A3E1] focus:border-transparent"
                placeholder="মোবাইল নম্বর অথবা ইমেইল লিখুন"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">পাসওয়ার্ড</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#00A3E1] focus:border-transparent"
                placeholder="পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#00A3E1] focus:ring-[#00A3E1] border-gray-600 rounded bg-gray-700"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <button type="button" onClick={() => alert('আপনার ইমেইলে একটি পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে।')} className="font-medium text-[#00A3E1] hover:text-[#0082b3]">
                পাসওয়ার্ড ভুলে গেছেন?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-[#00A3E1] hover:bg-[#0082b3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3E1] transition-colors shadow-lg shadow-[#00A3E1]/30"
            >
              লগইন
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <Link to="/admin-login" className="text-sm text-gray-500 hover:text-[#00A3E1]">
            অ্যাডমিন লগইন
          </Link>
        </div>
      </div>
    </div>
  );
}
