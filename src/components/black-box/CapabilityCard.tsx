import type { CapabilityItem } from './capabilities';

interface CapabilityCardProps {
  item: CapabilityItem;
  isActive: boolean;
  isDimmed: boolean;
  onHover: (index: number | null) => void;
}

function CapabilityIcon({ icon, accent }: { icon: CapabilityItem['icon']; accent: string }) {
  switch (icon) {
    case 'isac':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" strokeOpacity="0.28" />
          <circle cx="12" cy="12" r="5" strokeOpacity="0.55" />
          <path d="M12 12l5.5-5.5" />
          <circle cx="12" cy="12" r="1.8" fill={accent} stroke="none" />
        </svg>
      );
    case 'security':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l7 3v5.5c0 4.6-3 8.1-7 9.5-4-1.4-7-4.9-7-9.5V6l7-3Z" />
          <path d="M8.5 12h1.6l1.2-2.6 1.6 5.2 1.2-2.6h1.4" />
        </svg>
      );
    case 'edge-ai':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2.5" />
          <circle cx="12" cy="12" r="2.2" fill={accent} fillOpacity="0.25" />
          <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
        </svg>
      );
    case 'beamforming':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="5" cy="12" r="2" fill={accent} stroke="none" />
          <path d="M8 12h11M16 9l3 3-3 3" />
          <path d="M8 9.5l8.5-4M8 14.5l8.5 4" strokeOpacity="0.55" />
        </svg>
      );
    case 'power':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13 3L6.5 13h5l-1 8L17.5 11h-5l.5-8Z" fill={accent} fillOpacity="0.14" />
        </svg>
      );
    case '6g':
      return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
          <rect x="2.5" y="4.5" width="19" height="15" rx="4" stroke={accent} strokeWidth="1.7" fill={accent} fillOpacity="0.08" />
          <text x="12" y="15.2" textAnchor="middle" fill={accent} fontSize="9.5" fontWeight="800" fontFamily="Inter, -apple-system, sans-serif">
            6G
          </text>
        </svg>
      );
  }
}

export function CapabilityCard({ item, isActive, isDimmed, onHover }: CapabilityCardProps) {
  return (
    <div
      className={`bb-cap-card ${isActive ? 'is-active' : ''} ${isDimmed ? 'is-dimmed' : ''}`}
      style={{ '--cap-accent': item.accent } as React.CSSProperties}
      onMouseEnter={() => onHover(item.index)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(item.index)}
      onBlur={() => onHover(null)}
      tabIndex={0}
      role="group"
      aria-label={`${item.title}: ${item.microLine}`}
    >
      <div className="bb-cap-icon">
        <CapabilityIcon icon={item.icon} accent={item.accent} />
      </div>
      <div className="bb-cap-copy">
        <h3 className="bb-cap-title">{item.title}</h3>
        <p className="bb-cap-micro">{item.microLine}</p>
      </div>
    </div>
  );
}
