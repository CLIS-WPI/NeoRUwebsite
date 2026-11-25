import type { RefObject } from 'react';
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

const ECOSYSTEM_PROJECTS = [
  { name: 'srsRAN Project', role: 'Open-source 5G CU/DU' },
  { name: 'OpenAirInterface 5G', role: '3GPP 5G RAN stack' },
  { name: 'O-RAN Software Community', role: 'O-RAN reference software' },
  { name: 'OCUDU', role: 'Open CU/DU ecosystem' },
];

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
      {/* Left + Center Group: Open-Source Software Ecosystem (CU + DU) */}
      <div className="oran-ecosystem-col">
        <div className="oran-bracket-wrap" aria-hidden="true">
          <svg viewBox="0 0 600 44" fill="none" className="oran-bracket-svg" preserveAspectRatio="none">
            <path
              ref={bracketPathRef}
              d="M 108 4 C 108 22, 120 22, 140 22 L 284 22 C 296 22, 300 28, 300 40 C 300 28, 304 22, 316 22 L 460 22 C 480 22, 492 22, 492 4"
              stroke="#475569"
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
            <h2 className="oran-eco-title">
              OCUDU &amp; Open-Source Software Ecosystem (CU + DU)
            </h2>
          </div>

          {/* Plain-text project list — avoids third-party trademarked logos while maximizing contrast */}
          <ul className="oran-projects-row" aria-label="Open-source CU and DU projects">
            {ECOSYSTEM_PROJECTS.map((proj) => (
              <li key={proj.name} className="oran-logo-item oran-project-chip">
                <span className="oran-project-name">{proj.name}</span>
                <span className="oran-project-role">{proj.role}</span>
              </li>
            ))}
          </ul>

          <div className="oran-status-pill oran-pill-mature">
            <span className="oran-check-badge oran-check-green" aria-hidden="true">✓</span>
            <span>Mature, widely available open-source software for CU &amp; DU</span>
          </div>
        </div>
      </div>

      {/* Right Group: Challenge Banner + Highlighted NeoRU Solution Card */}
      <div className="oran-neoru-col">
        <div ref={challengeBannerRef} className="oran-challenge-banner">
          <span className="oran-challenge-pointer" aria-hidden="true" />
          <strong>Few open O-RUs exist:</strong> commercial units remain largely proprietary and fixed-function
        </div>

        <div
          ref={neoRuCardRef}
          className={`oran-neoru-card ${isOruActive ? 'is-highlighted' : ''}`}
          onMouseEnter={() => onNeoRuHover(true)}
          onMouseLeave={() => onNeoRuHover(false)}
        >
          <div className="oran-neoru-head">
            <div className="oran-neoru-mark">
              <img
                src={neoRuLogoSrc}
                alt="NeoRU logo"
                width={88}
                height={88}
                className="oran-neoru-logo-img"
              />
            </div>
            <div>
              <h2 className="oran-neoru-title">NeoRU</h2>
              <p className="oran-neoru-subtitle">An open, software-defined O-RU</p>
            </div>
          </div>

          <ul className="oran-neoru-list">
            <li>Open source (Apache 2.0)</li>
            <li>Built for O-RAN 7.2x fronthaul (in development)</li>
            <li>Runs on commodity servers; GPU and FPGA acceleration planned</li>
            <li>Measured, not claimed</li>
          </ul>

          <div className="oran-status-pill oran-pill-neoru">
            <span className="oran-check-badge oran-check-blue" aria-hidden="true">✓</span>
            <span>Open, software-defined, and measured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
