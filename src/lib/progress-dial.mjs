/**
 * NeoRU progress dial — a segmented 24-step gauge rendered as one self-contained SVG string.
 * Pure function, no dependencies: usable from Astro frontmatter, Node, or the browser.
 *
 * renderDial({ done, total, inProgress, uid, label })
 *   done        segments that are complete (coloured)
 *   total       number of segments (default 24)
 *   inProgress  segments after `done` drawn as a faint tint of their colour (default 0)
 *   uid         prefix for SVG ids, so several dials can share one page
 *   label       accessible description (defaults to "<done> of <total> done (<pct>%)")
 */
export function renderDial({ done = 0, total = 24, inProgress = 0, uid = 'dial', label = '' } = {}) {
  total = Math.max(1, Math.round(total));
  done = Math.min(total, Math.max(0, Math.round(done)));
  inProgress = Math.min(total - done, Math.max(0, Math.round(inProgress)));
  const pct = Math.round((done / total) * 100);
  const aria = label || `${done} of ${total} done (${pct}%)`;

  const C = 200;            // centre of the 400 × 400 view box
  const R_DISC = 188;       // dial face
  const R_OUT = 170;        // segment ring, outer edge
  const R_IN = 145;         // segment ring, inner edge
  const R_HUB = 64;         // raised centre button
  const STEP = 360 / total;
  const GAP = Math.min(2.2, STEP * 0.18);

  // Red → orange → yellow → green, sampled along the ring (as in the reference design).
  const STOPS = ['#ee4a3f', '#f26b3d', '#f68c3e', '#f8ad42', '#f6cb45', '#e9da48', '#c9d544', '#a2c83d', '#84ba35'];
  const mix = (a, b, t) => {
    const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('');
  };
  const colourAt = (i) => {
    const t = total === 1 ? 1 : i / (total - 1);
    const s = t * (STOPS.length - 1);
    const k = Math.min(STOPS.length - 2, Math.floor(s));
    return mix(STOPS[k], STOPS[k + 1], s - k);
  };

  const pt = (r, deg) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return [C + r * Math.cos(a), C + r * Math.sin(a)].map((v) => +v.toFixed(2));
  };
  const sector = (a0, a1, r0, r1) => {
    const [p1, p2, p3, p4] = [pt(r1, a0), pt(r1, a1), pt(r0, a1), pt(r0, a0)];
    const big = a1 - a0 > 180 ? 1 : 0;
    return `M${p1}A${r1} ${r1} 0 ${big} 1 ${p2}L${p3}A${r0} ${r0} 0 ${big} 0 ${p4}Z`;
  };

  const segments = Array.from({ length: total }, (_, i) => {
    const a0 = i * STEP + GAP / 2;
    const a1 = (i + 1) * STEP - GAP / 2;
    const d = sector(a0, a1, R_IN, R_OUT);
    const state = i < done ? 'done' : i < done + inProgress ? 'active' : 'empty';
    const fill = state === 'empty' ? '#ececee' : colourAt(i);
    return `<path class="nd-seg nd-${state}" style="--i:${i}" d="${d}" fill="${fill}"${state === 'active' ? ' fill-opacity=".3"' : ''}/>`;
  }).join('');
  const shade = Array.from({ length: total }, (_, i) =>
    `<path d="${sector(i * STEP + GAP / 2, (i + 1) * STEP - GAP / 2, R_IN, R_OUT)}"/>`).join('');

  // Needle: a translucent glass blade from the hub to the end of the last completed segment.
  const needleAngle = done * STEP;
  const [h1, h2] = [pt(R_HUB - 2, -1.2), pt(R_HUB - 2, 1.2)];
  const [t1, t2] = [pt(R_OUT + 3, -2.6), pt(R_OUT + 3, 2.6)];
  const needle = `M${h1}L${t1}A${R_OUT + 3} ${R_OUT + 3} 0 0 1 ${t2}L${h2}Z`;

  const countColour = done === 0 ? '#c4c4c8' : colourAt(Math.max(0, done - 1));
  const complete = done === total;
  const id = (s) => `${uid}-${s}`;

  return `<svg class="neoru-dial" viewBox="0 0 400 400" role="img" aria-label="${aria}" data-done="${done}" data-total="${total}" style="--needle:${needleAngle}deg">
<title>${aria}</title>
<defs>
  <radialGradient id="${id('face')}" cx="50%" cy="38%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f7f7f8"/><stop offset="1" stop-color="#eeeef0"/></radialGradient>
  <linearGradient id="${id('rim')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#dcdce0"/></linearGradient>
  <radialGradient id="${id('shade')}" gradientUnits="userSpaceOnUse" cx="${C}" cy="${C}" r="${R_OUT}"><stop offset="${(R_IN / R_OUT).toFixed(3)}" stop-color="#000" stop-opacity=".05"/><stop offset="${((R_IN + 6) / R_OUT).toFixed(3)}" stop-color="#000" stop-opacity="0"/><stop offset=".93" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></radialGradient>
  <linearGradient id="${id('hub')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fdfdfd"/><stop offset="1" stop-color="#ececee"/></linearGradient>
  <linearGradient id="${id('well')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ededef"/><stop offset="1" stop-color="#fafafa"/></linearGradient>
  <linearGradient id="${id('blade')}" gradientUnits="userSpaceOnUse" x1="${C}" y1="${C}" x2="${pt(R_OUT, needleAngle)[0]}" y2="${pt(R_OUT, needleAngle)[1]}"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".6" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity=".42"/></linearGradient>
  <filter id="${id('drop')}" x="-20%" y="-20%" width="140%" height="145%"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="#1d1d1f" flood-opacity=".14"/><feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#1d1d1f" flood-opacity=".1"/></filter>
  <filter id="${id('lift')}" x="-40%" y="-40%" width="180%" height="190%"><feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#1d1d1f" flood-opacity=".12"/></filter>
  <filter id="${id('soft')}" x="-50%" y="-50%" width="200%" height="200%"><feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#1d1d1f" flood-opacity=".12"/></filter>
</defs>
<circle cx="${C}" cy="${C}" r="${R_DISC}" fill="url(#${id('face')})" filter="url(#${id('drop')})"/>
<circle cx="${C}" cy="${C}" r="${R_DISC - 1}" fill="none" stroke="url(#${id('rim')})" stroke-width="2"/>
<circle cx="${C}" cy="${C}" r="${R_OUT + 4}" fill="none" stroke="#000" stroke-opacity=".035" stroke-width="1"/>
<g class="nd-ring">${segments}</g>
<g fill="url(#${id('shade')})" pointer-events="none">${shade}</g>
<g class="nd-needle"${done === 0 ? ' opacity="0"' : ''}><path d="${needle}" fill="url(#${id('blade')})" stroke="#000" stroke-opacity=".05" stroke-width=".6" filter="url(#${id('soft')})"/></g>
<circle cx="${C}" cy="${C}" r="${R_HUB}" fill="url(#${id('hub')})" filter="url(#${id('lift')})"/>
<circle cx="${C}" cy="${C}" r="${R_HUB - 9}" fill="url(#${id('well')})" stroke="#e2e2e5" stroke-width="1.5"/>
<circle cx="${C}" cy="${C}" r="${R_HUB - 10.5}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="1"/>
<path d="M${C - 17} ${C + 1}l11 11 23-24" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" transform="translate(0 1.5)"/>
<path class="nd-check" d="M${C - 17} ${C + 1}l11 11 23-24" fill="none" stroke="${complete ? colourAt(total - 1) : '#cfcfd3'}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
<text x="${C}" y="${C - 92}" text-anchor="middle" font-size="31" font-weight="300" fill="#c2c2c6" letter-spacing="-.5">${pct}%</text>
<text x="${C}" y="${C + 115}" text-anchor="middle" font-size="31" font-weight="400" letter-spacing="-.5"><tspan class="nd-count" fill="${countColour}">${done}</tspan><tspan fill="#c2c2c6">/${total}</tspan></text>
</svg>`;
}

