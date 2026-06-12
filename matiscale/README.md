# Matiscale

Single-page marketing site. React + Vite, light sky-blue theme with a
pure-CSS gradient aura hero and GSAP ScrollTrigger for scroll reveals
and metric count-ups.

## Run

```sh
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Notes

- `prefers-reduced-motion` disables all entrance/scroll animation and the
  hero aura drift.
- The Calendly link is a placeholder (`#calendly`); swap it for the real
  booking URL in the three "Book a call" buttons.
- Client logo row placeholder lives in `src/components/ProofBar.jsx`.
- `scripts/shoot.mjs` is an optional visual-review harness (needs
  `npm i -D puppeteer`).
