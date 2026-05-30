export const id = 614;
export const ids = [614];
export const modules = {

/***/ 5614:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   uploadSarif: () => (/* binding */ uploadSarif)
/* harmony export */ });
/* harmony import */ var node_fs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(3024);
/* harmony import */ var node_fs__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(node_fs__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var node_zlib__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(8522);
/* harmony import */ var node_zlib__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(node_zlib__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _actions_core__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9038);
/* harmony import */ var _actions_github__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(5843);
// SARIF upload to GitHub Code Scanning.
//
// ACTION-03: POST /repos/{owner}/{repo}/code-scanning/sarifs with gzip+base64 body.
// ACTION-01 + Phase 4 D-60: the Action does NOT regenerate SARIF — it uploads the
// file the bundled CLI already wrote. The CLI's SARIF renderer (Plan 04-08) is the
// byte-stable, OASIS-validated source of truth.
//
// D-89 explicit non-permission: this module does NOT need 'checks: write'. The
// failed-check semantics flow from the CLI's exit code 1 through core.setFailed
// (Plan 02 src/index.ts), not through this upload's success/failure.
//
// T-05-04-01: fork-PR EoP defense — short-circuit before the Octokit call. Defense
// in depth alongside the index.ts call-site guard.




async function uploadSarif(input) {
    if (input.isFork) {
        _actions_core__WEBPACK_IMPORTED_MODULE_2__/* .warning */ .$e("Skipping SARIF upload: security-events: write not available on fork PRs");
        return;
    }
    if (!(0,node_fs__WEBPACK_IMPORTED_MODULE_0__.existsSync)(input.sarifPath)) {
        _actions_core__WEBPACK_IMPORTED_MODULE_2__/* .warning */ .$e(`Skipping SARIF upload: file not found at ${input.sarifPath}`);
        return;
    }
    const token = process.env["GITHUB_TOKEN"];
    if (typeof token !== "string" || token.length === 0) {
        _actions_core__WEBPACK_IMPORTED_MODULE_2__/* .warning */ .$e("Skipping SARIF upload: GITHUB_TOKEN not available (require security-events: write in workflow permissions)");
        return;
    }
    // T-05-04-03: SARIF written by trusted CLI to RUNNER_TEMP a few hundred ms ago;
    // no untrusted writers on the runner between write and read.
    const sarifJson = (0,node_fs__WEBPACK_IMPORTED_MODULE_0__.readFileSync)(input.sarifPath, "utf8");
    const compressed = (0,node_zlib__WEBPACK_IMPORTED_MODULE_1__.gzipSync)(Buffer.from(sarifJson));
    const sarif = compressed.toString("base64");
    const octokit = _actions_github__WEBPACK_IMPORTED_MODULE_3__/* .getOctokit */ .Q(token);
    const { owner, repo } = _actions_github__WEBPACK_IMPORTED_MODULE_3__/* .context */ ._.repo;
    const pr = _actions_github__WEBPACK_IMPORTED_MODULE_3__/* .context */ ._.payload["pull_request"];
    const commitSha = pr?.head.sha ?? _actions_github__WEBPACK_IMPORTED_MODULE_3__/* .context */ ._.sha;
    const ref = pr !== undefined && typeof pr.number === "number"
        ? `refs/pull/${pr.number}/head`
        : _actions_github__WEBPACK_IMPORTED_MODULE_3__/* .context */ ._.ref;
    try {
        const { data } = await octokit.rest.codeScanning.uploadSarif({
            owner,
            repo,
            commit_sha: commitSha,
            ref,
            sarif,
            tool_name: "hookwarden",
        });
        const id = data.id ?? "<no-id>";
        _actions_core__WEBPACK_IMPORTED_MODULE_2__/* .info */ .pq(`SARIF upload accepted: ${id}`);
    }
    catch (err) {
        // Never throw — Plan 02's index.ts already drives ACTION-04 from the scan exit
        // code. Upload failure is degraded UX, not a build failure.
        const status = err.status;
        const msg = err instanceof Error ? err.message : String(err);
        if (status === 403) {
            _actions_core__WEBPACK_IMPORTED_MODULE_2__/* .warning */ .$e("Skipping SARIF upload: security-events: write not available (likely fork PR or missing workflow permissions)");
        }
        else {
            _actions_core__WEBPACK_IMPORTED_MODULE_2__/* .warning */ .$e(`SARIF upload failed: ${msg}`);
        }
    }
}


/***/ })

};

//# sourceMappingURL=614.index.js.map