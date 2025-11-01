import React from 'react';

export const TvIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className || "w-6 h-6"}
  >
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M6 20.25h12m-7.5-3.75v3.75m-3.75 0h15M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" 
    />
    <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.32-.467.557-.327l5.603 3.112Z" 
    />
  </svg>
);
