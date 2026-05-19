// Shared types for the GitHub Action.
// Mirrors Phase 4 D-59 JSON envelope (packages/cli/src/render/json.ts) as the wire
// format the Action parses from CLI stdout. Field names here MUST match the envelope
// emitted by `hookwarden scan --format json` byte-for-byte.
//
// ScanFinding + ScanFindingLocation are owned by @hookwarden/pr-renderer (the
// renderer is the only thing in the OSS repo that semantically depends on the
// finding shape). They're re-exported here so existing imports under
// "./types.js" keep working without touching every consumer file.
export {};
//# sourceMappingURL=types.js.map