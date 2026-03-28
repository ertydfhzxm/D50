# Changelog

All notable changes to this project will be documented in this file.

## [v3.1.0] - 2026-03-28

### Added
- **12 New Modern-Life Events**: Added new narrative events covering relatable topics like digital detox, workplace anxiety, and housing pressure (`public/js/events.js`).
- **Team Tribute & Easter Eggs**: Implemented a "Team Landing-C" centralized tribute modal with personalized secret messages (passwords: szxw, ldjx, xldyb, gjqgyz, rqjy, phza, xygo) powered by `public/js/easter_eggs.js`.
- **Global Rate Limiting**: Integrated `express-rate-limit` to prevent API abuse, securing the AI endpoints (20 requests/day for anonymous users, 5 requests/hour for tools).
- **HMAC Anonymous Hashing**: Added robust, reproducible anonymous ID hashing for securing user privacy.
- **Telemetry Reporting**: Admin dashboard now officially renders mood telemetry and event heatmaps based on live game endings.

### Changed
- **JWT Authentication Layer**: Fully centralized JWT authorization in `utils/auth.js`, enforcing strict token-based access across all 10 backend API routes.
- **Fetch API Migration**: Migrated away from deprecated HTTP clients to native Node.js `fetch`, implementing 10-second `AbortController` timeouts to prevent AI hanging.
- **Content Limitations**: Enforced strict length limits on the server side (1000 characters for stories, 2000 for diary) to prevent payloads that bloat the database.
- **UI Streamlining**: Removed redundant footer buttons on the index and about pages, embedding the "Life affects life" tribute directly within the universally accessible Credits Modal.
- **Global Contact Info**: Replaced archaic `hello@landing-c.org` references with the unified administrative email: `landing_c_admin@163.com`.

### Fixed
- **Narrative API 500 Error**: Patched the critical `/api/game/narrative` server crash by enforcing input validation for `req.body.stats`.
- **Event Loop Logic**: Resolved various edge cases and hangs in the simulation progression loop.
- **Modal Visibility Sync**: Fixed a regression where Easter Egg Modals were invisible due to misaligned CSS transition classes (`.active`), ensuring smooth, animated modal entries.
- **Unhandled Rejections**: Added robust global Express error handling and `unhandledRejection` listeners for enhanced backend stability.

---

## [v1.5.0] - 2026-03-22
- **Initial Major Rewrite**: Released the enhanced visual narrative and 7-screen interactive layout for the D50 roadshow demo. 
- *Please look at historical commits or the initial `RELEASE_NOTE.md` for full v1.5 features.*
