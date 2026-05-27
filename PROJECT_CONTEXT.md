# Project Context — Trifinity Tutors

Generated: 2026-05-27

Purpose
-------
This document is an AI-readable, developer-centric overview of the Trifinity Tutors web application (frontend + backend). It explains the architecture, folder structure, routing, authentication, major flows, API surface, database models, current feature coverage, known gaps, and setup instructions so another assistant or developer can continue development without manually reading every file.

1. Project Overview
-------------------
- What the platform does: a marketplace to find, message, and book tutors for one-off or recurring sessions. Students can search and filter tutors, have a limited pre-booking chat (quick replies) and can book sessions. Tutors can register, complete a profile, upload CV and documents, and request verification. Admins can review verification requests and change tutor status.
- Business goal: Provide a verified tutor marketplace that helps students find qualified tutors and enables tutors to list and monetize their teaching services.
- Target users: Students seeking tuition, tutors offering lessons, and admins moderating verification and listings.
- Roles implemented in code: `student`, `tutor`, `admin`.

2. Tech Stack (actual, from repository)
---------------------------------------
- Frontend:
  - React 19 (via Vite)
  - Vite build system
  - Tailwind CSS (dependencies present)
  - @tanstack/react-router (generated route tree)
  - react-router-dom used in many components (mixed routing usage)
  - Axios for HTTP in pages
  - React OAuth Google package used on frontend

- Backend:
  - Node.js + Express
  - MongoDB (mongoose)
  - JSON Web Tokens (jsonwebtoken) used for admin / google flows
  - Google OAuth token verification via `google-auth-library`
  - Multer for file uploads

Notes: There is no Socket.IO server code in the repository. Some backend/frontend endpoints are incomplete or mismatched (see Known Issues). Some npm dependencies appear in package.json but are unused (e.g., `zustand` in backend package.json).

3. Full Folder Structure (high level)
------------------------------------
- Root
  - README.md, QUICK_START.md, several planning/notes files (docs in project root)
  - package.json (root-level git or scripts)

- backend/
  - package.json
  - server.js — Express app entrypoint. Connects to MongoDB using `process.env.MONGO_URI`, mounts static uploads, configures JSON + CORS, and registers three route groups:
    - `/api/students` -> `routes/studentRoutes.js`
    - `/api/tutors` -> `routes/tutorRoutes.js`
    - `/api/auth` -> `routes/auth.js`
  - uploads/ — served statically by Express (created at runtime)
  - middleware/
    - `auth.js` — JWT verification middleware (expects `Authorization: Bearer <token>` and sets `req.user` / `req.admin` on success)
    - `fileUpload.js` — multer configuration, storage to `backend/uploads`, filetype and size limits
  - models/
    - `Tutor.js` — main tutor schema (profile data, docs, verification fields)
    - `Tutoruser.js` — lightweight user record created via Google OAuth (used to collect basic identity info before full Tutor profile)
    - `StudentRequest.js` — student request schema (used when students request tutors)
    - `Application.js` — tutor application to a StudentRequest
    - `Admin.js` — admin credential model
  - routes/
    - `tutorRoutes.js` — many tutor-related APIs (listing, profile management, google login, file uploads, verification flow)
    - `studentRoutes.js` — student flows (create student request, google signup fallback, applications)
    - `auth.js` — admin login route (checks bcrypt-hashed password, returns JWT)

- frontend/
  - package.json — Vite + React + Tailwind + UI libs
  - public/ — static public assets
  - src/
    - App.jsx — main app (user file, open editor)
    - main.jsx / start.js — Vite entry (registers router)
    - routeTree.gen.ts — auto-generated TanStack Router tree (source of canonical routes)
    - router.jsx — router factory (react-query context + router creation)
    - pages/ — page-level React components (Home, Tutors, TutorProfile, BookingSession, Checkout, MessagePage, dashboards, signup/login, etc.)
    - routes/ — TanStack route source files that map to pages (see `routeTree.gen.ts`)
    - components/ — reusable components (Navbar, SiteLayout, Footer, ProfileDropdown, StudentCard, TutorSidebar, Dashboard components, and a `components/ui` design system)
    - lib/ — client helpers: `auth.js` (localStorage helpers and `useAuth`), `auth-helpers.js` (fetch tutor profile and redirect logic)
    - data/ — demo/mock data such as `tutors.js` (primary dataset used by many pages)

4. Routing Flow (frontend)
-------------------------
The canonical route tree is generated in `src/routeTree.gen.ts`. Key routes (paths and where to find code):

