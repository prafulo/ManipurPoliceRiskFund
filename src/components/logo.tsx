import React from 'react';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 90 100"
      className={className}
    >
      <defs>
        <path
          id="shield-path"
          d="M45 2 C20 5, 10 30, 10 50 C10 80, 45 98, 45 98 C45 98, 90 80, 90 50 C90 30, 80 5, 45 2 Z"
        />
        <clipPath id="shield-clip">
          <use href="#shield-path" />
        </clipPath>
      </defs>
      
      {/* Background Colors */}
      <g clipPath="url(#shield-clip)">
        <rect width="90" height="50" y="0" fill="#d92414" />
        <rect width="90" height="50" y="50" fill="#0033a1" />
      </g>
      
      {/* Shield Border */}
      <use href="#shield-path" fill="none" stroke="#dcb349" strokeWidth="3" />
      
      {/* Central Artwork */}
      <g>
        {/* Kanglasha (Simplified) */}
        <g 
            transform="scale(1.6) translate(-21.8, -19.8)"
            stroke="#dcb349" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            fill="none"
        >
          {/* Head & Antlers */}
          <path d="M50 38 C48 35, 42 35, 40 38" />
          <path d="M41 38 C40 33, 37 32, 37 32 M37 32 L35 30 M37 32 L35 34" />
          <path d="M49 38 C50 33, 53 32, 53 32 M53 32 L55 30 M53 32 L55 34" />
          
          {/* Necklace */}
          <circle cx="41" cy="42" r="1" strokeWidth="1"/>
          <circle cx="45" cy="43" r="1" strokeWidth="1"/>
          <circle cx="49" cy="42" r="1" strokeWidth="1"/>
          <circle cx="43" cy="42.8" r="1" strokeWidth="1"/>
          <circle cx="47" cy="42.8" r="1" strokeWidth="1"/>

          {/* Body */}
          <path d="M38 45 C40 55, 60 55, 62 45" />
          <path d="M62 45 V 65 L 68 70" />
          <path d="M38 45 V 65 L 32 70" />
          <path d="M45 55 V 72" />
          <path d="M55 55 V 72" />
          <path d="M65 55 Q 70 60 68 65" />
        </g>
      </g>
    </svg>
  );
}
