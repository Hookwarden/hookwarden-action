export const id = 242;
export const ids = [242];
export const modules = {

/***/ 242:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  postOrUpdateStickyComment: () => (/* binding */ postOrUpdateStickyComment)
});

// EXTERNAL MODULE: ../../node_modules/.pnpm/@actions+core@1.11.1/node_modules/@actions/core/lib/core.js
var core = __webpack_require__(4442);
// EXTERNAL MODULE: ../../node_modules/.pnpm/@actions+github@6.0.1/node_modules/@actions/github/lib/github.js
var github = __webpack_require__(5251);
;// CONCATENATED MODULE: ../pr-renderer/dist/comment.format.js
// Pure renderer for the sticky PR summary comment.
// No I/O, no Octokit, no node:* — testable in isolation.
//
// D-81: STICKY_MARKER is byte-locked. Plan grep gate enforces the exact spelling.
// D-82: top-5 findings table sorted by severity desc → file_path → line.
// D-83: callers handle silent-on-clean dispatch; this module does not post.
const STICKY_MARKER = "<!-- hookwarden:pr-summary -->";
const CLEAN_BODY = `${STICKY_MARKER}\n✅ hookwarden: no new findings`;
// T-05-03-01: identity verification literal. The default GITHUB_TOKEN posts as
// 'github-actions[bot]'. Plan grep gate enforces this exact string.
const BOT_LOGIN = "github-actions[bot]";
const SEVERITY_RANK = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
};
const SEVERITY_ORDER = [
    "critical",
    "high",
    "medium",
    "low",
    "info",
];
function compareFindings(a, b) {
    const sa = SEVERITY_RANK[a.severity];
    const sb = SEVERITY_RANK[b.severity];
    if (sa !== sb)
        return sa - sb;
    if (a.file_path !== b.file_path)
        return a.file_path < b.file_path ? -1 : 1;
    return a.location.line - b.location.line;
}
function tabulateBySeverity(findings) {
    const counts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0,
    };
    for (const f of findings) {
        counts[f.severity] += 1;
    }
    return counts;
}
function severityTotalsLine(counts) {
    const parts = [];
    for (const sev of SEVERITY_ORDER) {
        if (counts[sev] > 0)
            parts.push(`${counts[sev]} ${sev}`);
    }
    return `**Severity:** ${parts.join(", ")}`;
}
function fixHintFor(f) {
    const msg = (f.message ?? "").trim();
    if (msg === "")
        return "—";
    // First sentence only — keeps the cell narrow. Fall back to the full message
    // if no terminal punctuation is found.
    const period = msg.indexOf(".");
    return period > 0 ? msg.slice(0, period) : msg;
}
function tableRow(f) {
    return `| ${f.severity} | \`${f.file_path}:${f.location.line}\` | \`${f.rule_id}\` | ${fixHintFor(f)} |`;
}
function renderSummaryBody(input) {
    const { newFindings, findingsCount, codeScanningUrl } = input;
    const sorted = [...newFindings].sort(compareFindings);
    const top = sorted.slice(0, 5);
    const overflow = sorted.length - top.length;
    const counts = tabulateBySeverity(sorted);
    const lines = [
        STICKY_MARKER,
        `## hookwarden: ${sorted.length} new finding(s)`,
        "",
        severityTotalsLine(counts),
        "",
        "| Severity | Location | Rule | Fix |",
        "| --- | --- | --- | --- |",
        ...top.map(tableRow),
    ];
    if (overflow > 0) {
        lines.push("");
        lines.push(`_…see Code Scanning for ${overflow} more finding(s) → [view all](${codeScanningUrl})._`);
    }
    lines.push("");
    lines.push(`_Total findings in this PR: ${findingsCount}. Inline annotations available in [Code Scanning](${codeScanningUrl})._`);
    return lines.join("\n");
}
//# sourceMappingURL=comment.format.js.map
;// CONCATENATED MODULE: ../pr-renderer/dist/index.js

//# sourceMappingURL=index.js.map
;// CONCATENATED MODULE: ./src/comment.ts
// Sticky PR summary comment dispatch.
//
// D-81: find existing comment via STICKY_MARKER + identity check.
// D-83: silent on clean; update prior sticky to CLEAN_BODY when present.
// T-05-03-01: identity verification — c.user.login === BOT_LOGIN BEFORE editing.
// T-05-03-04: skip-with-warning on fork PRs (pull-requests:write unavailable).



async function postOrUpdateStickyComment(input) {
    if (input.eventName !== "pull_request")
        return;
    if (input.isFork) {
        core.warning("Skipping PR comment: pull-requests:write not available on fork PRs");
        return;
    }
    const pr = github.context.payload["pull_request"];
    if (pr === undefined || typeof pr.number !== "number")
        return;
    const issueNumber = pr.number;
    const token = process.env["GITHUB_TOKEN"];
    if (typeof token !== "string" || token.length === 0) {
        core.warning("Skipping PR comment: GITHUB_TOKEN not available");
        return;
    }
    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;
    const codeScanningUrl = `https://github.com/${owner}/${repo}/security/code-scanning?query=is%3Aopen+pr%3A${issueNumber}`;
    try {
        // T-05-03-03: per_page=100 cap. PRs with >100 comments may miss a prior
        // sticky → posts a duplicate. Acceptable; pathological case only.
        const { data: comments } = await octokit.rest.issues.listComments({
            owner,
            repo,
            issue_number: issueNumber,
            per_page: 100,
        });
        const existing = comments.find((c) => typeof c.body === "string" && c.body.includes(STICKY_MARKER) && c.user?.login === BOT_LOGIN);
        if (input.newFindings.length === 0) {
            if (existing !== undefined) {
                await octokit.rest.issues.updateComment({
                    owner,
                    repo,
                    comment_id: existing.id,
                    body: CLEAN_BODY,
                });
                core.info(`Updated sticky comment ${existing.id} to clean state`);
            }
            return;
        }
        const body = renderSummaryBody({
            newFindings: input.newFindings,
            findingsCount: input.findingsCount,
            codeScanningUrl,
        });
        if (existing !== undefined) {
            await octokit.rest.issues.updateComment({
                owner,
                repo,
                comment_id: existing.id,
                body,
            });
            core.info(`Updated sticky comment ${existing.id}`);
        }
        else {
            const { data } = await octokit.rest.issues.createComment({
                owner,
                repo,
                issue_number: issueNumber,
                body,
            });
            core.info(`Created sticky comment ${data.id}`);
        }
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        core.warning(`PR comment failed: ${msg}`);
    }
}


/***/ })

};

//# sourceMappingURL=242.index.js.map