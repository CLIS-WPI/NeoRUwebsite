import type { RefObject } from 'react';
import { OaiLogo, OcuduLogo, OranScLogo, SrsRanLogo } from '@/assets/logos';
import type { NodeId } from './types';

interface EcosystemCardsProps {
  hoveredNode: NodeId;
  neoRuHovered: boolean;
  onNeoRuHover: (hovered: boolean) => void;
  neoRuLogoSrc: string;
  bracketPathRef: RefObject<SVGPathElement | null>;
  ecosystemCardRef: RefObject<HTMLDivElement | null>;
  challengeBannerRef: RefObject<HTMLDivElement | null>;
  neoRuCardRef: RefObject<HTMLDivElement | null>;
}

export function EcosystemCards({
  hoveredNode,
  neoRuHovered,
  onNeoRuHover,
  neoRuLogoSrc,
  bracketPathRef,
  ecosystemCardRef,
  challengeBannerRef,
  neoRuCardRef,
}: EcosystemCardsProps) {
  const isCuDuActive = hoveredNode === 'ocu' || hoveredNode === 'odu';
  const isOruActive = hoveredNode === 'oru' || neoRuHovered;

  return (
    <div className="oran-bottom-grid">
      {/* Left + Center Group: OCUDU & Open-Source Software Ecosystem (CU + DU) */}
      <div className="oran-ecosystem-col">
        {/* Connecting SVG bracket spanning under O-CU and O-DU */}
        <div className="oran-bracket-wrap" aria-hidden="true">
          <svg viewBox="0 0 600 44" fill="none" className="oran-bracket-svg" preserveAspectRatio="none">
            <path
              ref={bracketPathRef}
              d="M 108 4 C 108 22, 120 22, 140 22 L 284 22 C 296 22, 300 28, 300 40 C 300 28, 304 22, 316 22 L 460 22 C 480 22, 492 22, 492 4"
              stroke="#64748B"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div
          ref={ecosystemCardRef}
          className={`oran-eco-card ${isCuDuActive ? 'is-highlighted' : ''}`}
        >
          <div className="oran-eco-header">
            <svg
              className="oran-cloud-icon"
              viewBox="0 0 64 38"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M17 34h31a11 11 0 0 0 1.4-21.9A15 15 0 0 0 20.5 10.6 10.5 10.5 0 0 0 17 34Z"
                stroke="#94A3B8"
                strokeWidth="2"
                fill="#FFFFFF"
              />
            </svg>
            <h2 className="oran-eco-title">
              OCUDU &amp; Open-Source Software Ecosystem (CU + DU)
            </h2>
          </div>

          <div className="oran-logos-row">
            <div className="oran-logo-item">
              <SrsRanLogo className="oran-logo-svg" />
            </div>
            <div className="oran-logo-item">
              <OaiLogo className="oran-logo-svg oran-logo-wide" />
            </div>
            <div className="oran-logo-item">
              <OranScLogo className="oran-logo-svg oran-logo-wide" />
            </div>
            <div className="oran-logo-item">
              <OcuduLogo className="oran-logo-svg" />
            </div>
          </div>

          <div className="oran-status-pill oran-pill-mature">
            <span className="oran-check-badge oran-check-green" aria-hidden="true">✓</span>
            <span>Highly Mature &amp; Widely Available Software for CU &amp; DU</span>
          </div>
        </div>
      </div>

      {/* Right Group: Challenge Banner + Highlighted NeoRU Solution Card */}
      <div className="oran-neoru-col">
        <div
          ref={challengeBannerRef}
          className="oran-challenge-banner"
        >
          <span className="oran-challenge-pointer" aria-hidden="true" />
          <strong>The Challenge:</strong> Proprietary &amp; Fixed-Function / Lack of Open O-RUs
        </div>

        <div
          ref={neoRuCardRef}
          className={`oran-neoru-card ${isOruActive ? 'is-highlighted' : ''}`}
          onMouseEnter={() => onNeoRuHover(true)}
          onMouseLeave={() => onNeoRuHover(false)}
        >
          <div className="oran-neoru-head">
            <div className="oran-neoru-mark" aria-hidden="true">
              <img
                src={neoRuLogoSrc}
                alt=""
                width={58}
                height={58}
                className="oran-neoru-logo-img"
              />
            </div>
            <div>
              <h2 className="oran-neoru-title">NeoRU</h2>
              <p className="oran-neoru-subtitle">Open &amp; Programmable Radio Unit Solution</p>
            </div>
          </div>

          <ul className="oran-neoru-list">
            <li>Fills the missing O-RU gap</li>
            <li>Open Architecture &amp; Programmable FPGA/Low-PHY</li>
            <li>Fully compliant with O-RAN Split-7.2</li>
          </ul>

          <div className="oran-status-pill oran-pill-neoru">
            <span className="oran-check-badge oran-check-blue" aria-hidden="true">✓</span>
            <span>NeoRU fills the gap!</span>
          </div>
        </div>
      </div>
    </div>
  );
}
