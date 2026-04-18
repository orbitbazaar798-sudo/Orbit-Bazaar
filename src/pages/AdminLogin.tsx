import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../lib/store';

export default function AdminLogin() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const navigate = useNavigate();

  React.useEffect(() => {
    fetch('/api/health')
      .then(res => res.ok ? setServerStatus('online') : setServerStatus('offline'))
      .catch(() => setServerStatus('offline'));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check if running on Netlify
    if (window.location.hostname.includes('netlify.app')) {
      setError('সতর্কতা: আপনি Netlify ব্যবহার করছেন। এই অ্যাপটির ডাটাবেস Netlify-তে কাজ করবে না। দয়া করে AI Studio-র দেওয়া আসল লিঙ্কটি ব্যবহার করুন।');
      return;
    }
    
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: name, password })
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (res.status === 404) {
          setError('সার্ভার পাওয়া যায়নি (404)। আপনি কি সঠিক লিঙ্কে আছেন?');
        } else {
          setError(errorData.message || `সার্ভার ত্রুটি (Status: ${res.status})। আবার চেষ্টা করুন।`);
        }
        return;
      }
      
      const data = await res.json().catch(() => ({ success: false, message: 'সার্ভার থেকে সঠিক তথ্য পাওয়া যায়নি।' }));
      
      if (data.success && data.user.role === 'admin') {
        store.setCurrentUser(data.user);
        window.dispatchEvent(new Event('user-changed'));
        navigate('/admin');
      } else if (data.success && data.user.role !== 'admin') {
        setError('আপনার অ্যাডমিন অ্যাক্সেস নেই।');
      } else {
        setError(data.message || 'ভুল নাম বা পাসওয়ার্ড');
      }
    } catch (err) {
      setError('সার্ভার ত্রুটি। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            অ্যাডমিন লগইন
          </h2>
          <div className="mt-2 flex justify-center items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${
              serverStatus === 'online' ? 'bg-green-500' : 
              serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
            }`}></span>
            <span className="text-gray-500">
              সার্ভার স্ট্যাটাস: {
                serverStatus === 'online' ? 'অনলাইন' : 
                serverStatus === 'offline' ? 'অফলাইন (Netlify-তে কাজ করবে না)' : 'চেক করা হচ্ছে...'
              }
            </span>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">নাম</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="অ্যাডমিন নাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">পাসওয়ার্ড</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
            >
              লগইন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
