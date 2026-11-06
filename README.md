# Bellhaven CRM Assessment

A local review dashboard and Node.js pipeline for comparing Bellhaven community listings with CRM accounts. Built with AI assistance and human approval of corrections.

## Run locally

Requires Node.js 24 or newer. No third-party packages are required.

```sh
npm start
```

Open http://127.0.0.1:8766. The included dashboard contains a fictional assessment snapshot. Decisions and notes are stored in your browser; export them before switching browsers or clearing storage. Dashboard approvals do not directly write to the CRM.

## Read-only scan

Copy `.env.example` to `work/.env`, enter your own candidate token, then run:

```sh
npm run scan
npm run build
```

The scraper follows paginated community listings and homepage community links. It saves source HTML and paginates CRM account reads. Matching normalizes addresses and ZIP codes, with exact normalized-name fallback. AI assisted development and interpretation; the runtime matching uses deterministic rules, without an LLM API dependency. Name-only fallback can produce false positives and requires review.

## Human review and synchronization

Review source evidence, candidate identity, proposed corrections, and billing history. Approve supported corrections, reject incorrect proposals, and flag ambiguity. An approved change plan is executed separately through `work/apply-approved.mjs`; this is an operator-controlled script, not automatic execution of dashboard selections. Keep private review exports, change plans and execution audits outside version control.

For ownership changes, revenue history AND positive unpaid AR require a new account under the correct parent. Only the old account's CHOW pointer changes; its parent and billing history remain preserved. Other approved ownership changes can re-parent directly. Updates are read back and verified, with a local execution audit.

## Existing implementation limits

This repository preserves the existing application rather than rebuilding it. The dashboard is a snapshot. Build scripts use the assessment's original summary counts. Approval export-to-plan preparation is operator assisted. The execution audit skips verified operations, but partial CHOW failure recovery still requires operator review before retrying. Persistent daily decision reconciliation and a daily schedule are not yet complete. Do not treat this version as an unattended production synchronizer.

## Security

Never commit candidate tokens, `.env`, welcome-page HTML, private notes, change plans or execution audits. The published dashboard contains fictional assessment records; no candidate token is required to view it. API credentials remain local.

## Validation

JavaScript syntax checks and a dashboard rendering smoke check were run before packaging. Eight previously approved CRM operations were applied and read back during the assessment; that does not certify all unresolved records or complete end-to-end automation.
