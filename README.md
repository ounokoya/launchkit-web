# LaunchKit · web

Public site and web application of **LaunchKit**, a SaaS starter kit used as a portfolio demo — live at
**https://saas.koyad.com**. SvelteKit 2 with
Svelte 5 and TypeScript, responsive (desktop 1440 px, tablet 768 px, phone 390 px), in French and English.

## What is inside

| Screens | Routes |
|---|---|
| Home, sign-up, sign-in, e-mail check, organization creation | `/`, `/signup`, `/login`, `/verify-email`, `/onboarding` |
| Dashboard, members and invitations, billing (simulated Pro), projects | `/app/[org]`, `/app/[org]/members`, `/app/[org]/billing`, `/app/[org]/projects` |
| Invitation link, super-admin back office, 403 / 404 | `/invitations/[token]`, `/admin`, error page |

- **The browser never sees the session token.** Only the SvelteKit server talks to the API; it keeps the token in
  an `HttpOnly` cookie and sends it as a bearer token. Every write is a form action, so the app also works without
  JavaScript.
- **Design system from Penpot.** Colours and type sizes are CSS variables (`src/lib/styles/tokens.css`); the
  components (button, field, badge, card, alert, modal, app shell…) are hand-written Svelte, no UI kit.
- **Shared texts.** `src/lib/i18n/fr.json` and `en.json` come from the same source as the API and the e-mails, with
  ICU plurals. A unit test checks that every text used by the code exists in both languages.
- **Strict CSP** (no external script or font, `frame-ancestors 'none'`), `nosniff`, `Referrer-Policy`,
  `X-Frame-Options`.
- **Accessible**: WCAG 2.2 AA checked by axe-core on every page at the three sizes; works with the keyboard alone and
  without JavaScript.

## Run it

Start the server stack first (repository [launchkit-server](https://github.com/ounokoya/launchkit-server):
`docker compose up --build`), then:

```bash
npm ci
API_URL=http://localhost:5080 PUBLIC_MAILPIT_URL=http://localhost:8025 npm run dev
```

Open http://localhost:5173. Sign up with a made-up `@demo.test` address: the verification e-mail is in Mailpit
(http://localhost:8025).

| Variable | Default | Role |
|---|---|---|
| `API_URL` | `http://localhost:5080` | LaunchKit API (server side only) |
| `PUBLIC_MAILPIT_URL` | `http://localhost:8025` | « Open the demo inbox » button |
| `PUBLIC_SOURCE_URL` | — | « View the code » link, hidden when empty |
| `PUBLIC_CONTACT_URL` | — | « Contact me » button, hidden when empty |
| `PUBLIC_ANDROID_URL` | — | « Android app » button (the demo APK), hidden when empty |

## Production

`npm run build`, then `npm start` (`server.js`): the SvelteKit handler plus the security headers on every response,
static files included (`PORT`, `HOST`, `ORIGIN` and the variables above).

Set `ORIGIN` to the public address (`https://launchkit.example`) behind a proxy: SvelteKit refuses any form posted
from another origin. Left empty, `server.js` takes the protocol from the connection itself, so the app also works
when opened locally as `http://localhost:3000` or `http://127.0.0.1:3000`. An `ORIGIN` that does not match the
address in the browser makes every form answer 403 (« Cross-site POST form submissions are forbidden »).

## Tests

| Check | Command |
|---|---|
| Types | `npm run check` |
| Unit tests (logic, components, every text in both languages), coverage ≥ 80 % | `npm run test:coverage` |
| End to end at 1440, 768 and 390 px, against the running API and worker (`WEB_URL`, default port 5173) | `npm run test:e2e` |
| Security | `npm audit --audit-level=moderate`, Semgrep, OWASP ZAP baseline (CI) |

The end-to-end scenario signs up A, reads the verification link in Mailpit, creates an organization and three
projects, checks that the fourth is refused on Free, invites B, lets B accept from the e-mail link, checks that B
cannot open billing, upgrades A to Pro through the Rust worker (the « Welcome to Pro » dialog), then checks the
back office. Each screen is captured into `captures/<size>/`.

The other end-to-end tests cover:

- **the FR | EN switch on every page**: signed out, signed in (dashboard, members, billing, projects, search,
  project, edit, settings, onboarding, invitation), in the back office and on the 403 / 404 pages. The same page must
  come back with the same status, in the other language, then in French again;
- **account**: sign-in required, wrong password, « Resend the email », a made-up link, sign-out, back to the page
  asked for;
- **members**: Free limit of 3 members (pending invitations included), resent and cancelled invitation (the link
  stops working), declined invitation, role change, removal (the person loses access), owner row protected;
- **projects**: search from the top bar, a refused value, edit, delete with « Cancel » then confirmation;
- **settings and organizations**: profile, language kept after a new sign-in, a second organization, switcher, phone
  menu under 768 px;
- **expired links and sessions**: verification link (24 h), invitation (7 days), session. Time is simulated by moving
  the expiry date in ArangoDB (`ARANGO_URL`, default `http://127.0.0.1:8539`; `ARANGO_PASSWORD`, default the one of
  `server/compose.yaml`);
- **API unreachable**: a second web server (port `E2E_DOWN_PORT`, default 4199) pointed at a closed port; public pages
  open, the rest shows a translated message, never the details;
- **without JavaScript**: sign-up, projects, search, members, Pro (the page reloads itself), language, sign-out;
- **accessibility**: axe-core (WCAG 2.0 to 2.2, A and AA) on every kind of page, open menus included, and a
  keyboard-only journey (Tab order, Enter, the « … » menu).

GitHub Actions runs all of it on every push (`.github/workflows/ci.yml`).
