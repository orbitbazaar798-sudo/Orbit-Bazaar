import React from 'react';

export default function Logo({ className = "h-12", showText = true, horizontal = true, dark = true }: { className?: string, showText?: boolean, horizontal?: boolean, dark?: boolean }) {
  return (
    <div className={`flex items-center ${horizontal ? 'flex-row gap-3' : 'flex-col gap-2'} ${className}`}>
      <svg viewBox="0 0 400 300" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg">
        {/* Swirls / Vortex */}
        <g fill="#00A3E1" opacity="0.8">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <path 
              key={angle}
              d="M 200 35 C 245 35 285 65 290 110 C 270 70 235 50 200 55 Z" 
              transform={`rotate(${angle} 200 125)`} 
            />
          ))}
        </g>

        {/* Outer Ring */}
        <circle cx="200" cy="125" r="68" fill="none" stroke="#00A3E1" strokeWidth="4"/>
        
        {/* Inner Circle */}
        <circle cx="200" cy="125" r="60" fill="#00A3E1"/>
        
        {/* Box inside Cart */}
        <g stroke="#FFFFFF" fill="none" strokeWidth="3" strokeLinejoin="round">
          <polygon points="205,75 225,85 205,95 185,85" />
          <polygon points="185,85 205,95 205,115 185,105" />
          <polygon points="205,95 225,85 225,105 205,115" />
          <line x1="205" y1="75" x2="205" y2="95" />
        </g>

        {/* Shopping Cart */}
        <g stroke="#FFFFFF" fill="none" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 145 90 L 160 90 L 175 140 L 235 140 L 250 90 L 160 90" />
          <circle cx="185" cy="155" r="5" fill="#FFFFFF" stroke="none"/>
          <circle cx="225" cy="155" r="5" fill="#FFFFFF" stroke="none"/>
        </g>
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <div className="text-xl font-black tracking-tighter leading-none">
            <span className={dark ? 'text-white' : 'text-gray-900'}>Orbit</span>
            <span className="text-blue-500">Bazaar</span>
          </div>
          <span className={`text-[10px] font-medium uppercase tracking-widest ${dark ? 'text-gray-400' : 'text-gray-500'}`}>Trusted Online Bazaar</span>
        </div>
      )}
    </div>
  );
}
