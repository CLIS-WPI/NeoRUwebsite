import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import './black-box.css';

export interface CapabilityItem {
  id: string;
  side: 'left' | 'right';
  slot: 0 | 1 | 2;
  title: string;
  desc: string;
  accent: string;
  icon: React.ReactNode;
}

interface ComputedTrace {
  id: string;
  d: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  length: number;
}

const CAPABILITIES: CapabilityItem[] = [
  {
    id: 'isac',
    side: 'left',
    slot: 0,
    title: 'ISAC & RF Sensing',
    desc: 'Turn radios into real-time radar.',
    accent: '#0284c7',
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
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0 2 3 2 3" />
      </svg>
    ),
  },
];

function buildChamferedTrace(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  side: 'left' | 'right',
  slot: 0 | 1 | 2,
): { d: string; length: number } {
  const dir = side === 'left' ? -1 : 1;
  const dy = endY - startY;
  const absDy = Math.abs(dy);
  const totalDx = Math.abs(endX - startX);

  if (absDy < 4 || totalDx < 32) {
    const d = `M ${startX.toFixed(1)} ${startY.toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    return { d, length: Math.hypot(endX - startX, dy) };
  }

  // Slight slot-specific horizontal exit stub so the 3 traces fan out cleanly like real PCB routing
  const stubFactor = slot === 1 ? 0.34 : 0.24;
  const stubOut = Math.max(22, Math.min(totalDx * stubFactor, totalDx - 44));
  const maxDiag = Math.max(16, totalDx - stubOut - 24);
  const diagDx = Math.min(absDy * 0.72, maxDiag);

  const x1 = startX + dir * stubOut;
  const x2 = x1 + dir * diagDx;
  const diagLen = Math.hypot(diagDx, dy);
  const r = Math.min(10, stubOut * 0.4, diagLen * 0.35, Math.abs(endX - x2) * 0.4);

  const ux = (dir * diagDx) / diagLen;
  const uy = dy / diagLen;

  const p1BeforeX = x1 - dir * r;
  const p1AfterX = x1 + ux * r;
  const p1AfterY = startY + uy * r;

  const p2BeforeX = x2 - ux * r;
  const p2BeforeY = endY - uy * r;
  const p2AfterX = x2 + dir * r;

  const d = [
    `M ${startX.toFixed(1)} ${startY.toFixed(1)}`,
    `L ${p1BeforeX.toFixed(1)} ${startY.toFixed(1)}`,
    `Q ${x1.toFixed(1)} ${startY.toFixed(1)} ${p1AfterX.toFixed(1)} ${p1AfterY.toFixed(1)}`,
    `L ${p2BeforeX.toFixed(1)} ${p2BeforeY.toFixed(1)}`,
    `Q ${x2.toFixed(1)} ${endY.toFixed(1)} ${p2AfterX.toFixed(1)} ${endY.toFixed(1)}`,
    `L ${endX.toFixed(1)} ${endY.toFixed(1)}`,
  ].join(' ');

  const length = stubOut + diagLen + Math.abs(endX - x2);
  return { d, length };
}

export interface BlackBoxSectionProps {
  closedImageSrc: string;
  openImageSrc: string;
}

export const BlackBoxSection: React.FC<BlackBoxSectionProps> = ({
  closedImageSrc,
  openImageSrc,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const hwFrameRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [isOpen, setIsOpen] = useState(false);
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [stageSize, setStageSize] = useState({ w: 0, h: 0 });
  const [traces, setTraces] = useState<ComputedTrace[]>([]);

  // Dynamically compute pixel-exact SVG PCB traces from FPGA die to each card's vertical center
  const computeTraces = useCallback(() => {
    const stageEl = stageRef.current;
    const hwEl = hwFrameRef.current;
    if (!stageEl || !hwEl) return;

    if (window.innerWidth < 1024) {
      setStageSize({ w: 0, h: 0 });
      setTraces([]);
      return;
    }

    const stageRect = stageEl.getBoundingClientRect();
    const hwRect = hwEl.getBoundingClientRect();
    if (stageRect.width < 100 || stageRect.height < 100) return;

    const hwCenterX = hwRect.left - stageRect.left + hwRect.width * 0.5;
    // Glowing cyan FPGA die sits cleanly at ~56.5% height inside oru-open.png
    const fpgaCenterY = hwRect.top - stageRect.top + hwRect.height * 0.565;
    const fpgaHalfW = Math.max(16, hwRect.width * 0.044);

    const nextTraces: ComputedTrace[] = [];

    for (const cap of CAPABILITIES) {
      const cardEl = cardRefs.current[cap.id];
      if (!cardEl) continue;

      const cardRect = cardEl.getBoundingClientRect();
      const pinOffsetY = cap.slot === 0 ? -9 : cap.slot === 2 ? 9 : 0;
      const startX = cap.side === 'left' ? hwCenterX - fpgaHalfW : hwCenterX + fpgaHalfW;
      const startY = fpgaCenterY + pinOffsetY;

      const endX =
        cap.side === 'left'
          ? cardRect.right - stageRect.left
          : cardRect.left - stageRect.left;
      const endY = cardRect.top + cardRect.height / 2 - stageRect.top;

      const { d, length } = buildChamferedTrace(startX, startY, endX, endY, cap.side, cap.slot);
      nextTraces.push({ id: cap.id, d, startX, startY, endX, endY, length });
    }

    setStageSize({ w: Math.round(stageRect.width), h: Math.round(stageRect.height) });
    setTraces(nextTraces);
  }, []);

  useLayoutEffect(() => {
    computeTraces();

    const ro = new ResizeObserver(() => {
      computeTraces();
    });
    if (stageRef.current) ro.observe(stageRef.current);
    if (hwFrameRef.current) ro.observe(hwFrameRef.current);

    window.addEventListener('resize', computeTraces);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeTraces);
    };
  }, [computeTraces]);

  // Recompute after cards settle into open position (accounts for initial transform)
  useEffect(() => {
    const t = window.setTimeout(computeTraces, 520);
    return () => window.clearTimeout(t);
  }, [isOpen, computeTraces]);

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
          }, 750);
          observer.disconnect();
        }
      },
      { threshold: 0.28 },
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
    setTilt({ x: nx * 5.5, y: ny * -4.5 });
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

        {/* Apple-Style Frosted Segmented Toggle with High-Contrast Active Open NeoRU State */}
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
              className={`bb-toggle-btn bb-toggle-locked ${!isOpen ? 'is-selected' : ''}`}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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
              className={`bb-toggle-btn bb-toggle-open ${isOpen ? 'is-selected' : ''}`}
            >
              <span className={`bb-toggle-pulse-dot ${isOpen ? 'is-active' : ''}`} aria-hidden="true" />
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3.5" y="7.5" width="9" height="6.5" rx="1.8" />
                <path d="M5.5 7.5V4.8a2.5 2.5 0 0 1 4.8-0.9" />
              </svg>
              <span>Open NeoRU</span>
            </button>
          </div>
        </div>

        {/* STAGE: Layered 2.5D Hardware (z-10) + Crisp SVG PCB Traces (z-20) + 6 Cards (z-30) */}
        <div
          ref={stageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="bb-stage-wrapper"
        >
          {/* SVG Circuit Trace Layer (Desktop Only, z-20 — sits cleanly OVER hardware rim, UNDER cards) */}
          {stageSize.w > 0 && stageSize.h > 0 && (
            <svg
              viewBox={`0 0 ${stageSize.w} ${stageSize.h}`}
              aria-hidden="true"
              className="bb-trace-svg"
            >
              <defs>
                <filter id="neoruGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {CAPABILITIES.map((cap, idx) => {
                const trace = traces.find((t) => t.id === cap.id);
                if (!trace) return null;

                const isActive = hoveredId === cap.id;
                const isDimmed = hoveredId !== null && !isActive;
                const dashLen = Math.ceil(trace.length + 12);

                return (
                  <g
                    key={cap.id}
                    style={{
                      opacity: isOpen ? (isDimmed ? 0.16 : 1) : 0,
                      transition: `opacity 460ms ease ${isOpen ? idx * 55 : 0}ms`,
                    }}
                  >
                    {/* Base hairline PCB trace */}
                    <path
                      d={trace.d}
                      fill="none"
                      stroke={isActive ? cap.accent : '#94a3b8'}
                      strokeOpacity={isActive ? 1 : 0.72}
                      strokeWidth={isActive ? 2.2 : 1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: dashLen,
                        strokeDashoffset: isOpen ? 0 : dashLen,
                        transition: `stroke-dashoffset 820ms cubic-bezier(0.22, 1, 0.36, 1) ${
                          isOpen ? 160 + idx * 65 : 0
                        }ms, stroke 240ms ease, stroke-width 240ms ease`,
                      }}
                    />

                    {/* Flowing luminous data pulse along trace */}
                    {isOpen && !reducedMotion && (
                      <path
                        d={trace.d}
                        fill="none"
                        stroke={cap.accent}
                        strokeWidth={isActive ? 2.9 : 2.1}
                        strokeLinecap="round"
                        strokeDasharray="10 38"
                        filter={isActive ? 'url(#neoruGlow)' : undefined}
                        className={isActive ? 'neoru-trace-pulse-fast' : 'neoru-trace-pulse'}
                        style={{ opacity: isActive ? 1 : 0.72 }}
                      />
                    )}

                    {/* Origin solder pin at cyan FPGA die */}
                    <circle
                      cx={trace.startX}
                      cy={trace.startY}
                      r={isActive ? 3.2 : 2.2}
                      fill={cap.accent}
                      style={{ transition: 'r 220ms ease' }}
                    />

                    {/* Terminal solder-pad node dead-center on card edge */}
                    <circle
                      cx={trace.endX}
                      cy={trace.endY}
                      r={isActive ? 4.6 : 3.5}
                      fill={isActive ? cap.accent : '#ffffff'}
                      stroke={cap.accent}
                      strokeWidth="2"
                      style={{ transition: 'all 220ms ease' }}
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {/* 3-Column Desktop Grid / Stacked Mobile Layout */}
          <div className="bb-stage-grid">
            {/* LEFT 3 CAPABILITIES (z-30) */}
            <div className="bb-cards-col bb-cards-left">
              {leftCards.map((cap, idx) => (
                <CapabilityCard
                  key={cap.id}
                  cardRef={(el) => {
                    cardRefs.current[cap.id] = el;
                  }}
                  item={cap}
                  isOpen={isOpen}
                  delayMs={220 + idx * 80}
                  isHovered={hoveredId === cap.id}
                  isDimmed={hoveredId !== null && hoveredId !== cap.id}
                  onEnter={() => setHoveredId(cap.id)}
                  onLeave={() => setHoveredId(null)}
                />
              ))}
            </div>

            {/* CENTER 2.5D HARDWARE STAGE (z-10) */}
            <div className="bb-center-stage">
              <div
                ref={hwFrameRef}
                className="bb-hardware-frame"
                style={{
                  transform: reducedMotion
                    ? 'none'
                    : `perspective(1200px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
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
                  onLoad={computeTraces}
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
                  onLoad={computeTraces}
                  className="bb-hw-img"
                  style={{
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'translateY(0px) scale(1)' : 'translateY(10px) scale(0.985)',
                  }}
                />
              </div>

              {/* Status Micro-Badge in normal flow below hardware */}
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

            {/* RIGHT 3 CAPABILITIES (z-30) */}
            <div className="bb-cards-col bb-cards-right">
              {rightCards.map((cap, idx) => (
                <CapabilityCard
                  key={cap.id}
                  cardRef={(el) => {
                    cardRefs.current[cap.id] = el;
                  }}
                  item={cap}
                  isOpen={isOpen}
                  delayMs={280 + idx * 80}
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
  cardRef: (el: HTMLDivElement | null) => void;
  item: CapabilityItem;
  isOpen: boolean;
  delayMs: number;
  isHovered: boolean;
  isDimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

const CapabilityCard: React.FC<CapabilityCardProps> = ({
  cardRef,
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
      ref={cardRef}
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
