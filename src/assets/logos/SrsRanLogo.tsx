import type { SVGProps } from 'react';

export function SrsRanLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 110 74" fill="none" aria-label="srsRAN Project" role="img" {...props}>
      <g transform="translate(55, 24)">
        <path d="M-15 6 A16 16 0 1 1 12 -11" stroke="#0891B2" strokeWidth="3.2" strokeLinecap="round" />
        <path d="M-9.5 4.5 A10.5 10.5 0 1 1 8.5 -6.5" stroke="#06B6D4" strokeWidth="3" strokeLinecap="round" />
        <circle cx="0" cy="0" r="3.4" fill="#0891B2" />
      </g>
      <text x="55" y="55" textAnchor="middle" fill="#0EA5E9" fontSize="15" fontWeight="700" fontFamily="Inter, -apple-system, sans-serif" letterSpacing="-0.02em">
        srsRAN
      </text>
      <text x="55" y="68" textAnchor="middle" fill="#38BDF8" fontSize="9.5" fontWeight="600" fontFamily="Inter, -apple-system, sans-serif" letterSpacing="0.08em">
        PROJECT
      </text>
    </svg>
  );
}
