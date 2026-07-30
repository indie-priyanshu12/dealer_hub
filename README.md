# Dealer Hub

A full-stack **Car Dealership Inventory System** — a premium digital showroom where customers browse, search, compare, and purchase cars, and admins manage the inventory end to end.

Built with **Node.js / Express + MongoDB (Mongoose)** on the backend and **React (Vite) + Tailwind CSS** on the frontend, with JWT-based authentication, strict Test-Driven Development, and a fully responsive UI down to phone sizes.

![Landing page](screenshots/landing_page.png)

---

## What it does

**For visitors (logged out)**

- A cinematic landing page with a scroll-driven 3D car model, social proof, and clear CTAs
- A gated **Inventory teaser** — 3 real cars visible, the rest blurred behind a "sign in to take a tour of our garage" prompt
- A **Compare showcase** — two cars head-to-head with satisfaction stats, selling the compare-before-you-buy story
- A **Special Offers** page — demo cars with crossed-out prices, discount badges, and a specular-glow card design
- A **Contact** page and a register/login experience with a mode-aware form (`Join Free` lands on Register, `Login` on Login)

**For signed-in users**

- Dashboard with the full live inventory (list/grid views), search, filters, and sorting backed by the API
- Vehicle details with a **photo gallery** — thumbnail strip plus a full lightbox (keyboard navigation, wrap-around slides)
- **Compare up to 3 cars** side-by-side in a spec table
- **Purchase** with live stock enforcement (button disabled at zero stock) and toast feedback
- **My Purchases** — a receipts page with vehicle, price paid, and date & time of every purchase

**For admins**

- Add vehicles (with photo uploads stored in MongoDB), edit, delete, and restock — all enforced server-side, with the matching UI visible only to admins
- **Customer Orders** — a cross-customer purchase ledger with buyer names and emails
- The one admin account is bootstrapped from environment variables at server startup — registration can never create an admin

|                                                        |                                               |                                                      |
| ------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------- |
| ![Inventory](screenshots/inventory_grid_logged_in.png) | ![Details](screenshots/product_page.png)      | ![Compare](screenshots/compare_logged_in.png)        |
| ![Admin inventory](screenshots/inventory_admin.png)    | ![Add vehicle](screenshots/add_car_admin.png) | ![Purchases](screenshots/my_purchases.png)           |
| ![Auth](screenshots/auth_page_login.png)               | ![Offers](screenshots/offers_logged_out.png)  | ![Toast](screenshots/success_toast_notification.png) |

---

## How it's structured

```
dealer_hub/
├── backend/
│   ├── app.js                 # Express app: middleware, routes, error handler
│   ├── server.js              # Entry point: env, DB connection, admin seed, listen
│   ├── models/                # Mongoose schemas: User, Vehicle, VehicleImage, Purchase
│   ├── controllers/           # Route handlers (auth, vehicles, purchases)
│   ├── routes/                # /api/auth, /api/vehicles, /api/purchases
│   ├── middleware/            # JWT `protect` + role-based `admin` guards
│   ├── scripts/               # seed.js (vehicles + photos), exportVehicles.js
│   ├── data/                  # Seed source of truth: car_data_full.json + car_images/
│   ├── utils/                 # seedAdminUser, helpers
│   └── tests/                 # Jest + Supertest + mongodb-memory-server suites
├── src/
│   ├── pages/                 # Landing, Inventory (+teaser), Details, Compare (+teaser),
│   │                          # Special Offers, Contact, Purchases, Admin Orders
│   ├── components/            # Auth, Navbar, Sidebar/DashboardLayout, VehicleCard,
│   │                          # VehicleGallery, SearchFilterBar, action buttons, Toast…
│   ├── context/               # CompareContext, ToastContext
│   ├── config/                # API base URL + image URL resolution
│   └── test/                  # Vitest setup (jsdom polyfills)
├── public/                    # 3D car model + the 6-car logged-out demo data/images
├── screenshots/               # Images used in this README
└── PROMPTS.md                 # Full AI-assisted workflow log (per session)
```

