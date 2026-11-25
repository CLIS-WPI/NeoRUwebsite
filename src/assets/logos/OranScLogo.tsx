import type { SVGProps } from 'react';

export function OranScLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 156 62" fill="none" aria-label="O-RAN Software Community" role="img" {...props}>
      <defs>
        <linearGradient id="oranRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EF4444" />
          <stop offset="35%" stopColor="#F59E0B" />
          <stop offset="70%" stopColor="#22C55E" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="29" r="13.5" stroke="url(#oranRingGrad)" strokeWidth="5.2" />
      <text x="44" y="37" fill="#0369A1" fontSize="26" fontWeight="800" fontFamily="Inter, -apple-system, sans-serif" letterSpacing="-0.03em">
        -RAN
      </text>
      <text x="78" y="53" textAnchor="middle" fill="#0284C7" fontSize="8.8" fontWeight="700" fontFamily="Inter, -apple-system, sans-serif" letterSpacing="0.06em">
        SOFTWARE COMMUNITY
      </text>
    </svg>
  );
}
