import type { ReactNode } from 'react';
import roadmap from '@/data/milestones.json';
import baseline from '@/data/benchmarks.json';

type StatusKey = 'done' | 'in_progress' | 'planned';
type Milestone = { id: string; title: string; group: string; status: string; summary: string };

const LABELS: Record<StatusKey, string> = { done: 'Done', in_progress: 'In progress', planned: 'Planned' };
const milestones = roadmap.milestones as Milestone[];
const stageNotes = ((roadmap as { stages?: { group: string; summary: string }[] }).stages ?? []);
const asOfText = new Date(`${roadmap.asOf}T12:00:00Z`).toLocaleDateString('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** A small status pill: Done, In progress or Planned. */
export function Status({ s }: { s: StatusKey }) {
  return <span className={`nr-status nr-status-${s}`}>{LABELS[s]}</span>;
}

/** The date of the reviewed status snapshot, from src/data/milestones.json. */
export function AsOf() {
  return <time dateTime={roadmap.asOf}>{asOfText}</time>;
}

/** A larger introductory paragraph. */
export function Lead({ children }: { children: ReactNode }) {
  return <p className="nr-lead">{children}</p>;
}

/** Done / in progress / planned counts across every milestone. */
export function StatusSummary() {
  const count = (s: StatusKey) => milestones.filter((m) => m.status === s).length;
  return (
    <div className="nr-summary not-prose">
      <div className="nr-summary-grid">
        {(['done', 'in_progress', 'planned'] as StatusKey[]).map((s) => (
          <div key={s} className={`nr-summary-item nr-tone-${s}`}>
            <span className="nr-summary-value">{count(s)}</span>
            <span className="nr-summary-label">
              <span className="nr-dot" aria-hidden="true" />
              {LABELS[s]}
            </span>
          </div>
        ))}
      </div>
      <p className="nr-summary-note">
        {milestones.length} milestones · status as of <AsOf />. “Done” describes a single milestone, not an integrated
        or measured radio unit.
      </p>
    </div>
  );
}

/** Milestones from the roadmap data, filtered by stage (group) or by a comma-separated list of IDs. */
export function MilestoneList({ group, ids }: { group?: string; ids?: string }) {
  const wanted = ids?.split(',').map((id) => id.trim()).filter(Boolean);
  const items = wanted
    ? wanted.map((id) => milestones.find((m) => m.id === id)).filter((m): m is Milestone => Boolean(m))
    : milestones.filter((m) => m.group === group);
  return (
    <ul className="nr-milestones not-prose">
      {items.map((m) => (
        <li key={m.id} className={`nr-tone-${m.status}`}>
          <span className="nr-dot" aria-hidden="true" />
          <div className="nr-milestone-body">
            <span className="nr-milestone-title">{m.title}</span>
            <span className="nr-milestone-summary">{m.summary}</span>
          </div>
          <span className="nr-milestone-status">{LABELS[m.status as StatusKey]}</span>
        </li>
      ))}
    </ul>
  );
}

/** The one-sentence description of a roadmap stage. */
export function StageSummary({ group }: { group: string }) {
  const note = stageNotes.find((s) => s.group === group)?.summary;
  return note ? <p className="nr-stage-summary">{note}</p> : null;
}

/** The two published reference-baseline metrics, with their scope. */
export function BaselineMetrics() {
  return (
    <div className="nr-metrics not-prose">
      {baseline.metrics.map((m) => (
        <div key={m.id} className="nr-metric">
          <span className="nr-metric-label">{m.label}</span>
          <span className="nr-metric-value">
            {m.value}
            <span className="nr-metric-unit">{m.unit}</span>
          </span>
          <span className="nr-metric-scope">Scope: {m.scope}</span>
        </div>
      ))}
      <p className="nr-metrics-note">
        {baseline.label} ({baseline.implementation}). These are not NeoRU results.
      </p>
    </div>
  );
}

/** The conditions under which the reference baseline was measured. */
export function BaselineConditions() {
  return (
    <dl className="nr-conditions not-prose">
      {baseline.conditions.map((c) => (
        <div key={c.label}>
          <dt>{c.label}</dt>
          <dd>{c.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EvidenceNote() {
  return <p className="nr-fineprint">{baseline.evidenceNote}</p>;
}

/** O-CU, O-DU and O-RU with the two interfaces between them. NeoRU is the O-RU. */
export function SplitDiagram() {
  const units = [
    { key: 'cu', name: 'O-CU', role: 'Central unit', layers: 'RRC · SDAP · PDCP' },
    { key: 'du', name: 'O-DU', role: 'Distributed unit', layers: 'RLC · MAC · High-PHY' },
    { key: 'ru', name: 'O-RU', role: 'Radio unit · NeoRU', layers: 'Low-PHY · RF' },
  ];
  const links = ['F1', 'Open Fronthaul 7.2x'];
  return (
    <figure className="nr-split not-prose" aria-label="O-RAN split 7.2x: the O-CU connects to the O-DU over F1, and the O-DU connects to the O-RU over Open Fronthaul 7.2x. NeoRU is the O-RU.">
      <div className="nr-split-row">
        {units.map((u, i) => (
          <div key={u.key} className="nr-split-cell">
            <div className={`nr-split-unit${u.key === 'ru' ? ' is-neoru' : ''}`}>
              <span className="nr-split-name">{u.name}</span>
              <span className="nr-split-role">{u.role}</span>
              <span className="nr-split-layers">{u.layers}</span>
            </div>
            {i < links.length && (
              <div className="nr-split-link" aria-hidden="true">
                <span>{links[i]}</span>
              </div>
            )}
          </div>
        ))}
      </div>
      <figcaption>NeoRU implements the radio-unit side of the open fronthaul.</figcaption>
    </figure>
  );
}

/** The two processes and the one checked boundary between them. */
export function ArchStack() {
  const rows: { name: string; detail: string; status: StatusKey; kind?: string }[] = [
    { name: 'Control process', detail: 'Rust · configuration and lifecycle, outside the real-time path', status: 'in_progress' },
    { name: 'Configuration hand-off', detail: 'The one lock-free boundary · checked with GenMC', status: 'in_progress', kind: 'boundary' },
    { name: 'Real-time data plane', detail: 'Slot clock · event ring · executor · core plan', status: 'in_progress' },
  ];
  return (
    <div className="nr-stack not-prose">
      {rows.map((r) => (
        <div key={r.name} className={`nr-stack-row${r.kind ? ` is-${r.kind}` : ''}`}>
          <div>
            <span className="nr-stack-name">{r.name}</span>
            <span className="nr-stack-detail">{r.detail}</span>
          </div>
          <Status s={r.status} />
        </div>
      ))}
      <div className="nr-stack-foundation">
        <span>Foundations</span>
        <span>BFP codec · deterministic virtual radio</span>
        <Status s="done" />
      </div>
    </div>
  );
}

/** One glossary entry. */
export function Term({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="nr-term not-prose">
      <dt>{name}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export function Glossary({ children }: { children: ReactNode }) {
  return <dl className="nr-glossary not-prose">{children}</dl>;
}