/** Styles and the entrance animation. Include once per page. */
export const DIAL_CSS = `
.neoru-dial{display:block;width:100%;height:auto;font-family:Inter,-apple-system,BlinkMacSystemFont,"SF Pro Display","Segoe UI",sans-serif;overflow:visible}
.neoru-dial .nd-needle{transform-origin:200px 200px;transform:rotate(var(--needle))}
.neoru-dial.is-armed .nd-done,.neoru-dial.is-armed .nd-active{opacity:0}
.neoru-dial.is-armed .nd-needle{transform:rotate(0deg)}
.neoru-dial.is-on .nd-done,.neoru-dial.is-on .nd-active{animation:nd-in .38s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i) * 45ms)}
.neoru-dial.is-on .nd-needle{transition:transform var(--nd-sweep,1s) cubic-bezier(.25,.8,.25,1)}
@keyframes nd-in{from{opacity:0}}
@media (prefers-reduced-motion:reduce){.neoru-dial .nd-seg,.neoru-dial .nd-needle{animation:none!important;transition:none!important;opacity:1}}
`;

/** Entrance animation: segments light up in order, the needle sweeps, the count ticks up. */
export function animateDials(root = document) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  root.querySelectorAll('svg.neoru-dial:not(.is-armed):not(.is-on)').forEach((svg) => {
    const done = +svg.dataset.done;
    if (!done) return;
    const count = svg.querySelector('.nd-count');
    svg.classList.add('is-armed');
    svg.style.setProperty('--nd-sweep', `${Math.max(0.5, done * 0.045 + 0.3)}s`);
    if (count) count.textContent = '0';
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      requestAnimationFrame(() => { svg.classList.replace('is-armed', 'is-on'); });
      const t0 = performance.now(), dur = done * 45 + 300;
      const tick = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        if (count) count.textContent = String(Math.round(done * (1 - Math.pow(1 - k, 3))));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(svg);
  });
}
