import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { CAPABILITIES } from './capabilities';
import { CapabilityCard } from './CapabilityCard';
import type { BlackBoxCanvasHandle } from './BlackBoxCanvas';
import './black-box.css';

const LazyBlackBoxCanvas = lazy(() =>
  import('./BlackBoxCanvas').then((mod) => ({ default: mod.BlackBoxCanvas })),
);

export function BlackBoxSection() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [shouldLoad3D, setShouldLoad3D] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<BlackBoxCanvasHandle>(null);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const lockedBadgeRef = useRef<HTMLDivElement>(null);
  const hasPlayedInitialRef = useRef(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  const leftCaps = CAPABILITIES.filter((c) => c.side === 'left');
  const rightCaps = CAPABILITIES.filter((c) => c.side === 'right');

  const animateToState = useCallback((openTarget: boolean, immediate = false) => {
    const handle = canvasRef.current;
    if (!handle) return;

    timelineRef.current?.kill();
    const st = handle.animState;
    const cards = cardsWrapRef.current?.querySelectorAll('.bb-cap-card') ?? [];
    const badge = lockedBadgeRef.current;

    if (immediate) {
      Object.assign(st, {
        seamGlow: openTarget ? 0.65 : 0,
        lidOpen: openTarget ? 1 : 0,
        coreGlow: openTarget ? 1 : 0,
        tetherProgress: openTarget ? 1 : 0,
        cameraTilt: openTarget ? 1 : 0,
        particlesFade: openTarget ? 0 : 1,
      });
      gsap.set(cards, { opacity: openTarget ? 1 : 0, y: 0, scale: openTarget ? 1 : 0.92 });
      if (badge) gsap.set(badge, { opacity: openTarget ? 0 : 1, y: 0 });
      setIsOpen(openTarget);
      return;
    }

    const tl = gsap.timeline();

    if (openTarget) {
      setIsOpen(true);
      if (badge) tl.to(badge, { opacity: 0, y: -8, duration: 0.35, ease: 'power2.in' }, 0);
      tl.to(st, { seamGlow: 1, duration: 0.45, ease: 'power2.out' }, 0.05);
      tl.to(st, { particlesFade: 0, duration: 0.4 }, 0.15);
      tl.to(st, { lidOpen: 1, duration: 1.15, ease: 'power3.inOut' }, 0.25);
      tl.to(st, { cameraTilt: 1, duration: 1.15, ease: 'power3.inOut' }, 0.25);
      tl.to(st, { coreGlow: 1, duration: 0.7, ease: 'power2.out' }, 0.55);
      tl.to(st, { seamGlow: 0.55, duration: 0.6 }, 1.0);
      tl.to(st, { tetherProgress: 1, duration: 0.85, ease: 'power2.out' }, 0.9);
      tl.fromTo(
        cards,
        { opacity: 0, scale: 0.9, y: 14 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.07,
          ease: 'back.out(1.4)',
        },
        1.15,
      );
    } else {
      setIsOpen(false);
      setActiveIndex(null);
      tl.to(cards, { opacity: 0, scale: 0.92, y: 10, duration: 0.35, stagger: 0.03, ease: 'power2.in' }, 0);
      tl.to(st, { tetherProgress: 0, duration: 0.45, ease: 'power2.in' }, 0.05);
      tl.to(st, { coreGlow: 0, seamGlow: 0, duration: 0.45 }, 0.2);
      tl.to(st, { lidOpen: 0, duration: 0.95, ease: 'power3.inOut' }, 0.3);
      tl.to(st, { cameraTilt: 0, duration: 0.95, ease: 'power3.inOut' }, 0.3);
      tl.to(st, { particlesFade: 1, duration: 0.45 }, 0.85);
      if (badge) tl.to(badge, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.9);
    }

    timelineRef.current = tl;
  }, []);

  const playChoreographedEntrance = useCallback(() => {
    const handle = canvasRef.current;
    if (!handle) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      animateToState(true, true);
      return;
    }

    timelineRef.current?.kill();
    const st = handle.animState;
    const cards = cardsWrapRef.current?.querySelectorAll('.bb-cap-card') ?? [];
    const badge = lockedBadgeRef.current;

    // Phase 1 initial sealed state (0.0s – 1.0s)
    Object.assign(st, {
      seamGlow: 0,
      lidOpen: 0,
      coreGlow: 0,
      tetherProgress: 0,
      cameraTilt: 0,
      particlesFade: 1,
    });
    gsap.set(cards, { opacity: 0, scale: 0.9, y: 16 });
    if (badge) gsap.set(badge, { opacity: 1, y: 0 });
    setIsOpen(false);

    const tl = gsap.timeline();

    // Phase 2 — Mechanical Unlock & Opening (1.0s – 2.2s)
    tl.to(st, { seamGlow: 1, duration: 0.5, ease: 'power2.out' }, 0.95);
    if (badge) tl.to(badge, { opacity: 0, y: -8, duration: 0.35, ease: 'power2.in' }, 1.05);
    tl.to(st, { particlesFade: 0, duration: 0.4 }, 1.1);
    tl.to(st, { lidOpen: 1, duration: 1.2, ease: 'power3.inOut' }, 1.15);
    tl.to(st, { cameraTilt: 1, duration: 1.2, ease: 'power3.inOut' }, 1.15);
    tl.to(st, { coreGlow: 1, duration: 0.7, ease: 'power2.out' }, 1.45);
    tl.call(() => setIsOpen(true), [], 1.5);
    tl.to(st, { seamGlow: 0.55, duration: 0.6 }, 1.9);

    // Phase 3 — Radial Burst & Module Lock-In (1.8s – 3.6s)
    tl.to(st, { tetherProgress: 1, duration: 0.9, ease: 'power2.out' }, 1.85);
    tl.to(
      cards,
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.58,
        stagger: 0.08,
        ease: 'back.out(1.4)',
      },
      2.15,
    );

    timelineRef.current = tl;
  }, [animateToState]);

  // Lazy-load Three.js chunk as Slide 2 approaches viewport, and trigger entrance when visible
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const preloadObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad3D(true);
          preloadObserver.disconnect();
        }
      },
      { rootMargin: '250px 0px' },
    );
    preloadObserver.observe(el);

    return () => {
      preloadObserver.disconnect();
      timelineRef.current?.kill();
    };
  }, []);

  useEffect(() => {
    if (!canvasReady || hasPlayedInitialRef.current) return;
    const el = sectionRef.current;
    if (!el) return;

    const triggerObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasPlayedInitialRef.current) {
          hasPlayedInitialRef.current = true;
          playChoreographedEntrance();
          triggerObserver.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    triggerObserver.observe(el);

    return () => triggerObserver.disconnect();
  }, [canvasReady, playChoreographedEntrance]);

  return (
    <section
      ref={sectionRef}
      className="bb-section"
      aria-labelledby="bb-section-title"
    >
      <div className="container bb-inner">
        {/* Clean, Concise Section Header */}
        <header className="bb-header">
          <span className="bb-eyebrow-pill">BREAK THE BLACK BOX</span>
          <h2 id="bb-section-title" className="bb-title">
            Unlocking the Programmable Radio Edge
          </h2>
          <p className="bb-subtitle">
            Open the O-RU enclosure to unleash capabilities locked away by proprietary hardware.
          </p>
        </header>

        {/* Flagship 3-Column Stage: 3 Left Cards | Centered 3D O-RU Enclosure | 3 Right Cards */}
        <div ref={cardsWrapRef} className="bb-stage-grid">
          <div className="bb-cards-col bb-cards-left">
            {leftCaps.map((item) => (
              <CapabilityCard
                key={item.id}
                item={item}
                isActive={activeIndex === item.index}
                isDimmed={activeIndex !== null && activeIndex !== item.index}
                onHover={setActiveIndex}
              />
            ))}
          </div>

          <div className="bb-center-stage">
            <div className="bb-ambient-aura" aria-hidden="true" />
            <div ref={lockedBadgeRef} className="bb-locked-pill" aria-hidden={isOpen}>
              <span className="bb-lock-dot" />
              <span>Proprietary O-RU — Locked</span>
            </div>

            {shouldLoad3D ? (
              <Suspense fallback={<div className="bb-canvas-host" aria-hidden="true" />}>
                <LazyBlackBoxCanvas
                  ref={canvasRef}
                  activeIndex={activeIndex}
                  onReady={() => setCanvasReady(true)}
                />
              </Suspense>
            ) : (
              <div className="bb-canvas-host" aria-hidden="true" />
            )}

            {/* Core status label when opened */}
            <div className={`bb-core-caption ${isOpen ? 'is-visible' : ''}`}>
              <span className="bb-core-dot" aria-hidden="true" />
              <span>NeoRU Core — Programmable Radio Edge</span>
            </div>
          </div>

          <div className="bb-cards-col bb-cards-right">
            {rightCaps.map((item) => (
              <CapabilityCard
                key={item.id}
                item={item}
                isActive={activeIndex === item.index}
                isDimmed={activeIndex !== null && activeIndex !== item.index}
                onHover={setActiveIndex}
              />
            ))}
          </div>
        </div>

        {/* Apple-Style Segmented Control: Locked Black Box <-> Open NeoRU */}
        <div className="bb-controls">
          <div
            className={`bb-segmented-toggle ${isOpen ? 'is-open' : 'is-locked'}`}
            role="group"
            aria-label="O-RU enclosure state"
          >
            <span className="bb-toggle-thumb" aria-hidden="true" />
            <button
              type="button"
              className={`bb-toggle-btn ${!isOpen ? 'is-selected' : ''}`}
              onClick={() => animateToState(false)}
              aria-pressed={!isOpen}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3.5" y="7.5" width="9" height="6.5" rx="1.8" />
                <path d="M5.5 7.5V5.3a2.5 2.5 0 0 1 5 0v2.2" />
              </svg>
              <span>Locked Black Box</span>
            </button>
            <button
              type="button"
              className={`bb-toggle-btn ${isOpen ? 'is-selected' : ''}`}
              onClick={() => animateToState(true)}
              aria-pressed={isOpen}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3.5" y="7.5" width="9" height="6.5" rx="1.8" />
                <path d="M5.5 7.5V5.2a2.5 2.5 0 0 1 4.7-1.2" />
              </svg>
              <span>Open NeoRU</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
