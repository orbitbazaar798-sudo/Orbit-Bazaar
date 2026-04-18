import React, { useState } from 'react';
import { Mail, Phone, MapPin, Facebook, CheckCircle2, Clock } from 'lucide-react';

export default function Contact() {
  const [replyMessage, setReplyMessage] = useState<{text: string, isOffTime: boolean} | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentHour = new Date().getHours();
    // Off-time: 10 PM (22) to 8 AM (8)
    const isOffTime = currentHour >= 22 || currentHour < 8;
    
    if (isOffTime) {
      setReplyMessage({
        text: "দুঃখিত, আমাদের অফিস এখন বন্ধ। আগামীকাল সকালে আমরা আপনাকে রিপ্লাই দেব।",
        isOffTime: true
      });
    } else {
      setReplyMessage({
        text: "আমাদের ওয়েবসাইটে আপনাকে স্বাগতম! আমরা আপনার মেসেজটি পেয়েছি। আমাদের একজন প্রতিনিধি খুব শীঘ্রই আপনার সাথে যোগাযোগ করবেন।",
        isOffTime: false
      });
    }
    
    // Reset form
    (e.target as HTMLFormElement).reset();
    
    // Hide message after 10 seconds
    setTimeout(() => setReplyMessage(null), 10000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900">যোগাযোগ করুন</h1>
        <p className="mt-4 text-gray-600">যেকোনো প্রয়োজনে আমাদের সাথে যোগাযোগ করুন</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">আমাদের ঠিকানা</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ফোন</h3>
                  <p className="text-gray-600 mt-1">01675674183</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                  <a href="https://wa.me/8801675674183" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 inline-block">
                    সরাসরি মেসেজ করুন: 01675674183
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <Facebook className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ফেসবুক</h3>
                  <a href="https://www.facebook.com/profile.php?id=61587215409432" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline mt-1 inline-block">
                    আমাদের সাথে থাকুন
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ইমেইল</h3>
                  <p className="text-gray-600 mt-1">orbitbazaar798@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">ঠিকানা</h3>
                  <p className="text-gray-600 mt-1">জয়দেবপুর,গাজীপুর সিটি,গাজীপুর ঢাকা বাংলাদেশ।</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div>
          <form className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8" onSubmit={handleSubmit}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">মেসেজ পাঠান</h2>
            
            {replyMessage && (
              <div className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${replyMessage.isOffTime ? 'bg-orange-50 text-orange-800 border border-orange-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                {replyMessage.isOffTime ? <Clock className="w-6 h-6 flex-shrink-0 mt-0.5" /> : <CheckCircle2 className="w-6 h-6 flex-shrink-0 mt-0.5" />}
                <div>
                  <h4 className="font-bold mb-1">{replyMessage.isOffTime ? 'অফিস বন্ধ' : 'মেসেজ সফলভাবে পাঠানো হয়েছে!'}</h4>
                  <p>{replyMessage.text}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">নাম</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="আপনার নাম"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">ইমেইল</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                  placeholder="আপনার ইমেইল"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">মেসেজ</label>
                <textarea 
                  id="message" 
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all resize-none"
                  placeholder="আপনার মেসেজ লিখুন..."
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                পাঠান
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
