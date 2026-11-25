# Editing the NeoRU website

The public website is English-only. Its content lives in Markdown and JSON; routine editorial changes do not require layout changes.

## Edit a page

Open the corresponding file in `src/content/pages/`. Each page has three required frontmatter fields:

```yaml
---
title: "The page heading"
description: "The short introductory paragraph."
eyebrow: "The section label"
---
```

Write the remaining content in normal Markdown. Do not duplicate the title or description in the body. Home uses six `###` headings and short paragraphs to populate its engineering themes. The Team template contains the two supplied names and roles; its Markdown holds the background and contact copy.

Page templates provide navigation, diagrams, the results table and other layout. To change the names or roles displayed by the Team template, edit the corresponding Team page template and verify the change against an approved source.

## Update the roadmap

Edit **only** `src/data/milestones.json` for milestone content. Home and Roadmap use the same data.

- `asOf` is the date of the reviewed status snapshot, in `YYYY-MM-DD` form. It is not the build date and should not advance automatically.
- Each milestone needs a unique `id`, `title`, `group`, `status` and `summary`.
- The allowed statuses are `done`, `in_progress` and `planned`.
- Keep the current groups `Foundation`, `Phase 1`, `Phase 2`, `Level 3`, `Level 4` and `Later` unless the project structure itself changes.
- Keep Phase 2 development separate from Level 3 and Level 4 validation.
- Array order is the intended display order within each group.
- `stages` holds one optional `summary` sentence per group. It appears at the top of that stage’s panel in the roadmap stepper (`src/components/RoadmapStepper.astro`).
- The stepper derives everything else from the milestones: a stage is done when all of its milestones are done, the solid part of the track ends at the first stage that is not done, and that stage opens by default.

Mark an individual milestone done only when it is complete. Do not use a component’s completion to imply end-to-end integration or validated performance. If the overall development stage changes, update the introductory copy and any affected architecture labels as well.

## Update benchmark evidence

`src/data/benchmarks.json` contains the current **reference baseline**, not NeoRU results. It stores the implementation name, evidence label, conditions and metric scope alongside every result.

The current table is deliberately limited to the two supplied reference metrics. Preserve the distinction between CPU use for the O-RU and package power above idle for the O-RU and DU together. Do not relabel the power figure as radio-only power, and do not compare it with the one-core NeoRU goal.

Before publishing a new performance result:

1. Supply a recorded run and its conditions, measurement method and scope.
2. Identify whether the figure is a reference baseline, a preliminary run or a NeoRU baseline.
3. Add only approved public report links. Do not expose host names, IP addresses, server identifiers or access information.
4. Make a comparative claim only when NeoRU and the reference have been measured under the same conditions.
5. Update the content-integrity checks to reflect the approved result, rather than bypassing a failing check.

The initial event-ring measurement is intentionally excluded from the website. Its outstanding inputs are recorded in `docs/PLACEHOLDERS.md`.

## Replace placeholders

Use `docs/PLACEHOLDERS.md` as the checklist. Add supplied information, remove or revise its visible placeholder, then update the register. A missing link should remain plain text; do not create a dead button or guess an address.

The Docs page is a simple entry page for now. Do not describe unpublished specifications as downloadable or public. The website repository is not the NeoRU implementation repository.

## Appearance and accessibility

Light is the initial theme. The visitor can switch to dark, with the preference stored locally in their browser. Theme changes do not send data to a service.

When editing colours, preserve accessible contrast in both themes. Keep body text readable, status labels meaningful without colour, keyboard focus visible and content available with reduced motion or JavaScript disabled. Do not add third-party fonts, analytics, tracking scripts or embeds.

## Preview and verify

From the project root, run:

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro, using the `/NeoRUwebsite/` base path. For the production output, run:

```sh
npm run verify
npm run preview
```

Review the affected pages in light and dark themes, on a narrow screen and with keyboard navigation. Check that all public URLs are approved and every result retains its conditions. The root README explains the manual GitHub Pages release workflow.

## Editorial guardrails

Use O-RAN descriptively and retain the trademark notice. Do not add the O-RAN logo. Do not add the WPI logo without a supplied asset and guidelines. Refer to other projects factually and respectfully.

Targets, planned work, completed components and measured system behaviour are different states. Keep those differences explicit. Never add invented figures, publications, dates, partners, funding or functionality.

## Update the documentation

Documentation pages are MDX files under `content/docs/`. The root `meta.json` sets the sidebar order and its section separators (`---Introduction---`); `...architecture` and `...engineering` place those folders’ pages directly under their sections.

Status, milestone and benchmark figures in the docs are not typed by hand. They come from `src/data/` through the components in `src/components/docs-blocks.tsx`:

- `<StatusSummary />`, `<MilestoneList group="Phase 1" />` or `<MilestoneList ids="timing-core,event-ring" />`, `<StageSummary group="..." />` and `<AsOf />` read `milestones.json`.
- `<BaselineMetrics />`, `<BaselineConditions />` and `<EvidenceNote />` read `benchmarks.json`.
- `<Status s="done" />`, `<Lead>`, `<SplitDiagram />`, `<ArchStack />`, `<Glossary>` and `<Term>` are presentational.

When you add a docs page, also add its route to the two route lists in `tests/site.test.mjs`. Only the approved external links listed in that test may appear on any page.
