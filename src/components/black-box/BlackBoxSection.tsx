import React, { useEffect, useRef, useState } from 'react';
import './black-box.css';

export interface CapabilityItem {
  id: string;
  side: 'left' | 'right';
  slot: 0 | 1 | 2;
  title: string;
  desc: string;
  accent: string;
  path: string;
  icon: React.ReactNode;
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'isac',
    side: 'left',
    slot: 0,
    title: 'ISAC & RF Sensing',
    desc: 'Turn radios into real-time radar.',
    accent: '#0284c7',
    path: 'M 474 295 L 418 295 Q 406 295 398 286 L 316 128 Q 308 118 295 118 L 245 118',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 12m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
        <path d="M7.76 16.24a6 6 0 0 1 0 -8.49" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M4.93 19.07a10 10 0 0 1 0 -14.14" />
      </svg>
    ),
  },
  {
    id: 'phy-sec',
    side: 'left',
    slot: 1,
    title: 'Raw I/Q & PHY Security',
    desc: 'Instant jamming & spoof detection.',
    accent: '#0891b2',
    path: 'M 468 308 L 368 308 Q 356 308 348 299 L 315 264 Q 307 255 295 255 L 245 255',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3z" />
        <path d="M8.5 12h1.5l1.2-2.5 1.8 5 1.2-2.5h1.3" />
      </svg>
    ),
  },
  {
    id: 'edge-ai',
    side: 'left',
    slot: 2,
    title: 'Sub-ms Edge AI (dApps)',
    desc: 'Run neural DSP directly on-chip.',
    accent: '#6366f1',
    path: 'M 474 322 L 395 322 Q 383 322 375 331 L 325 383 Q 317 392 305 392 L 245 392',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="6" y="6" width="12" height="12" rx="2" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="0.8" />
        <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
      </svg>
    ),
  },
  {
    id: 'beamforming',
    side: 'right',
    slot: 0,
    title: 'Agile Beamforming',
    desc: 'Custom precoding & null-steering.',
    accent: '#2563eb',
    path: 'M 526 295 L 582 295 Q 594 295 602 286 L 684 128 Q 692 118 705 118 L 755 118',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 18L19 5" />
        <path d="M4 18L20 12" />
        <path d="M4 18L16 19" />
        <circle cx="4" cy="18" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'energy',
    side: 'right',
    slot: 1,
    title: 'Micro-Sleep & PA Control',
    desc: 'Symbol-level energy optimization.',
    accent: '#10b981',
    path: 'M 532 308 L 632 308 Q 644 308 652 299 L 685 264 Q 693 255 705 255 L 755 255',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
      </svg>
    ),
  },
  {
    id: 'waveforms',
    side: 'right',
    slot: 2,
    title: '6G Waveforms & FR3',
    desc: 'Custom waveforms & flexible splits.',
    accent: '#0ea5e9',
    path: 'M 526 322 L 605 322 Q 617 322 625 331 L 675 383 Q 683 392 695 392 L 755 392',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0 2 3 2 3" />
      </svg>
    ),
  },
];

export interface BlackBoxSectionProps {
  closedImageSrc: string;
  openImageSrc: string;
}