**Architecture notes**

- **The database owns everything**: vehicle data *and* photos live in MongoDB. Photos are stored as binary `VehicleImage` documents and served by `GET /api/vehicles/:id/images/:n` (the one deliberately public vehicle route — `<img>` tags can't attach a JWT). The frontend `public/` folder keeps only a 6-car demo set for the logged-out teasers.
- **Purchases are receipts, not joins**: each purchase snapshots buyer and vehicle details plus the price paid at that moment, so history stays truthful even if a vehicle is later deleted or re-priced.
- **Roles are enforced server-side**: `protect` (JWT) and `admin` middleware guard every management endpoint; the client only *hides* what the server already forbids.

---

## Running it locally

### Prerequisites

- **Node.js 20+** and npm
- **MongoDB** — a local instance (`mongodb://localhost:27017`) or a MongoDB Atlas cluster

### 1. Clone and install

```bash
git clone https://github.com/indie-priyanshu12/dealer_hub.git
cd dealer_hub
npm install
```

One `package.json` covers both tiers — a single install sets up everything.

### 2. Configure environment

Create a **`.env.local`** file in the project root:

```env
# Database — omit to fall back to mongodb://localhost:27017/dealer_hub
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/dealer_hub

# JWT signing secret (any long random string)
JWT_SECRET=change-me-to-something-long-and-random

# The single admin account, created automatically at server startup.
# Registration always creates regular users — this is the only way to get an admin.
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=a-strong-password
ADMIN_NAME=Showroom Admin

# Optional
PORT=5000                       # backend port (default 5000)
# CLIENT_URL=https://your-frontend.example   # locks CORS in production
```

### 3. Seed the database

```bash
node backend/scripts/seed.js
```

This loads **20 vehicles and 101 photos** (stored in MongoDB as binary documents) from `backend/data/`. Safe to re-run — it resets the vehicle and photo collections each time. Point `MONGODB_URI` at a production cluster to seed a deployment the same way.

### 4. Start the backend

```bash
npm start
```

Runs the API at `http://localhost:5000` and bootstraps the admin account from the env vars (a no-op once it exists).

### 5. Start the frontend

In a second terminal:

```bash
npm run dev
```

Opens the app at `http://localhost:5173`. In development, Vite proxies `/api/*` to the backend automatically — no extra config needed.

> **Deploying?** Build with `npm run build`. A deployed frontend needs `VITE_API_BASE_URL` set to the backend's public URL at build time, and the backend should set `CLIENT_URL` (CORS) plus the same `MONGODB_URI` / `JWT_SECRET` / `ADMIN_*` variables.

---

## API overview

**Auth (public)**

| Method | Endpoint             | Description                         |
| ------ | -------------------- | ----------------------------------- |
| POST   | `/api/auth/register` | Register (always as a regular User) |
| POST   | `/api/auth/login`    | Log in, receive a JWT               |

**Vehicles**

| Method | Endpoint                      | Description                                   | Access            |
| ------ | ----------------------------- | --------------------------------------------- | ----------------- |
| GET    | `/api/vehicles`               | List all vehicles                             | Authenticated     |
| GET    | `/api/vehicles/search`        | Search / filter / sort                        | Authenticated     |
| GET    | `/api/vehicles/:id`           | Single vehicle                                | Authenticated     |
| GET    | `/api/vehicles/:id/images/:n` | Serve a stored photo                          | Public (see note) |
| POST   | `/api/vehicles`               | Add a vehicle (accepts base64 `imageUploads`) | **Admin**         |
| PUT    | `/api/vehicles/:id`           | Update a vehicle                              | **Admin**         |
| DELETE | `/api/vehicles/:id`           | Delete a vehicle                              | **Admin**         |
| POST   | `/api/vehicles/:id/purchase`  | Purchase (stock −1, records a receipt)        | Authenticated     |
| POST   | `/api/vehicles/:id/restock`   | Restock (stock +n)                            | **Admin**         |

**Purchases**

| Method | Endpoint              | Description               | Access        |
| ------ | --------------------- | ------------------------- | ------------- |
| GET    | `/api/purchases/mine` | Caller's purchase history | Authenticated |
| GET    | `/api/purchases`      | All customers' purchases  | **Admin**     |

---

## Testing

Everything was built **test-first** (Red → Green → Refactor) — the commit history shows the cycle per feature.

```bash
npm test                # backend + frontend
npm run test:backend    # Jest + Supertest + mongodb-memory-server
npm run test:frontend   # Vitest + React Testing Library
```

### Test report

**163 / 163 passing** (latest full run):

| Suite                       | Framework                            | Files  | Tests   |
| --------------------------- | ------------------------------------ | ------ | ------- |
| Backend API & models        | Jest + Supertest (in-memory MongoDB) | 8      | **72**  |
| Frontend components & pages | Vitest + React Testing Library       | 15     | **91**  |
| **Total**                   |                                      | **23** | **163** |

Coverage highlights: every endpoint's happy path, auth failures (401/403), validation errors (400), business rules (out-of-stock purchase, duplicate IDs, role escalation attempts, purchase receipts), and frontend behavior from the photo gallery's keyboard navigation to the mobile drawer and role-based sidebar.

---

## My AI Usage (also see [PROMPTS.md](PROMPTS.md))

#### 1. Which AI tools were used
Claude (Anthropic) — primary development assistant across the whole project. Used for backend API design and TDD implementation, the React frontend, MongoDB schema/data work, the three.js/React Three Fiber landing page animation, styling and responsive-design passes, debugging, security review, deployment/CORS troubleshooting, and repo cleanup.
Google Gemini (chat, plus a .gemini/ instruction-doc setup mirrored from .claude/) — used earlier and in parallel with Claude, mainly for the initial login/registration UI (including a restyle pass copying layout/visual language from a reference design), the left/right slide transition between login and signup, and general auth-page iteration.
Gemini image generation — used to generate the site's background images (e.g. the auth-page background) and the app's text logo used in the navbar, dashboard sidebar, and mobile header.

Both AI tools were used through chat interfaces guided by project instruction files (requirements.md, .claude/ and .gemini/ design docs — design-system.md, auth-page.md, ux-guide.md, animation-guidelines.md — and CLAUDE.md for workflow rules), so that both tools worked from the same spec rather than improvising independently.

#### 2. How they were used — concrete examples

Backend, test-first. Every REST endpoint (vehicle list/search/create/update/delete/purchase/restock, auth, purchases) was built by first asking Claude to write failing Supertest cases against the spec, confirming they failed for the right reason, then implementing the minimal code to pass them. Example: for POST /api/vehicles/:id/purchase, Claude wrote the 401/success/zero-stock/404 cases first, caught a test that "passed" only because no route existed yet, and flagged that explicitly instead of treating it as a real green.

Data modeling and migration. Claude built the Mongoose Vehicle and VehicleImage models, wrote a seed.js script to load a 20-car JSON dataset into MongoDB, and later migrated all car photos and descriptions out of the frontend public/ folder into the database (a public GET /api/vehicles/:id/images/:n endpoint, since <img> tags can't send a JWT), keeping only 6 demo cars client-side for the logged-out teaser experience.

Frontend feature work. Inventory grid/list views, the vehicle details page with an image gallery/lightbox, the compare feature (built with React Context to avoid prop-drilling), the purchases/customer-orders pages, toast notifications, and the mobile hamburger-drawer shell were all built the same test-first way using Vitest + React Testing Library.

3D landing page animation. Gemini and Claude were both used to build the scroll-linked React Three Fiber car animation described in the animation guidelines doc (7 scenes, later reworked to 6). This required many rounds of correction: fixing model scale/visibility, aligning scroll thresholds to the 90vh scene heights, and — after repeated jitter complaints — moving scrollProgress out of React state into a ref so Lenis scroll ticks stopped fighting react-three-fiber's own render loop.

Design fidelity and role compliance. Claude was given explicit "don't touch functionality, only restyle" instructions for the auth-page redesign, and separately was asked to cross-check the whole implementation against requirements.md before making changes (Session 23), which surfaced a real security gap.

Deployment troubleshooting. Claude was used to diagnose a live CORS misconfiguration on the deployed Render/Vercel setup and a role-based login bug where only the admin role worked correctly after deployment.

#### 3. Reflection — what worked, what didn't, where AI had to be overridden or corrected

What worked well:

Test-first discipline caught real bugs early, not just satisfied a process requirement — e.g. a Mongoose deprecation warning surfaced during a "green" TDD run and was fixed in the same pass, and test pollution (a stale beforeEach not wiping the new VehicleImage collection) was correctly diagnosed as a real failure rather than dismissed as flaky.
Measurement over eyeballing. For responsive-design bugs, Claude consistently verified fixes by checking document.documentElement.scrollWidth against the viewport width rather than relying on visual inspection — this caught a severity-one mobile bug (the hamburger menu itself pushed off-screen, making the mobile menu unopenable) that a quick look would have missed.
A real security review found a real hole. Asked to verify the implementation against requirements with no code changes, Claude found that registration accepted a client-supplied role: "Admin" field, silently defeating all the server-side admin-only middleware. This was fixed test-first (a regression test asserting role: 'Admin' in the request body is ignored) and the fix was structural — a bootstrap seedAdminUser from environment variables instead of a client-selectable role.
Willingness to flag rather than silently decide or silently fix. Several sessions record the AI explicitly surfacing ambiguities (e.g. whether "Update, for admin" meant an actual backend restriction or just an admin-facing UI) and deferring to the user rather than guessing, and flagging bugs it found outside the current task (the client-role security hole, a dotenv/import-order bug) instead of quietly patching or ignoring them.

What didn't work well / had to be redone:

The scroll-linked 3D car animation was the single hardest thing to get right. It went through many iterations across both Claude and Gemini — scale/visibility fixes, threshold recalculation, a "hot reload causes the car to grow infinitely" bug, and a jitter complaint that needed two separate root-cause passes to actually resolve. Even after all of that, it was explicitly noted that neither AI tool produced a fully correct result on its own — the user had to do additional manual tuning to make it "just usable."
A recurring Framer Motion class of bug: AnimatePresence exit animations completing visually (opacity reaching 0) without the element actually unmounting, which silently left an invisible layer blocking clicks. This happened at least twice (the inventory filter popovers, and was proactively designed around later in the gallery lightbox) — rather than debugging framer-motion internals further, the AI's fix was to switch to always-mounted elements with animated visibility instead of conditional mounting, which is a workaround rather than a root-cause fix.
In-browser verification was sometimes incomplete or misleading. Multiple sessions record verification being "interrupted" and left to finish later (toast visual check, part of the compare flow), and at least one apparent visual bug (a 24px layout discrepancy in the mobile auth page) turned out twice to be an artifact of the verification environment itself (a mount animation not ticking in the hidden testing pane) rather than a real layout bug — requiring the user/AI to re-verify on an actual device to be sure.
Tooling and permission limits required manual steps. A bulk deletion of ~24 unreferenced demo photos was blocked by a filesystem permission guard, so the AI handed over a one-line shell command for the user to run themselves rather than being able to complete the cleanup end-to-end.
Deployment-stage issues needed direct diagnosis. CORS misconfiguration and a role-specific login failure only appeared after deploying to Render/Vercel and were not caught by local testing, requiring separate live debugging.
