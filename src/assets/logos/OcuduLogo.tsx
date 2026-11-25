import type { SVGProps } from 'react';

export function OcuduLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 108 74" fill="none" aria-label="OCUDU" role="img" {...props}>
      <defs>
        <linearGradient id="ocuduGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="55%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
      </defs>
      {/* Hexagonal mesh constellation */}
      <g transform="translate(54, 25)" stroke="url(#ocuduGrad)" strokeWidth="1.7">
        <polygon points="0,-16 14,-8 14,8 0,16 -14,8 -14,-8" fill="none" />
        <line x1="0" y1="-16" x2="0" y2="16" />
        <line x1="-14" y1="-8" x2="14" y2="8" />
        <line x1="14" y1="-8" x2="-14" y2="8" />
        <circle cx="0" cy="-16" r="2.8" fill="#7C3AED" stroke="none" />
        <circle cx="14" cy="-8" r="2.8" fill="#4F46E5" stroke="none" />
        <circle cx="14" cy="8" r="2.8" fill="#0EA5E9" stroke="none" />
        <circle cx="0" cy="16" r="2.8" fill="#06B6D4" stroke="none" />
        <circle cx="-14" cy="8" r="2.8" fill="#6366F1" stroke="none" />
        <circle cx="-14" cy="-8" r="2.8" fill="#8B5CF6" stroke="none" />
        <circle cx="0" cy="0" r="3.4" fill="url(#ocuduGrad)" stroke="none" />
      </g>
      <text x="54" y="61" textAnchor="middle" fill="url(#ocuduGrad)" fontSize="15.5" fontWeight="800" fontFamily="Inter, -apple-system, sans-serif" letterSpacing="0.04em">
        OCUDU
      </text>
    </svg>
  );
}