- `/` — home page (src/routes/index.jsx)
- `/tutors` — public tutor browse page (src/routes/tutors.jsx)
- `/tutors/:id` — tutor profile page (src/routes/tutors.$id.jsx)
- `/booking/:id` — booking flow entry (page: src/pages/BookingSession.jsx is wired to `/booking/:id` via route definitions)
- `/checkout` — checkout page (src/pages/Checkout.jsx) reading booking details from `localStorage` and simulating payment
- `/messages/:id` — messaging page (src/pages/MessagePage.jsx) — uses quick replies mock; pre-booking chat restriction enforced in UI
- `/auth/*` — auth pages: login/signup/Goolge flows (src/pages/Auth.jsx, LoginPage.jsx, etc.)
- `/register-tutor` — tutor registration/profile completion (various pages/components)
- `/tutor/*` and `/dashboard/*` — tutor and student dashboard routes (generated in `routeTree.gen.ts` and implemented under `src/routes/*`)

Navigation
- The project mixes `@tanstack/react-router` (route generation + routing tree) and `react-router-dom` `Link` usage and `useNavigate` in many components. The generated route tree suggests TanStack Router is the intended router, but many components still use classic react-router navigation.

5. Authentication Flow
----------------------
- Frontend:
  - Local fallback: many pages store `token` and `user` objects in `localStorage`. `lib/auth.js` exposes `useAuth()` which reads user info from `localStorage` (`user`, `tutor`, `student`) and exposes `logout()` which clears storage.
  - Google OAuth: `@react-oauth/google` used on signup/login pages; the frontend decodes the Google JWT (credential) and attempts to POST to backend endpoints (`/api/students/google-register` or `/api/tutors/google-register`) — if backend is unavailable or endpoint not implemented, frontend falls back to local token creation and stores a fake token.

- Backend:
  - Admin login (`/api/auth/login`) expects admin email/password; password is verified via `bcryptjs` and a JWT is issued (signed with `process.env.JWT_SECRET`, expires in 1 day).
  - Tutor Google Login: `POST /api/tutors/google-login` verifies Google id token server-side using `google-auth-library`, creates/fetches a `Tutoruser` entry, then signs a JWT with `process.env.JWT_SECRET` and returns `{ token, user, isProfileComplete, status }`.
  - JWT middleware: `backend/middleware/auth.js` reads `Authorization` header, strips `Bearer `, verifies using `JWT_SECRET`, and sets `req.user`/`req.admin`.

Protected routes & role-based access
- The backend middleware simply verifies tokens; role-based guards are not strictly implemented server-side beyond using the decoded token payload. Many admin-only routes are protected by the `auth` middleware but clients must ensure they possess admin credentials. Frontend `useAuth()` and `auth-helpers` use the stored user role to redirect to appropriate dashboards.

6. Tutor Flow (actual implemented behavior)
-----------------------------------------
- Registration: tutor registration exists both in `studentRoutes` (`POST /api/tutor`) and `tutorRoutes` (`POST /api/tutors`) — there are overlapping endpoints; both create a tutor record with `status: 'pending'`.
- Google login: `POST /api/tutors/google-login` creates a `Tutoruser` (lightweight identity) and returns JWT & `isProfileComplete`. Frontend uses this to decide whether to redirect to `register-tutor` or to the tutor dashboard.
- Profile completion: `POST /api/tutors/complete-profile` protected by `auth` middleware; accepts multi-part form (profile photo + documents). Creates or updates `Tutor` document, sets `profileComplete: true` and `verificationStatus: pending`.
- Upload CV: `POST /api/tutors/upload-cv/:tutorId` accepts a `cv` file and saves file path to `Tutor.cvFile` and sets `verificationStatus: pending`.
- Verification request: `POST /api/tutors/request-verification/:tutorId` checks CV presence and sets `verificationStatus: pending`.

7. Student Flow
---------------
- Student request creation: `POST /api/students/student` saves a `StudentRequest` (used to match tutors and for application flows).
- Google signup for student: `POST /api/students/google-signup` validates token server-side and returns the student identity payload (no persistent student model in repo).
- Booking: booking UI is implemented client-side. `BookingSession.jsx` fetches tutor profile from backend and writes booking details to `localStorage`. The `Checkout` page reads the details and simulates payment.
- Messaging: `MessagePage.jsx` contains a complete mocked message UI. Quick replies restriction is enforced in component state; there is no backend message persistence or socket integration.

