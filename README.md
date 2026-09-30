# Last Call site

Landing page, promo code page and privacy policy for Last Call, served by
Cloudflare Pages. The promo check runs as a Pages Function in the same deploy.

```
public/                  static site (Pages output directory)
  index.html             landing page (ported from site-handoff "Last Call Site.dc.html")
  redeem.html            promo code page, all states
  privacy.html           privacy policy (copied from last-call-legal; restyle pending)
  404.html
  js/config.js           ⚠ store URL + app scheme: placeholders
  js/site.js             applies config.js to every store/support link
  js/redeem.js           redeem page state machine → POST /api/check
  assets/                logo, favicon, share image, mascot
  _headers               security + cache headers
functions/
  api/check.ts           POST /api/check: is this code good? (read-only)
  api/health.ts          GET /api/health
  _lib/codes.ts          ⚠ code lookup: STUB demo table, replace with D1/KV
```

Clean URLs: Pages serves `redeem.html` at `/redeem` and `privacy.html` at `/privacy`.

## Run locally

```bash
npm install
npm run dev
```

Opens on http://localhost:8788. Wrangler needs a recent Node (the app repo uses 22).

Demo codes while `_lib/codes.ts` is a stub: `SLEEP90` good, `USED01` already
used, `SUMMER25` expired, anything else not found. Stop the dev server and
submit a code to see the error state.

## Deploy (Cloudflare dashboard, Git-connected)

Workers & Pages → Create → Pages → Connect to Git → this repo.

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(empty)* |
| Build output directory | `public` |

Every push to `main` deploys to production; other branches get preview URLs.

## Still placeholder

- `js/config.js`: App Store URL. The `lastcall://redeem` scheme
  isn't handled by the app yet.
- `index.html` `og:image`: assumes `last-call-site.pages.dev`; change with the domain.
- `_lib/codes.ts`: demo data. Real codes need a D1 table, rate limiting, and a
  second endpoint the app calls to redeem (RevenueCat grant; secret key goes in
  the Pages dashboard as an environment secret, never in this repo).
- Privacy page still uses its old style.
