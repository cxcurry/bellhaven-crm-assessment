# Daily read-only evidence refresh

The daily job refreshes website and CRM evidence, persists the local snapshot and preserves reviewer decisions. Changed evidence invalidates execution approval. It never writes CRM records. CRM updates require the review screen and final confirmation.

Example cron configuration (08:00 in the scheduler's timezone):

```cron
0 8 * * * cd /absolute/path/to/bellhaven-crm-assessment && node platform/server.mjs --scan-only >> work/daily-scan.log 2>&1
```

Windows Task Scheduler equivalent: daily at 08:00, run `node.exe` with arguments `platform/server.mjs --scan-only`, and set Start in to the repository folder. Set `BELLHAVEN_TOKEN` securely on the local host. Do not run a daily job concurrently with the local review server; they share the persisted snapshot. For a long-running service, use the Refresh button instead until a shared scheduler lock is implemented.

Configuration only: no operating-system scheduled task has been activated.
