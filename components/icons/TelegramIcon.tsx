import React from 'react';

export const TelegramIcon = ({ className }: { className?: string }) => (
    <svg 
        viewBox="0 0 48 48" 
        xmlns="http://www.w3.org/2000/svg"
        className={className || "w-6 h-6"}
    >
        <path 
            fill="#29B6F6" 
            d="M24,4C13,4,4,13,4,24s9,20,20,20s20-9,20-20S35,4,24,4z"
        />
        <path 
            fill="#FFF" 
            d="M34,17l-14,9l-10-4l22-11Z"
        />
        <path 
            fill="#B0BEC5" 
            d="M20,26l3,3l4-9-14,9Z"
        />
        <path 
            fill="#CFD8DC" 
            d="M23,29v5l2-2Z"
        />
    </svg>
);