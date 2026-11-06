# COTYE° Bellhaven Workspace

Minimal local CRM review application. Requires Node.js 24 or newer. Uses only built-in Node modules; no dependency installation is needed.

Run `npm start` in this folder, then open http://127.0.0.1:8767.

Set `BELLHAVEN_TOKEN` in the server environment to your own assessment token. Within the original project, the existing `work/.env` is supported. Each token has isolated saved decisions. Tokens never enter browser responses or source control. The server binds only to the local computer; this is not a hosted multi-user service.

1. Refresh verification evidence: fetches all website locations and current CRM accounts. This does not write to CRM.
2. Review individual evidence and exact proposed changes. Save notes or select a decision. Prior decisions and notes remain visible in review history.
3. Bulk approval approves only exact-name, full normalized-address and correct-parent matches. Explicit rejections and flagged decisions are not overridden. Other records stay first.
4. Commence opens a confirmation dialog containing executable approved changes and every excluded unresolved record. A checkbox and the final Yes are required before writes.
5. Execution checks current CRM state before each write, verifies each result, and journals progress. Revenue plus unpaid AR triggers a new account and CHOW linkage while preserving the old account. Failed or uncertain creation requests require investigation, never blind retry.

Changing evidence invalidates approval. Ambiguous, missing and unlisted records cannot be approved for automatic writes without a supported exact plan. Refresh does not automatically resolve uncertainty or invent ownership evidence. The main queue supports name and ownership corrections. The investigated resolution review additionally executes explicit, human-approved duplicate, address, creation, and Needs Review plans; it does not invent those plans from uncertain matches.

Tests: `npm test`. All remote write behavior is tested against mocks, not by making extra CRM changes.

Private runtime state is stored in `work/platform-private` relative to the original workspace root. Keep that directory and exported review data out of public repositories. Previous saved review exports are imported as history; earlier approvals are not silently converted into new execution authority.

## Connie and display options

Use the header theme toggle for persistent light/dark mode. Mismatched names and addresses use a muted warm accent, with field labels. Proposed corrections are displayed as current-versus-proposed values, including the final confirmation.

Connie is a page-aware sales operations coach. Configure OPENAI_API_KEY in platform/.env.local (excluded from version control), or set it in the server environment. CONNIE_MODEL optionally overrides the default gpt-4.1-mini model. Connie sends the question, limited chat history and relevant account evidence to OpenAI; secrets and reviewer notes are excluded from that context. Responses use store:false. Connie has no action tools and cannot write CRM or approve records. Usage requires available API credits.

When the API returns a credit or rate-limit error, the panel labels its response as a built-in guide (not an AI-generated answer). This guide covers review steps, decisions, billing protection and commencement. Conversation history remains in the tab only. Credentials and account decisions remain server-side. The setup credential expires after the period selected during setup; configure your own credential for reuse.
Individual review choices use two-click confirmation: the first click asks You sure?, the second saves and opens the next unresolved account. A double-click works as the same two clicks. Escape or changing choices cancels the armed choice. Save note does not advance. Bulk matching approval bypasses individual confirmation. CRM execution still requires the separate final confirmation.

## Final assessment resolution review

Open `/resolution-review` from Investigated corrections. It includes the evidence-backed investigation plan for the fictional assessment: duplicate survivor recommendations, address corrections, missing facility creation and conservative Needs Review flags. Select recommendations, click Commence, review selected and excluded groups, acknowledge, then click Yes. Existing approved field corrections are included in the final preview. Every operation is read back and verified; completed operations are journaled and skipped on repeats. An uncertain creation result stops rather than creating another copy. The page shows timestamped execution receipts.

The included resolution plan is an assessment-specific prepared recommendation set. It contains fictional CRM data, not credentials or reviewer notes. It does not authorize writes by itself. Account preconditions protect against stale records; a different CRM dataset requires a new investigation plan. Three unlisted facilities have unresolved ownership and are proposed for Needs Review rather than unsupported reassignment. Kettering survivor selection is a documented analyst choice among equivalent zero-balance records.

See DAILY-SCHEDULE.md for a daily read-only scan configuration. It has not been activated.



From the repository root: `npm start`, `npm test`. The current platform is in platform/.


## Treatment of unlisted facilities

Bellhaven Care Center of Alliance, Bellhaven of Coldwater, and Bellhaven of Sandusky are absent from the supplied current Bellhaven website. The approved disposition is `Needs Review`, with an explanatory CRM note. Their existing parents, contacts, financial balances, and ownership links are preserved; absence alone does not establish closure or a new owner.

This is a fictional assessment. Real-world businesses found at similar addresses are not evidence that the sandbox accounts should be renamed or re-parented. Use the supplied website and sandbox evidence, and explicitly document unresolved ownership rather than inventing a correction.

After successful resolution execution, the application returns to the main workspace with a timestamped verification receipt. A failed operation keeps the reviewer on the resolution page with the issue exposed.
