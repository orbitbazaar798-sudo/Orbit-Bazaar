import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { store } from '../lib/store';
import Logo from '../components/Logo';
import { Check, X } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Password validation checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[@#$%^&+=!]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isPasswordValid) {
      alert('দয়া করে সঠিক ফরম্যাটে পাসওয়ার্ড দিন।');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, loginId, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || `সার্ভার ত্রুটি (Status: ${response.status})। আবার চেষ্টা করুন।`);
        return;
      }

      const data = await response.json().catch(() => ({ success: false, message: 'সার্ভার থেকে সঠিক তথ্য পাওয়া যায়নি।' }));
      console.log('Register response:', data);

      if (data.success) {
        store.setCurrentUser(data.user);
        window.dispatchEvent(new Event('user-changed'));
        
        // Admin notification
        alert(`🔔 অ্যাডমিন নোটিফিকেশন: নতুন কাস্টমার '${name}' রেজিস্ট্রেশন করেছেন।`);
        // Customer welcome message
        alert(`অভিনন্দন! অর্বিট বাজারে আপনার একাউন্টটি সফলভাবে তৈরি হয়েছে।`);
        
        navigate('/dashboard');
      } else {
        alert(data.message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে।');
      }
    } catch (error: any) {
      console.error('Register fetch error:', error);
      alert('সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না। আবার চেষ্টা করুন।');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-2xl shadow-xl border border-gray-700">
        <div className="flex flex-col items-center">
          <Logo className="h-16 mb-4" showText={false} />
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white">
            নতুন একাউন্ট তৈরি করুন
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            অথবা{' '}
            <Link to="/login" className="font-medium text-[#00A3E1] hover:text-[#0082b3]">
              লগইন করুন
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">পুরো নাম</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#00A3E1] focus:border-transparent"
                placeholder="পুরো নাম"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
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
                autoComplete="new-password"
                required
                className="appearance-none rounded-lg relative block w-full px-4 py-3 bg-gray-700 border border-gray-600 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-[#00A3E1] focus:border-transparent"
                placeholder="পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {/* Password Policy Indicators */}
            <div className="bg-gray-700/50 p-4 rounded-lg space-y-2 text-sm">
              <p className="text-gray-300 font-medium mb-2">পাসওয়ার্ডের শর্তাবলী:</p>
              <div className="flex items-center gap-2">
                {hasMinLength ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-500" />}
                <span className={hasMinLength ? "text-green-400" : "text-gray-400"}>ন্যূনতম ৮টি অক্ষর</span>
              </div>
              <div className="flex items-center gap-2">
                {hasUpper ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-500" />}
                <span className={hasUpper ? "text-green-400" : "text-gray-400"}>একটি বড় হাতের অক্ষর (A-Z)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasLower ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-500" />}
                <span className={hasLower ? "text-green-400" : "text-gray-400"}>একটি ছোট হাতের অক্ষর (a-z)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasNumber ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-500" />}
                <span className={hasNumber ? "text-green-400" : "text-gray-400"}>একটি সংখ্যা (0-9)</span>
              </div>
              <div className="flex items-center gap-2">
                {hasSpecial ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-gray-500" />}
                <span className={hasSpecial ? "text-green-400" : "text-gray-400"}>একটি বিশেষ চিহ্ন (@, #, $, !)</span>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={!isPasswordValid}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-colors shadow-lg ${
                isPasswordValid 
                  ? 'bg-[#00A3E1] hover:bg-[#0082b3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00A3E1] shadow-[#00A3E1]/30' 
                  : 'bg-gray-600 cursor-not-allowed opacity-70'
              }`}
            >
              রেজিস্টার
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
