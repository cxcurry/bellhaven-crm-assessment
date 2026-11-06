# COTYE° Bellhaven Workspace

Minimal local CRM review application. Requires Node.js 24 or newer. Uses only built-in Node modules; no dependency installation is needed.

Run `npm start` in this folder, then open http://127.0.0.1:8767.

Set `BELLHAVEN_TOKEN` in the server environment to your own assessment token. Within the original project, the existing `work/.env` is supported. Each token has isolated saved decisions. Tokens never enter browser responses or source control. The server binds only to the local computer; this is not a hosted multi-user service.

1. Refresh verification evidence: fetches all website locations and current CRM accounts. This does not write to CRM.
2. Review individual evidence and exact proposed changes. Save notes or select a decision. Prior decisions and notes remain visible in review history.
3. Bulk approval approves only exact-name, full normalized-address and correct-parent matches. Explicit rejections and flagged decisions are not overridden. Other records stay first.
4. Commence opens a confirmation dialog containing executable approved changes and every excluded unresolved record. A checkbox and the final Yes are required before writes.
5. Execution checks current CRM state before each write, verifies each result, and journals progress. Revenue plus unpaid AR triggers a new account and CHOW linkage while preserving the old account. Failed or uncertain creation requests require investigation, never blind retry.

Changing evidence invalidates approval. Ambiguous, missing and unlisted records cannot be approved for automatic writes without a supported exact plan. Refresh does not automatically resolve uncertainty or invent ownership evidence. The application currently supports name and ownership corrections; duplicate survivor selection and manual field-correction plans remain operator investigations.

Tests: `npm test`. All remote write behavior is tested against mocks, not by making extra CRM changes.

Private runtime state is stored in `work/platform-private` relative to the original workspace root. Keep that directory and exported review data out of public repositories. Previous saved review exports are imported as history; earlier approvals are not silently converted into new execution authority.

## Connie and display options

Use the header theme toggle for persistent light/dark mode. Mismatched names and addresses use a muted warm accent, with field labels. Proposed corrections are displayed as current-versus-proposed values, including the final confirmation.

Connie is a page-aware sales operations coach. Configure OPENAI_API_KEY in platform/.env.local (excluded from version control), or set it in the server environment. CONNIE_MODEL optionally overrides the default gpt-4.1-mini model. Connie sends the question, limited chat history and relevant account evidence to OpenAI; secrets and reviewer notes are excluded from that context. Responses use store:false. Connie has no action tools and cannot write CRM or approve records. Usage requires available API credits.

When the API returns a credit or rate-limit error, the panel labels its response as a built-in guide (not an AI-generated answer). This guide covers review steps, decisions, billing protection and commencement. Conversation history remains in the tab only. Credentials and account decisions remain server-side. The setup credential expires after the period selected during setup; configure your own credential for reuse.
Individual review choices use two-click confirmation: the first click asks You sure?, the second saves and opens the next unresolved account. A double-click works as the same two clicks. Escape or changing choices cancels the armed choice. Save note does not advance. Bulk matching approval bypasses individual confirmation. CRM execution still requires the separate final confirmation.
