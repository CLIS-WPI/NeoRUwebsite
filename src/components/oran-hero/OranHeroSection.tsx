import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { EcosystemCards } from './EcosystemCards';
import type { NodeId } from './types';
import './oran-hero.css';

interface OranHeroSectionProps {
  neoRuLogoSrc: string;
  ocuImageSrc: string;
  oduImageSrc: string;
  oruImageSrc: string;
}

const F1_BEAM_LEN = 225;
const OFH_BEAM_LEN = 215;

export function OranHeroSection({
  neoRuLogoSrc,
  ocuImageSrc,
  oduImageSrc,
  oruImageSrc,
}: OranHeroSectionProps) {
  const [hoveredNode, setHoveredNode] = useState<NodeId>(null);
  const [neoRuHovered, setNeoRuHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [flowLive, setFlowLive] = useState(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const ocuNodeRef = useRef<HTMLDivElement>(null);
  const oduNodeRef = useRef<HTMLDivElement>(null);
  const oruNodeRef = useRef<HTMLDivElement>(null);

  const f1PathRef = useRef<SVGPathElement>(null);
  const ofhPathRef = useRef<SVGPathElement>(null);
  const rfWavesRef = useRef<SVGSVGElement>(null);

  const ocuBadgeRef = useRef<HTMLButtonElement>(null);
  const oduBadgeRef = useRef<HTMLButtonElement>(null);
  const oruBadgeRef = useRef<HTMLButtonElement>(null);
  const midhaulLabelRef = useRef<HTMLDivElement>(null);
  const fronthaulLabelRef = useRef<HTMLDivElement>(null);

  const bracketPathRef = useRef<SVGPathElement>(null);
  const ecosystemCardRef = useRef<HTMLDivElement>(null);
  const challengeBannerRef = useRef<HTMLDivElement>(null);
  const neoRuCardRef = useRef<HTMLDivElement>(null);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const buildAndPlayTimeline = useCallback(() => {
    timelineRef.current?.kill();

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReduced);

    const bracketPath = bracketPathRef.current;
    const bracketLength = bracketPath ? bracketPath.getTotalLength() : 620;
    const logoItems = ecosystemCardRef.current?.querySelectorAll('.oran-logo-item') ?? [];

    const allNodes = [ocuNodeRef.current, oduNodeRef.current, oruNodeRef.current];
    const allBadges = [ocuBadgeRef.current, oduBadgeRef.current, oruBadgeRef.current];
    const allPills = [midhaulLabelRef.current, fronthaulLabelRef.current];

    if (prefersReduced) {
      setFlowLive(false);
      gsap.set(
        [
          titleRef.current,
          gridRef.current,
          ...allNodes,
          ...allBadges,
          ...allPills,
          rfWavesRef.current,
          ecosystemCardRef.current,
          challengeBannerRef.current,
          neoRuCardRef.current,
          logoItems,
        ],
        { opacity: 1, y: 0, scale: 1 },
      );
      if (f1PathRef.current) {
        gsap.set(f1PathRef.current, { strokeDasharray: F1_BEAM_LEN, strokeDashoffset: 0 });
      }
      if (ofhPathRef.current) {
        gsap.set(ofhPathRef.current, { strokeDasharray: OFH_BEAM_LEN, strokeDashoffset: 0 });
      }
      if (bracketPath) {
        gsap.set(bracketPath, { strokeDasharray: bracketLength, strokeDashoffset: 0 });
      }
      return;
    }

    setFlowLive(false);

    // Initial hidden states
    gsap.set(gridRef.current, { opacity: 0 });
    gsap.set(titleRef.current, { opacity: 0, y: 12 });
    gsap.set(allNodes, { opacity: 0, y: 22, scale: 0.94 });
    gsap.set(allBadges, { opacity: 0, y: 10, scale: 0.94 });
    gsap.set(allPills, { opacity: 0, y: 6, scale: 0.95 });
    gsap.set(rfWavesRef.current, { opacity: 0, scale: 0.92 });
    gsap.set(ecosystemCardRef.current, { opacity: 0, y: 16 });
    gsap.set(logoItems, { opacity: 0, y: 8, scale: 0.96 });
    gsap.set(challengeBannerRef.current, { opacity: 0, y: 10 });
    gsap.set(neoRuCardRef.current, { opacity: 0, y: 18, scale: 0.96 });

    if (f1PathRef.current) {
      gsap.set(f1PathRef.current, { strokeDasharray: F1_BEAM_LEN, strokeDashoffset: F1_BEAM_LEN });
    }
    if (ofhPathRef.current) {
      gsap.set(ofhPathRef.current, { strokeDasharray: OFH_BEAM_LEN, strokeDashoffset: OFH_BEAM_LEN });
    }
    if (bracketPath) {
      gsap.set(bracketPath, { strokeDasharray: bracketLength, strokeDashoffset: bracketLength });
    }

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Stage floor & hero title (0.0s – 0.45s)
    tl.to(gridRef.current, { opacity: 1, duration: 0.55 }, 0);
    tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.5 }, 0.04);

    // 2. O-CU rises + badge activates (0.35s – 0.95s)
    tl.to(ocuNodeRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }, 0.35);
    tl.to(ocuBadgeRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.35 }, 0.62);

    // 3. F1 Midhaul optical beam draws + pill reveals (0.85s – 1.35s)
    if (f1PathRef.current) {
      tl.to(f1PathRef.current, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 0.85);
    }
    tl.to(midhaulLabelRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.32 }, 1.05);

    // 4. O-DU rises + badge activates (1.25s – 1.85s)
    tl.to(oduNodeRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }, 1.25);
    tl.to(oduBadgeRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.35 }, 1.52);

    // 5. Open Fronthaul 7.2x optical beam draws + pill reveals (1.75s – 2.25s)
    if (ofhPathRef.current) {
      tl.to(ofhPathRef.current, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.inOut' }, 1.75);
    }
    tl.to(fronthaulLabelRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.32 }, 1.95);

    // 6. O-RU rises + badge activates + RF waves begin pulsing (2.15s – 2.75s)
    tl.to(oruNodeRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.62, ease: 'back.out(1.2)' }, 2.15);
    tl.to(oruBadgeRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.35 }, 2.42);
    tl.to(rfWavesRef.current, { opacity: 1, scale: 1, duration: 0.45 }, 2.52);
    tl.call(() => setFlowLive(true), undefined, 2.48);

    // 7. Bottom OCUDU Ecosystem bracket & card (2.65s – 3.25s)
    if (bracketPath) {
      tl.to(bracketPath, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, 2.65);
    }
    tl.to(ecosystemCardRef.current, { opacity: 1, y: 0, duration: 0.45 }, 2.85);
    tl.to(logoItems, { opacity: 1, y: 0, scale: 1, duration: 0.32, stagger: 0.06 }, 3.0);

    // 8. NeoRU Solution Card reveal (3.10s – 3.55s)
    tl.to(challengeBannerRef.current, { opacity: 1, y: 0, duration: 0.35 }, 3.1);
    tl.to(
      neoRuCardRef.current,
      { opacity: 1, y: 0, scale: 1, duration: 0.48, ease: 'back.out(1.35)' },
      3.25,
    );

    timelineRef.current = tl;
  }, []);

  useEffect(() => {
    buildAndPlayTimeline();

    const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionChange = () => buildAndPlayTimeline();
    motionMq.addEventListener('change', onMotionChange);

    return () => {
      motionMq.removeEventListener('change', onMotionChange);
      timelineRef.current?.kill();
    };
  }, [buildAndPlayTimeline]);

  const handleStageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-ny * 4.5).toFixed(2)),
      ry: Number((nx * 5.5).toFixed(2)),
    });
  };

  const handleStageMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const isOcuActive = hoveredNode === 'ocu';
  const isOduActive = hoveredNode === 'odu';
  const isOruActive = hoveredNode === 'oru' || neoRuHovered;
  const isF1Boosted = isOcuActive || isOduActive;
  const isOfhBoosted = isOduActive || isOruActive;

  return (
    <section
      id="home"
      ref={sectionRef}
      className="oran-hero-slide"
      aria-label="O-RAN with the 7.2x split interactive architecture"
    >
      <div className="container oran-hero-inner">
        {!reducedMotion && (
          <button
            type="button"
            className="oran-replay-btn"
            onClick={buildAndPlayTimeline}
            title="Replay assembly animation"
            aria-label="Replay architecture animation"
          >
            <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3.5 10a6.5 6.5 0 1 1 1.9 4.6" />
              <path d="M3.5 14.5v-4.5h4.5" />
            </svg>
            <span>Replay</span>
          </button>
        )}

        {/* Hero Title & Subtitle */}
        <div ref={titleRef} className="oran-hero-header">
          <h1 className="oran-hero-title">O-RAN with the 7.2x Split: CU + DU + RU</h1>
          <p className="oran-hero-subtitle">
            Open-Source &amp; Open Hardware Landscape for O-RAN R&amp;D
          </p>
        </div>

        {/* Desktop/Tablet 2.5D Layered Hardware Stage (>=768px) */}
        <div
          className="oran-stage-shell"
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
        >
          <div
            className="oran-stage-25d"
            style={{
              transform: reducedMotion
                ? 'none'
                : `perspective(1200px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
            }}
          >
            {/* Subtle architectural perspective floor grid */}
            <div ref={gridRef} className="oran-floor-grid" aria-hidden="true" />

            {/* Soft studio ambient halos behind each node */}
            <div
              className={`oran-halo oran-halo-ocu ${isOcuActive ? 'is-boosted' : ''}`}
              style={{ left: '16.7%' }}
              aria-hidden="true"
            />
            <div
              className={`oran-halo oran-halo-odu ${isOduActive ? 'is-boosted' : ''}`}
              style={{ left: '50%' }}
              aria-hidden="true"
            />
            <div
              className={`oran-halo oran-halo-oru ${isOruActive ? 'is-boosted' : ''}`}
              style={{ left: '83.3%' }}
              aria-hidden="true"
            />

            {/* Crisp SVG Optical Links (F1 Midhaul + Open Fronthaul 7.2x) */}
            <svg
              className={`oran-links-svg ${flowLive ? 'is-live' : ''}`}
              viewBox="0 0 1200 260"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="oran-f1-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#059669" />
                  <stop offset="55%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
                <linearGradient id="oran-ofh-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="55%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>

              {/* F1 Midhaul: O-CU -> O-DU */}
              <g className={`oran-link-group oran-link-f1 ${isF1Boosted ? 'is-boosted' : ''}`}>
                <path
                  className="oran-beam-glow oran-beam-glow-f1"
                  d="M 248 164 L 468 164"
                />
                <path
                  ref={f1PathRef}
                  className="oran-beam-core oran-beam-core-f1"
                  d="M 248 164 L 468 164"
                />
                <path
                  className="oran-beam-pulse oran-beam-pulse-f1"
                  d="M 248 164 L 468 164"
                />
              </g>

              {/* Open Fronthaul 7.2x: O-DU <-> O-RU */}
              <g className={`oran-link-group oran-link-ofh ${isOfhBoosted ? 'is-boosted' : ''}`}>
                <path
                  className="oran-beam-glow oran-beam-glow-ofh"
                  d="M 732 164 L 936 164"
                />
                <path
                  ref={ofhPathRef}
                  className="oran-beam-core oran-beam-core-ofh"
                  d="M 732 164 L 936 164"
                />
                <path
                  className="oran-beam-pulse oran-beam-pulse-ofh-fwd"
                  d="M 732 164 L 936 164"
                />
                <path
                  className="oran-beam-pulse oran-beam-pulse-ofh-rev"
                  d="M 936 164 L 732 164"
                />
              </g>
            </svg>

            {/* 3 Studio Hardware Nodes aligned horizontally over O-CU / O-DU / O-RU */}
            <div className="oran-nodes-row">
              {/* Left: O-CU Edge Compute Tower */}
              <div
                ref={ocuNodeRef}
                className={`oran-hw-node oran-hw-ocu ${isOcuActive ? 'is-active' : ''}`}
                onMouseEnter={() => setHoveredNode('ocu')}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <img
                  src={ocuImageSrc}
                  alt="O-CU Edge Compute Tower hardware"
                  className="oran-hw-img oran-hw-img-ocu"
                  draggable={false}
                />
              </div>

              {/* Center: O-DU Rackmount Accelerator Unit */}
              <div
                ref={oduNodeRef}
                className={`oran-hw-node oran-hw-odu ${isOduActive ? 'is-active' : ''}`}
                onMouseEnter={() => setHoveredNode('odu')}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <img
                  src={oduImageSrc}
                  alt="O-DU Rackmount Accelerator Unit hardware"
                  className="oran-hw-img oran-hw-img-odu"
                  draggable={false}
                />
              </div>

              {/* Right: O-RU + 5G Sector Antenna Pole + Concentric RF Signal Waves */}
              <div
                ref={oruNodeRef}
                className={`oran-hw-node oran-hw-oru ${isOruActive ? 'is-active' : ''}`}
                onMouseEnter={() => setHoveredNode('oru')}
                onMouseLeave={() => setHoveredNode(null)}
              >
                <div className="oran-oru-visual">
                  <img
                    src={oruImageSrc}
                    alt="O-RU and 5G Sector Antenna mast hardware"
                    className="oran-hw-img oran-hw-img-oru"
                    draggable={false}
                  />
                  {/* Minimalist concentric RF signal arcs pulsing outward from the 5G antenna panel */}
                  <svg
                    ref={rfWavesRef}
                    className={`oran-rf-waves ${flowLive ? 'is-live' : ''} ${isOruActive ? 'is-boosted' : ''}`}
                    viewBox="0 0 64 110"
                    fill="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="oran-rf-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.45" />
                      </linearGradient>
                    </defs>
                    <path className="oran-rf-arc oran-rf-arc-1" d="M 6 39 A 20 20 0 0 1 6 71" stroke="url(#oran-rf-grad)" strokeWidth="2.4" strokeLinecap="round" />
                    <path className="oran-rf-arc oran-rf-arc-2" d="M 18 30 A 32 32 0 0 1 18 80" stroke="url(#oran-rf-grad)" strokeWidth="2.2" strokeLinecap="round" />
                    <path className="oran-rf-arc oran-rf-arc-3" d="M 30 21 A 44 44 0 0 1 30 89" stroke="url(#oran-rf-grad)" strokeWidth="2" strokeLinecap="round" />
                    <path className="oran-rf-arc oran-rf-arc-4" d="M 42 12 A 56 56 0 0 1 42 98" stroke="url(#oran-rf-grad)" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Crisp Interface Pill Labels centered directly on each optical beam */}
            <div className="oran-links-overlay" aria-hidden="true">
              <div
                ref={midhaulLabelRef}
                className={`oran-link-pill oran-link-pill-f1 ${isF1Boosted ? 'is-boosted' : ''}`}
                style={{ left: '33.3%', top: '63%' }}
              >
                F1
              </div>
              <div
                ref={fronthaulLabelRef}
                className={`oran-link-pill oran-link-pill-ofh ${isOfhBoosted ? 'is-boosted' : ''}`}
                style={{ left: '66.7%', top: '63%' }}
              >
                Open Fronthaul 7.2x
              </div>
            </div>
          </div>

          {/* Node Badges aligned directly beneath each studio hardware node */}
          <div className="oran-badges-track">
            <button
              ref={ocuBadgeRef}
              type="button"
              style={{ left: '16.7%' }}
              className={`oran-node-badge oran-badge-ocu ${isOcuActive ? 'is-active' : ''}`}
              onMouseEnter={() => setHoveredNode('ocu')}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setHoveredNode('ocu')}
              onBlur={() => setHoveredNode(null)}
            >
              O-CU
            </button>
            <button
              ref={oduBadgeRef}
              type="button"
              style={{ left: '50%' }}
              className={`oran-node-badge oran-badge-odu ${isOduActive ? 'is-active' : ''}`}
              onMouseEnter={() => setHoveredNode('odu')}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setHoveredNode('odu')}
              onBlur={() => setHoveredNode(null)}
            >
              O-DU
            </button>
            <button
              ref={oruBadgeRef}
              type="button"
              style={{ left: '83.3%' }}
              className={`oran-node-badge oran-badge-oru ${isOruActive ? 'is-active' : ''}`}
              onMouseEnter={() => setHoveredNode('oru')}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setHoveredNode('oru')}
              onBlur={() => setHoveredNode(null)}
            >
              O-RU
            </button>
          </div>
        </div>

        {/* Clean Vertical Flow Diagram for Mobile Viewports (<768px) */}
        <div className="oran-mobile-stack" aria-label="O-RAN 7.2x split vertical flow">
          <div className="oran-mobile-node oran-mobile-ocu">
            <img src={ocuImageSrc} alt="" className="oran-mobile-thumb" aria-hidden="true" />
            <div className="oran-mobile-node-copy">
              <span className="oran-mobile-pill oran-badge-ocu">O-CU</span>
              <span className="oran-mobile-desc">Central Unit · Edge Compute Tower</span>
            </div>
          </div>
          <div className="oran-mobile-connector" aria-hidden="true">
            <span className="oran-mobile-line oran-mobile-line-f1" />
            <span className="oran-mobile-if-pill">F1</span>
            <span className="oran-mobile-line oran-mobile-line-f1" />
          </div>
          <div className="oran-mobile-node oran-mobile-odu">
            <img src={oduImageSrc} alt="" className="oran-mobile-thumb" aria-hidden="true" />
            <div className="oran-mobile-node-copy">
              <span className="oran-mobile-pill oran-badge-odu">O-DU</span>
              <span className="oran-mobile-desc">Distributed Unit · Baseband Accelerator</span>
            </div>
          </div>
          <div className="oran-mobile-connector" aria-hidden="true">
            <span className="oran-mobile-line oran-mobile-line-blue" />
            <span className="oran-mobile-if-pill oran-link-pill-ofh">Open Fronthaul 7.2x</span>
            <span className="oran-mobile-line oran-mobile-line-blue" />
          </div>
          <div className="oran-mobile-node oran-mobile-oru">
            <img src={oruImageSrc} alt="" className="oran-mobile-thumb" aria-hidden="true" />
            <div className="oran-mobile-node-copy">
              <span className="oran-mobile-pill oran-badge-oru">O-RU</span>
              <span className="oran-mobile-desc">Radio Unit · NeoRU Software O-RU</span>
            </div>
          </div>
        </div>

        {/* Bottom Ecosystem & NeoRU Value Proposition Layer */}
        <EcosystemCards
          hoveredNode={hoveredNode}
          neoRuHovered={neoRuHovered}
          onNeoRuHover={setNeoRuHovered}
          neoRuLogoSrc={neoRuLogoSrc}
          bracketPathRef={bracketPathRef}
          ecosystemCardRef={ecosystemCardRef}
          challengeBannerRef={challengeBannerRef}
          neoRuCardRef={neoRuCardRef}
        />
      </div>
    </section>
  );
}
