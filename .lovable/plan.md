# Plan: Remove lovable-tagger from package.json

## What

Remove the single remaining `lovable-tagger` line from `package.json` devDependencies (line 105). Lockfiles (`bun.lock`, `package-lock.json`) are auto-managed by Lovable's build system and cannot be manually edited.

## Operations


| #   | File                    | Change                                |
| --- | ----------------------- | ------------------------------------- |
| 1   | `package.json` line 105 | Delete `"lovable-tagger": "^1.1.11",` |


## Verification

- Confirm no `lovable-tagger` in package.json
- Confirm no `componentTagger` import anywhere (already verified clean in vite.config.ts)
- Run build to confirm clean output

**Total: 1 line removed, 1 file edited**  
  
NOTE — PERSISTENCE CHECK

After applying the change, monitor whether Lovable re-injects "lovable-tagger" in package.json during future builds or sync.

If it reappears:

- Report as platform constraint

- Do not repeatedly remove without confirmation