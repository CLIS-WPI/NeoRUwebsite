import { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { OranSceneCanvas, type OranSceneHandle } from './OranSceneCanvas';
import { EcosystemCards } from './EcosystemCards';
import type { NodeId } from './types';
import './oran-hero.css';

interface OranHeroSectionProps {
  neoRuLogoSrc: string;
}

export function OranHeroSection({ neoRuLogoSrc }: OranHeroSectionProps) {
  const [hoveredNode, setHoveredNode] = useState<NodeId>(null);
  const [neoRuHovered, setNeoRuHovered] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const sceneRef = useRef<OranSceneHandle>(null);
  const titleRef = useRef<HTMLDivElement>(null);
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
    const sceneHandle = sceneRef.current;
    if (!sceneHandle) return;

    timelineRef.current?.kill();

    const st = sceneHandle.animState;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bracketPath = bracketPathRef.current;
    const bracketLength = bracketPath ? bracketPath.getTotalLength() : 620;
    const logoItems = ecosystemCardRef.current?.querySelectorAll('.oran-logo-item') ?? [];

    if (prefersReducedMotion) {
      Object.assign(st, {
        gridOpacity: 1,
        ocuRise: 1,
        ocuPower: 1,
        oduRise: 1,
        oduPower: 1,
        oruRise: 1,
        oruPower: 1,
        oruSpotlight: 1,
        midhaulProgress: 1,
        fronthaulProgress: 1,
        flowActive: 0,
      });
      gsap.set(
        [
          titleRef.current,
          ocuBadgeRef.current,
          oduBadgeRef.current,
          oruBadgeRef.current,
          midhaulLabelRef.current,
          fronthaulLabelRef.current,
          ecosystemCardRef.current,
          challengeBannerRef.current,
          neoRuCardRef.current,
          logoItems,
        ],
        { opacity: 1, y: 0, scale: 1 },
      );
      if (bracketPath) {
        gsap.set(bracketPath, { strokeDasharray: bracketLength, strokeDashoffset: 0 });
      }
      return;
    }

    // Reset 3D and DOM initial states
    Object.assign(st, {
      gridOpacity: 0,
      ocuRise: 0,
      ocuPower: 0,
      oduRise: 0,
      oduPower: 0,
      oruRise: 0,
      oruPower: 0,
      oruSpotlight: 0,
      midhaulProgress: 0,
      fronthaulProgress: 0,
      flowActive: 0,
    });

    gsap.set(titleRef.current, { opacity: 0, y: 16 });
    gsap.set([ocuBadgeRef.current, oduBadgeRef.current, oruBadgeRef.current], {
      opacity: 0,
      y: 10,
      scale: 0.94,
    });
    gsap.set([midhaulLabelRef.current, fronthaulLabelRef.current], { opacity: 0, y: 6 });
    gsap.set(ecosystemCardRef.current, { opacity: 0, y: 20 });
    gsap.set(logoItems, { opacity: 0, y: 10, scale: 0.95 });
    gsap.set(challengeBannerRef.current, { opacity: 0, y: 12 });
    gsap.set(neoRuCardRef.current, { opacity: 0, y: 22, scale: 0.96 });
    if (bracketPath) {
      gsap.set(bracketPath, {
        strokeDasharray: bracketLength,
        strokeDashoffset: bracketLength,
      });
    }

    // Choreographed ~4.7s technical assembly timeline
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    // 1. Stage Setup (0.0s – 0.6s)
    tl.to(st, { gridOpacity: 1, duration: 0.6 }, 0);
    tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.05);

    // 2. O-CU Assembly (0.5s – 1.2s)
    tl.to(st, { ocuRise: 1, duration: 0.7, ease: 'back.out(1.25)' }, 0.5);
    tl.to(st, { ocuPower: 1, duration: 0.45 }, 0.75);
    tl.to(ocuBadgeRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 0.85);

    // 3. Midhaul F1 Link (1.0s – 1.6s)
    tl.to(st, { midhaulProgress: 1, duration: 0.6, ease: 'power2.inOut' }, 1.0);
    tl.to(midhaulLabelRef.current, { opacity: 1, y: 0, duration: 0.35 }, 1.25);

    // 4. O-DU Assembly (1.4s – 2.1s)
    tl.to(st, { oduRise: 1, duration: 0.7, ease: 'back.out(1.25)' }, 1.4);
    tl.to(st, { oduPower: 1, duration: 0.45 }, 1.65);
    tl.to(oduBadgeRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 1.75);

    // 5. Fronthaul Split-7.2 Link (1.9s – 2.5s)
    tl.to(st, { fronthaulProgress: 1, duration: 0.6, ease: 'power2.inOut' }, 1.9);
    tl.to(fronthaulLabelRef.current, { opacity: 1, y: 0, duration: 0.35 }, 2.15);

    // 6. O-RU Assembly & Live Flow (2.3s – 3.0s)
    tl.to(st, { oruRise: 1, duration: 0.7, ease: 'back.out(1.25)' }, 2.3);
    tl.to(st, { oruPower: 1, duration: 0.45 }, 2.55);
    tl.to(oruBadgeRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.4 }, 2.65);
    tl.to(st, { flowActive: 1, duration: 0.5 }, 2.75);

    // 7. OCUDU Ecosystem Reveal (2.9s – 3.7s)
    if (bracketPath) {
      tl.to(bracketPath, { strokeDashoffset: 0, duration: 0.65, ease: 'power2.inOut' }, 2.9);
    }
    tl.to(ecosystemCardRef.current, { opacity: 1, y: 0, duration: 0.5 }, 3.15);
    tl.to(
      logoItems,
      { opacity: 1, y: 0, scale: 1, duration: 0.38, stagger: 0.08 },
      3.35,
    );

    // 8. NeoRU Climax Reveal (3.6s – 4.6s)
    tl.to(challengeBannerRef.current, { opacity: 1, y: 0, duration: 0.4 }, 3.6);
    tl.to(
      neoRuCardRef.current,
      { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.4)' },
      3.85,
    );
    tl.to(st, { oruSpotlight: 1, duration: 0.7, ease: 'power2.out' }, 3.9);

    timelineRef.current = tl;
  }, []);

  useEffect(() => {
    buildAndPlayTimeline();
    return () => {
      timelineRef.current?.kill();
    };
  }, [buildAndPlayTimeline]);

  return (
    <section
      ref={sectionRef}
      className="oran-hero-slide"
      aria-label="O-RAN 7.2 Split Interactive 3D Architecture"
    >
      <div className="container oran-hero-inner">
        {/* Top-Right Unobtrusive Replay Animation Button */}
        <button
          type="button"
          className="oran-replay-btn"
          onClick={buildAndPlayTimeline}
          title="Replay assembly animation"
          aria-label="Replay 3D architecture animation"
        >
          <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3.5 10a6.5 6.5 0 1 1 1.9 4.6" />
            <path d="M3.5 14.5v-4.5h4.5" />
          </svg>
          <span>Replay</span>
        </button>

        {/* Hero Title & Subtitle */}
        <div ref={titleRef} className="oran-hero-header">
          <h1 className="oran-hero-title">O-RAN 7.2 Split = CU + DU + RU</h1>
          <p className="oran-hero-subtitle">
            Open-Source &amp; Open Hardware Landscape for O-RAN R&amp;D
          </p>
        </div>

        {/* Interactive 3D WebGL Stage + Synced DOM Badges & Link Labels */}
        <div className="oran-stage-shell">
          {/* Soft ambient colored halos matching each hardware node */}
          <div className="oran-halo oran-halo-ocu" aria-hidden="true" />
          <div className="oran-halo oran-halo-odu" aria-hidden="true" />
          <div className={`oran-halo oran-halo-oru ${neoRuHovered || hoveredNode === 'oru' ? 'is-boosted' : ''}`} aria-hidden="true" />

          <OranSceneCanvas
            ref={sceneRef}
            hoveredNode={hoveredNode}
            neoRuHovered={neoRuHovered}
            onHoverNode={setHoveredNode}
          />

          {/* Crisp Link Labels overlaid at Midhaul and Fronthaul positions */}
          <div className="oran-links-overlay" aria-hidden="true">
            <div ref={midhaulLabelRef} className="oran-link-label oran-link-midhaul">
              <span>Midhaul (F1)</span>
            </div>
            <div ref={fronthaulLabelRef} className="oran-link-label oran-link-fronthaul">
              <span className="oran-fh-top">Fronthaul (OFH)</span>
              <span className="oran-fh-bottom">Split-7.2</span>
            </div>
          </div>

          {/* Interactive Node Badges beneath the 3D Hardware */}
          <div className="oran-badges-row">
            <button
              ref={ocuBadgeRef}
              type="button"
              className={`oran-node-badge oran-badge-ocu ${hoveredNode === 'ocu' ? 'is-active' : ''}`}
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
              className={`oran-node-badge oran-badge-odu ${hoveredNode === 'odu' ? 'is-active' : ''}`}
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
              className={`oran-node-badge oran-badge-oru ${hoveredNode === 'oru' || neoRuHovered ? 'is-active' : ''}`}
              onMouseEnter={() => setHoveredNode('oru')}
              onMouseLeave={() => setHoveredNode(null)}
              onFocus={() => setHoveredNode('oru')}
              onBlur={() => setHoveredNode(null)}
            >
              O-RU
            </button>
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