8. Messaging System (actual)
---------------------------
- The repository does not include a messaging backend (no Message or Conversation models, no Socket.IO server). The frontend `MessagePage.jsx` implements a mocked messaging UI with:
  - Quick replies (array of pre-defined questions) limited to 3 per conversation before booking is required.
  - Simulated tutor replies (client-side setTimeout).
  - Full chat is gated behind `hasBookedSession` boolean (currently false/mocked).

9. Booking System (actual)
-------------------------
- There is no booking model or booking endpoints in backend. Booking is implemented as a client-side flow:
  - `BookingSession.jsx` lets user select date/time/mode, builds `bookingDetails` and stores them in `localStorage`.
  - `Checkout.jsx` reads `bookingDetails` and runs a simulated payment flow (timeout-based). On success it clears bookingDetails and redirects to student dashboard.

10. Search & Filtering
----------------------
- The tutor browse UI (`/tutors`) uses `src/data/tutors.js` mock dataset and performs client-side filtering and sorting in `src/routes/tutors.jsx`:
  - Search input filters by tutor name, primary subject or tags.
  - Location filter checks `tutor.location` against typed location.
  - Subjects are toggles (checkbox list) and rating filters are checkboxes.
  - Price uses a Slider component that filters by `tutor.price <= maxPrice`.
  - Sorting implemented locally in the page.

11. State Management
--------------------
- Global state: minimal. `lib/auth.js` uses `useState` and `localStorage` to persist user data. There is no global Redux or Zustand usage in the frontend code.
- Local state: pages and components use React local state (`useState`, `useEffect`) for flows (filters, forms, booking). `QueryClient` is created in `router.jsx` but not widely used across pages in the current code.

12. API Architecture (backend endpoints)
--------------------------------------
Base path: `http://localhost:5000/api`

- Auth
  - `POST /api/auth/login` — Admin login. Expects `{ email, password }`. Returns `{ token }` on success.

- Tutors
  - `GET /api/tutors` — returns public listing (filters profileComplete:true, selected fields)
  - `GET /api/tutors/count` — protected (auth middleware) — returns count
  - `POST /api/tutors/google-login` — verifies Google id token server-side; returns `{ token, user, isProfileComplete, status }`
  - `POST /api/tutors/complete-profile` — protected; multipart upload (profilePhoto + documents). Creates/updates `Tutor` document and marks profileComplete.
  - `POST /api/tutors` — create basic tutor (registration)
  - `GET /api/tutors/profile/:tutorId` — returns Tutor profile; will fallback to `Tutoruser` lookup if `tutorId` points to Tutoruser._id
  - `PUT /api/tutors/profile/:tutorId` — update profile (multipart)
  - `POST /api/tutors/upload-cv/:tutorId` — multipart `cv` upload
  - `GET /api/tutors/download-cv/:tutorId` — download stored CV file
  - `POST /api/tutors/request-verification/:tutorId` — requires CV uploaded; sets verificationStatus pending
  - `GET /api/tutors/verifications` — auth protected — list verifications
  - `GET /api/tutors/verifications/pending` — auth protected — list pending verifications
  - `PUT /api/tutors/verify/:tutorId` — auth protected — set verification status `verified` or `rejected`
  - `PUT /api/tutors/:id/status` — update tutor status (approve/reject)
  - `DELETE /api/tutors/:id` — delete tutor (also deletes related `Application` records)

- Students & Applications (studentRoutes)
  - `POST /api/students/student` — create `StudentRequest`
  - `POST /api/students/google-signup` — server-side google id token validation and returns user payload (no persistent Student model)
  - `GET /api/students/studentrequests` — list StudentRequest
  - `GET /api/students/with-applications` — returns students mapped with application records and populated tutor data
  - `GET /api/students/count` — count of student requests
  - `GET /api/students/tutor-count` — count of tutors
  - `POST /api/students/tutor` — register a tutor (overlap with tutors APIs)
  - `POST /api/students/tutor-login` — simple tutor login fallback (not JWT; returns a pseudo token)
  - `POST /api/students/apply` — (actually route is `POST /api/students/apply` in file) creates Application linking tutor and studentRequest
  - Application approve/reject endpoints: `PUT /api/students/approve/:id`, `PUT /api/students/reject/:id`, and deletion routes exist in routes

Server controllers are implemented inline inside route files (no separated controller layer). Mongoose models are imported directly in routes and used for direct queries.

