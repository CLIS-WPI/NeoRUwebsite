import type { SVGProps } from 'react';

export function OaiLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 164 62" fill="none" aria-label="OpenAirInterface 5G" role="img" {...props}>
      {/* Subtle RF arc behind AIR */}
      <path d="M88 22 A24 24 0 0 1 128 22" stroke="#7DD3FC" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M94 26 A17 17 0 0 1 122 26" stroke="#38BDF8" strokeWidth="1.4" strokeLinecap="round" />
      <text x="134" y="25" fill="#0284C7" fontSize="12" fontWeight="800" fontFamily="Inter, -apple-system, sans-serif">
        5G
      </text>
      <text x="10" y="42" fill="#64748B" fontSize="18" fontWeight="750" fontFamily="Inter, -apple-system, sans-serif" letterSpacing="-0.03em">
        OPEN
      </text>
      <text x="72" y="42" fill="#0284C7" fontSize="18" fontWeight="800" fontFamily="Inter, -apple-system, sans-serif" letterSpacing="-0.02em">
        AIR
      </text>
      {/* Signal bars + INTERFACE */}
      <rect x="44" y="47" width="18" height="2" rx="1" fill="#F59E0B" />
      <rect x="48" y="51" width="14" height="2" rx="1" fill="#10B981" />
      <rect x="52" y="55" width="10" height="2" rx="1" fill="#0284C7" />
      <text x="68" y="56" fill="#0EA5E9" fontSize="10.5" fontWeight="700" fontFamily="Inter, -apple-system, sans-serif" letterSpacing="0.06em">
        INTERFACE
      </text>
    </svg>
  );
}
