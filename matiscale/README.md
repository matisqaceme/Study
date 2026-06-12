# Matiscale

Single-page marketing site. React + Vite, with a lazy-loaded
@react-three/fiber particle field in the hero and GSAP ScrollTrigger
for scroll reveals and metric count-ups.

## Run

```sh
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Notes

- The WebGL hero only mounts on capable hardware (`src/lib/capabilities.js`);
  everything else gets a static gradient canvas. Append `?force3d` to the URL
  to override the check while developing.
- `prefers-reduced-motion` disables all entrance/scroll animation and the 3D.
- The Calendly link is a placeholder (`#calendly`); swap it for the real
  booking URL in the three "Book a call" buttons.
- Client logo row placeholder lives in `src/components/ProofBar.jsx`.
- `scripts/shoot.mjs` is an optional visual-review harness (needs
  `npm i -D puppeteer`).