export const BlackBoxSection: React.FC<BlackBoxSectionProps> = ({
  closedImageSrc,
  openImageSrc,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  // Auto-open smoothly shortly after entering viewport (respecting reduced motion)
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReduced);
    if (prefersReduced) {
      setIsOpen(true);
      setHasAutoPlayed(true);
      return;
    }

    const el = sectionRef.current;
    if (!el || hasAutoPlayed) return;

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          timer = window.setTimeout(() => {
            setIsOpen(true);
            setHasAutoPlayed(true);
          }, 850);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [hasAutoPlayed]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: nx * 6, y: ny * -5 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const leftCards = CAPABILITIES.filter((c) => c.side === 'left');
  const rightCards = CAPABILITIES.filter((c) => c.side === 'right');

  return (
    <section
      ref={sectionRef}
      id="break-the-black-box"
      className="bb-section"
      aria-labelledby="bb-section-title"
    >
      {/* Subtle architectural dot grid background */}
      <div aria-hidden="true" className="bb-dot-grid" />

      <div className="container bb-inner">
        {/* Section Header */}
        <header className="bb-header">
          <span className="bb-eyebrow-pill">
            <span className="bb-eyebrow-dot" aria-hidden="true" />
            Break the Black Box
          </span>
          <h2 id="bb-section-title" className="bb-title">
            Unlocking the Programmable Radio Edge
          </h2>
          <p className="bb-subtitle">
            Open the O-RU enclosure to unleash capabilities locked away by proprietary hardware.
          </p>
        </header>

        {/* Apple-Style Frosted Segmented Toggle */}
        <div className="bb-controls">
          <div
            role="tablist"
            aria-label="O-RU Hardware State"
            className={`bb-segmented-toggle ${isOpen ? 'is-open' : 'is-locked'}`}
          >
            <span className="bb-toggle-thumb" aria-hidden="true" />
            <button
              type="button"
              role="tab"
              aria-selected={!isOpen}
              onClick={() => setIsOpen(false)}
              className={`bb-toggle-btn ${!isOpen ? 'is-selected' : ''}`}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3.5" y="7.5" width="9" height="6.5" rx="1.8" />
                <path d="M5.5 7.5V5.3a2.5 2.5 0 0 1 5 0v2.2" />
              </svg>
              <span>Locked Black Box</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isOpen}
              onClick={() => setIsOpen(true)}
              className={`bb-toggle-btn ${isOpen ? 'is-selected' : ''}`}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3.5" y="7.5" width="9" height="6.5" rx="1.8" />
                <path d="M5.5 7.5V5.2a2.5 2.5 0 0 1 4.7-1.2" />
              </svg>
              <span>Open NeoRU</span>
            </button>
          </div>
        </div>

        {/* STAGE: Layered 2.5D Hardware + Crisp SVG PCB Traces + 6 Cards */}
        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="bb-stage-wrapper"
        >
          {/* SVG Circuit Trace Layer (Desktop Only) */}
          <svg
            viewBox="0 0 1000 500"
            preserveAspectRatio="none"
            aria-hidden="true"
            className="bb-trace-svg"
          >
            <defs>
              <filter id="neoruGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {CAPABILITIES.map((cap, idx) => {
              const isActive = hoveredId === cap.id;
              const isDimmed = hoveredId !== null && !isActive;

              return (
                <g
                  key={cap.id}
                  style={{
                    opacity: isOpen ? (isDimmed ? 0.16 : 1) : 0,
                    transition: `opacity 500ms ease ${isOpen ? idx * 65 : 0}ms`,
                  }}
                >
                  {/* Base hairline PCB trace */}
                  <path
                    d={cap.path}
                    fill="none"
                    stroke={isActive ? cap.accent : '#cbd5e1'}
                    strokeWidth={isActive ? 2.2 : 1.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 600,
                      strokeDashoffset: isOpen ? 0 : 600,
                      transition: `stroke-dashoffset 850ms cubic-bezier(0.22, 1, 0.36, 1) ${
                        isOpen ? 180 + idx * 70 : 0
                      }ms, stroke 250ms ease, stroke-width 250ms ease`,
                    }}
                  />

                  {/* Flowing data pulse along trace */}
                  {isOpen && !reducedMotion && (
                    <path
                      d={cap.path}
                      fill="none"
                      stroke={cap.accent}
                      strokeWidth={isActive ? 2.8 : 2}
                      strokeLinecap="round"
                      strokeDasharray="10 38"
                      filter={isActive ? 'url(#neoruGlow)' : undefined}
                      className={isActive ? 'neoru-trace-pulse-fast' : 'neoru-trace-pulse'}
                      style={{ opacity: isActive ? 1 : 0.65 }}
                    />
                  )}

                  {/* Terminal solder-pad node at card edge */}
                  <circle
                    cx={cap.side === 'left' ? 245 : 755}
                    cy={cap.slot === 0 ? 118 : cap.slot === 1 ? 255 : 392}
                    r={isActive ? 4.5 : 3.2}
                    fill={isActive ? cap.accent : '#ffffff'}
                    stroke={cap.accent}
                    strokeWidth="2"
                    style={{ transition: 'all 250ms ease' }}
                  />
                </g>
              );
            })}
          </svg>

          {/* 3-Column Desktop Grid / Stacked Mobile Layout */}
          <div className="bb-stage-grid">
            {/* LEFT 3 CAPABILITIES */}
            <div className="bb-cards-col bb-cards-left">
              {leftCards.map((cap, idx) => (
                <CapabilityCard
                  key={cap.id}
                  item={cap}
                  isOpen={isOpen}
                  delayMs={260 + idx * 90}
                  isHovered={hoveredId === cap.id}
                  isDimmed={hoveredId !== null && hoveredId !== cap.id}
                  onEnter={() => setHoveredId(cap.id)}
                  onLeave={() => setHoveredId(null)}
                />
              ))}
            </div>

            {/* CENTER 2.5D HARDWARE STAGE */}
            <div className="bb-center-stage">
              <div
                className="bb-hardware-frame"
                style={{
                  transform: `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
                }}
              >
                {/* Ambient cyan aura behind FPGA when open */}
                <div
                  aria-hidden="true"
                  className={`bb-core-aura ${isOpen ? 'is-open' : ''}`}
                  style={{ opacity: isOpen ? (hoveredId ? 1 : 0.72) : 0 }}
                />

                {/* Closed Black Box Render */}
                <img
                  src={closedImageSrc}
                  alt="Proprietary Sealed O-RU Black Box"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  className="bb-hw-img"
                  style={{
                    opacity: isOpen ? 0 : 1,
                    transform: isOpen ? 'scale(0.985)' : 'scale(1)',
                  }}
                />

                {/* Open NeoRU Programmable Core Render (pixel-aligned) */}
                <img
                  src={openImageSrc}
                  alt="Open NeoRU Programmable O-RU Hardware exposing FPGA and RF PCB"
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  className="bb-hw-img"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0px) scale(1)' : 'translateY(10px) scale(0.985)',
                  }}
                />

                {/* Status Micro-Badge Below Hardware */}
                <div className="bb-status-wrap">
                  <div className={`bb-status-badge ${isOpen ? 'is-open' : 'is-locked'}`}>
                    <span className={`bb-status-dot ${isOpen ? 'is-open' : 'is-locked'}`} aria-hidden="true" />
                    <span>
                      {isOpen
                        ? 'NeoRU Core — Open & Programmable Radio Edge'
                        : 'Proprietary O-RU — Sealed & Fixed-Function'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT 3 CAPABILITIES */}
            <div className="bb-cards-col bb-cards-right">
              {rightCards.map((cap, idx) => (
                <CapabilityCard
                  key={cap.id}
                  item={cap}
                  isOpen={isOpen}
                  delayMs={320 + idx * 90}
                  isHovered={hoveredId === cap.id}
                  isDimmed={hoveredId !== null && hoveredId !== cap.id}
                  onEnter={() => setHoveredId(cap.id)}
                  onLeave={() => setHoveredId(null)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

interface CapabilityCardProps {
  item: CapabilityItem;
  isOpen: boolean;
  delayMs: number;
  isHovered: boolean;
  isDimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

const CapabilityCard: React.FC<CapabilityCardProps> = ({
  item,
  isOpen,
  delayMs,
  isHovered,
  isDimmed,
  onEnter,
  onLeave,
}) => {
  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      tabIndex={isOpen ? 0 : -1}
      style={{
        transitionDelay: isOpen ? `${delayMs}ms` : '0ms',
        borderColor: isHovered ? item.accent : undefined,
      }}
      className={`bb-cap-card bb-side-${item.side} ${isOpen ? 'is-open' : 'is-closed'} ${
        isHovered ? 'is-hovered' : ''
      } ${isDimmed ? 'is-dimmed' : ''}`}
    >
      <div
        className="bb-cap-icon"
        style={{
          backgroundColor: isHovered ? item.accent : `${item.accent}14`,
          color: isHovered ? '#ffffff' : item.accent,
        }}
      >
        {item.icon}
      </div>
      <div className="bb-cap-copy">
        <h3 className="bb-cap-title">{item.title}</h3>
        <p className="bb-cap-desc">{item.desc}</p>
      </div>
    </div>
  );
};

export default BlackBoxSection;
