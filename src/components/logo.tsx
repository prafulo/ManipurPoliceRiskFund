import React from 'react';
import Image from 'next/image';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`relative ${className || 'w-10 h-10'}`}>
      <Image
        src="/logo.png"
        alt="Manipur Police Risk Fund Logo"
        fill
        priority
        className="object-contain"
      />
    </div>
  );
}