13. Database Models (schemas present in repository)
-------------------------------------------------
- Tutor (`backend/models/Tutor.js`)
  - Fields: `name, email (unique), password, subject, subjects[], locality, experience, phone, bio, qualifications, education, teachingMethodology, hourlyRate, trialRate, profilePhoto, tags[], availability[], documents[], cvFile, cvFileName, cvUploadedAt, status (pending|approved|rejected), verificationStatus (unverified|pending|verified|rejected), verifiedAt, verificationNotes, verifiedBy, googleId, photo, profileComplete (bool), rating, reviews`.

- Tutoruser (`backend/models/Tutoruser.js`)
  - Lightweight record for OAuth users: `name, email (unique), googleId, photo, role`.

- StudentRequest (`backend/models/StudentRequest.js`)
  - Fields: `name, class, subject, locality, board, phoneNumber, exactAddress, createdAt`.

- Application (`backend/models/Application.js`)
  - Fields: `tutorId (ObjectId -> Tutor), studentRequestId (ObjectId -> StudentRequest), status`.

- Admin (`backend/models/Admin.js`)
  - Fields: `email, password` (bcrypt-hashed in DB expected)

14. Reusable Components (frontend)
---------------------------------
- `SiteLayout.jsx` — page frame wrapper (Navbar + main + Footer)
- `Navbar.jsx` — navigation and profile dropdown
- `ProfileDropdown.jsx` — user menu + logout
- `ProtectedRoute.jsx` / `PublicRoute.jsx` — wrappers for route guarding (local client-side guards)
- `components/ui/*` — design system primitives (Button, Card, Input, Slider, Badge, Modal/Dialog components) used across pages
- `TutorSidebar.jsx`, `StudentCard.jsx`, `DashboardShell.jsx` — UI building blocks reused in dashboards and pages

15. Current Features Implemented (checklist)
------------------------------------------
- [x] Tutor model & CRUD (profile create/update)
- [x] Tutor Google OAuth (server-side verification, simple Tutoruser creation)
- [x] Tutor file uploads (profile photo, documents, CV)
- [x] Tutor verification request and admin endpoints to approve/reject
- [x] StudentRequest creation and listing
- [x] Application model (apply to student requests)
- [x] Public tutor browse UI with client-side filters
- [x] Tutor profile UI (mock data and backend profile fetch fallback)
- [x] Booking UI (date/time selection) — client-side only
- [x] Checkout/payment simulation — client-side only
- [x] Mocked messaging UI with pre-booking quick replies
- [x] Admin auth endpoint (login) + JWT middleware

16. Planned Features / TODO (observed or called out in code)
--------------------------------------------------------
- [ ] Persistent booking model & endpoints (Booking collection + controller)
- [ ] Message/Conversation models + real-time chat (Socket.IO or WebSockets)
- [ ] Payment gateway integration (Stripe / Razorpay) replacing the simulated flow
- [ ] Reviews model and UI persistence (server + DB)
- [ ] Notifications (email + in-app)
- [ ] Role-based authorization enforcement server-side (fine-grained RBAC)
- [ ] Replace mixed routing with a single routing strategy (TanStack Router vs react-router-dom)
- [ ] Remove duplicated/overlapping endpoints (studentRoutes vs tutorRoutes duplication)
- [ ] Add tests, linting scripts and CI pipeline

17. Environment Variables
------------------------
Backend expects at least:
- `MONGO_URI` — MongoDB connection string used in `backend/server.js`.
- `JWT_SECRET` — secret used to sign/verify JWT tokens in `auth.js` and `middleware/auth.js`.
- `GOOGLE_CLIENT_ID` — used with `google-auth-library` to verify client tokens server-side.

18. Setup Instructions (local development)
---------------------------------------
Prerequisites: Node.js (18+ recommended), npm or yarn, MongoDB connection (Atlas or local)

Backend
1. cd backend
2. copy `.env.example` (if present) or create `.env` with:
   - MONGO_URI=<your-mongo-uri>
   - JWT_SECRET=<a-secure-random-value>
   - GOOGLE_CLIENT_ID=<your-google-client-id>
3. npm install
4. npm start (server listens on port 5000)

Frontend
1. cd frontend
2. npm install
3. Create a `.env` file for Vite if you need `VITE_` prefixed variables for Google client id (frontend currently decodes Google credential JWT in-place)
4. npm run dev (Vite dev server)

Notes for running end-to-end locally: the frontend expects the backend at `http://localhost:5000` in many API calls. Some frontend pages fall back to using bundled mock data when backend is unavailable.

