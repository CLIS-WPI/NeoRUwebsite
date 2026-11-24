# NeoRU website

A static, English-language project website for NeoRU, the software O-RU developed in the CLIS Lab at Worcester Polytechnic Institute. Built with Astro and TypeScript, with Markdown content, a shared milestone data file, and light and dark themes.

This repository contains the **website**, not the NeoRU radio-unit implementation. The product code is not public yet. Product status and benchmark statements are based on the project brief dated **23 November 2026**.

## Run locally

Use Node.js 24 LTS and npm. Install the exact dependency versions from the lockfile:

```sh
npm ci
npm run dev
```

Open the address printed by Astro, with `/NeoRUwebsite/` at the end. The base path matches the intended GitHub Pages project URL.

```sh
npm run verify   # Type checking, static build, and content/link integrity tests
npm run preview  # Preview the production build
```

The production site is emitted into `dist/`. It needs only static hosting; it has no server, database, tracking scripts, external fonts, or contact-form service. Local storage retains only the visitor's theme preference.

## Edit the content

- [Editing guide](docs/EDITING.md): update Markdown pages, milestones, benchmark data, and the date of the status snapshot.
- [Placeholder register](docs/PLACEHOLDERS.md): every missing item that needs project-owner input before it can be completed.
- Prose lives in `src/content/pages/`; milestone and benchmark data live in `src/data/`.

The main menu includes **Architecture, Benchmarks, Roadmap, Docs, and Team**. Home is reached through the NeoRU wordmark. How we build and Publications are also available through the site navigation and footer.

Only the supplied ProtO-RU reference baseline is published. NeoRU has not yet been measured end to end. The preliminary event-ring result is intentionally absent from the rendered website. Goals and planned capabilities must not be rewritten as achieved results.

## Publish when ready

Publication is manual. Committing or pushing this source does **not** deploy it.

1. In the GitHub repository, open **Settings → Pages** and choose **GitHub Actions** as the source.
2. Review the placeholder register, content, and local production preview.
3. In **Actions**, choose **Publish to GitHub Pages**, then **Run workflow** on the reviewed branch.
4. The workflow runs all verification before deploying the resulting static artifact. Use the deployment URL reported by GitHub to verify the live result.

The configured destination is `https://clis-wpi.github.io/NeoRUwebsite/`. This is a deployment target, not a claim that publication has already happened. Pushes to `main` and pull requests run the separate check workflow without publication.

For a different repository or a custom domain, update `site` and `base` in `astro.config.mjs`, the sitemap address in `public/robots.txt`, and the deployment expectations in the integrity tests. All page links use the shared base-path helper. Configure the domain in GitHub Pages before publishing.

## Verification

`npm run verify` checks Astro/TypeScript, builds the site, and then runs Node's built-in test runner against the generated output. The tests check milestone data, page completeness, links and assets under the GitHub Pages base path, required benchmark qualifications, sitemap coverage, and the absence of remote page resources and the withheld event-ring result.

Manual release review should also cover keyboard navigation, both themes, reduced motion, mobile layout, zoom/reflow, and the accuracy of every public claim. Automated tests do not establish WCAG conformance or validate the underlying laboratory measurements.

## Attribution

NeoRU is described by the project as Apache 2.0 software. This website makes no additional licensing claim about materials not supplied by the project. O-RAN is a trademark of the O-RAN Alliance and is used descriptively. No O-RAN or WPI logo is included.
