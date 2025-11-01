import React from 'react';

export const UsersIcon = ({ className }: { className?: string }) => (
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
      d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m-7.5-2.226A3 3 0 0 1 18 15.75M16.5 7.5a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.375a.375.375 0 0 1 .375.375v.375a.375.375 0 0 1-.375.375h-.375a.375.375 0 0 1-.375-.375v-.375a.375.375 0 0 1 .375-.375ZM12 15.75a3 3 0 0 1-6 0M12 15.75a3 3 0 0 0-6 0m6 0a3 3 0 0 0 6 0M9.75 9.75h.375a.375.375 0 0 1 .375.375v.375a.375.375 0 0 1-.375.375h-.375a.375.375 0 0 1-.375-.375v-.375a.375.375 0 0 1 .375-.375ZM3.375 19.125a9.094 9.094 0 0 1 9.271-8.631c.381.043.74.12.998.224a9.097 9.097 0 0 1 3.272 8.406"
    />
  </svg>
);