19. Known Issues / Technical Debt
--------------------------------
- Mixed routing libraries: the project includes a generated TanStack Router tree but many components still use `react-router-dom` `Link` and `useNavigate`, which can cause navigation inconsistencies.
- Messaging and booking are client-side-only mocks. There are no backend models or sockets for chat or bookings.
- Several frontend API calls reference endpoints that do not exist on backend (e.g., `/api/students/register` vs implemented `/api/students/student`). This mismatch needs alignment.
- Some backend routes duplicate functionality (`/api/tutors` vs `/api/students/tutor`). Consolidation recommended.
- No centralized error format/handling across backend routes — routes return different shapes for errors and success responses.
- Limited server-side authorization checks (only `auth` middleware present that verifies JWT). Role checks are not enforced consistently.

20. Architecture Summary (system design & data flow)
-------------------------------------------------
- High-level: single-page React app (Vite) served separately from Node/Express API. The frontend is responsible for UI, routing, local state, and mock flows. The backend is a REST API with Express + Mongoose that handles tutor profiles, student requests, file uploads, and admin auth. Persistence: MongoDB. Files: stored on disk under `backend/uploads` and served statically by Express.

- Typical flows
  - Browse tutors: frontend reads mock `tutors.js` (client-side) or fetches `GET /api/tutors` if wired; user filters locally (no server-side filtering implemented).
  - View profile: frontend requests `GET /api/tutors/profile/:id` — backend attempts direct Tutor lookup, and falls back to Tutoruser -> Tutor by email if the id is a Tutoruser id.
  - Google login (tutor): frontend collects Google credential (via `@react-oauth/google`) and POSTs it to `POST /api/tutors/google-login`. Backend verifies with Google and issues a JWT.
  - Complete tutor profile: protected `POST /api/tutors/complete-profile` accepts multipart form, stores files to `backend/uploads`, and creates/updates Tutor document in MongoDB.
  - Booking & payment: currently client-only; will require Booking model and payment gateway to be fully implemented.

Integration Points
- Google OAuth (frontend obtains Google credential; backend verifies using `GOOGLE_CLIENT_ID` and `google-auth-library`)
- MongoDB for persistent data
- File uploads (CVs, photos) saved to local filesystem under `backend/uploads` via multer

Future Scalability Suggestions
-----------------------------
- Replace local file storage with object storage (S3 / Azure Blob) for scalability and multi-instance deployments.
- Add a Booking collection and endpoints; integrate a production payment gateway (Stripe/Razorpay) and webhooks for payment confirmation.
- Add a Message / Conversation model and a Socket.IO (or WebSocket) real-time service for chat. Separate chat service for scale if needed.
- Add role-based access control middleware and separate controllers for clarity and testability. Introduce request validation (Joi/Zod) and centralized error handling.
- Consolidate routing (single router library) and adopt a consistent API contract (success/error JSON format).
- Add unit/integration tests and a CI pipeline for quality gates.

Appendix: Quick mapping of important files
----------------------------------------
- Backend entry: [backend/server.js](backend/server.js)
- Tutor routes: [backend/routes/tutorRoutes.js](backend/routes/tutorRoutes.js)
- Student routes: [backend/routes/studentRoutes.js](backend/routes/studentRoutes.js)
- Auth: [backend/routes/auth.js](backend/routes/auth.js)
- Tutor model: [backend/models/Tutor.js](backend/models/Tutor.js)
- Tutoruser model: [backend/models/Tutoruser.js](backend/models/Tutoruser.js)
- Frontend route tree (generated): [frontend/src/routeTree.gen.ts](frontend/src/routeTree.gen.ts)
- Frontend browse tutors: [frontend/src/routes/tutors.jsx](frontend/src/routes/tutors.jsx)
- Frontend tutor profile: [frontend/src/routes/tutors.$id.jsx](frontend/src/routes/tutors.$id.jsx)
- Booking page: [frontend/src/pages/BookingSession.jsx](frontend/src/pages/BookingSession.jsx)
- Checkout: [frontend/src/pages/Checkout.jsx](frontend/src/pages/Checkout.jsx)
- Messaging UI: [frontend/src/pages/MessagePage.jsx](frontend/src/pages/MessagePage.jsx)
- Auth UI & Google flow: [frontend/src/pages/Auth.jsx](frontend/src/pages/Auth.jsx)

If you'd like, I can:
- run a deeper scan to create a full API reference with example requests per endpoint,
- open PR to align the frontend endpoints with backend routes (or implement missing endpoints),
- scaffold Booking and Message models + endpoints and wire frontend to them.

---
Generated automatically from repository files on 2026-05-27. Review the "Known Issues" section for mismatches before running integration tests.
