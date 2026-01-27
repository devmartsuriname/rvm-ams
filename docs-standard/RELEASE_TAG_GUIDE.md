# Release Tag Guide

> **Purpose**: Document the release tagging process for the Devmart Darkone Admin Standard baseline.

---

## Recommended Tag

| Property | Value |
|----------|-------|
| **Tag Name** | `darkone-admin-standard-v1.0` |
| **Type** | Annotated tag |
| **Represents** | First standardized baseline of Devmart Darkone Admin |

---

## What This Tag Represents

The `darkone-admin-standard-v1.0` tag marks the completion of the full standardization process:

- **Clean Baseline**: All demo content removed except dashboard reference
- **Simplified Navigation**: Dashboard + Authentication only
- **Placeholder Routes**: All other admin routes display "Coming Soon"
- **Working Auth Flow**: Login → Dashboard flow is fully functional
- **Complete Documentation**: README, Asset Map, and workflow docs in place
- **Guardian Rules Established**: Clear boundaries for future customization

---

## Preconditions Checklist

Before creating the release tag, verify all items are complete:

### Phase Completion
- [ ] Phase 1 (Codebase Analysis) complete
- [ ] Phase 2 (Asset Governance) complete
- [ ] Phase 3 (Cleanup & Simplification) complete
- [ ] Phase 4 (README & Documentation) complete
- [ ] Phase 5 (Release/Clone Workflow) complete

### Functional Verification
- [ ] Authentication flow works end-to-end (Login → Dashboard)
- [ ] Dashboard displays correctly with all charts and widgets
- [ ] Navigation shows only Dashboard + Authentication links
- [ ] All other admin routes display "Coming Soon" placeholder
- [ ] No console errors in browser developer tools
- [ ] Application builds successfully (`npm run build`)

### Documentation Verification
- [ ] `/README.md` is complete and accurate
- [ ] `/DARKONE_ASSET_MAP.md` exists and is current
- [ ] `/docs-standard/DARKONE_STANDARDIZATION_PLAN.md` exists
- [ ] `/docs-standard/DARKONE_STANDARDIZATION_TASKS.md` exists
- [ ] `/docs-standard/CLONE_WORKFLOW.md` exists
- [ ] `/archive/README.md` documents legacy folder

---

## Git Commands

> **Note**: These are documentation commands for reference. Execute them only when all preconditions are verified.

### Create and Push Tag

```sh
# Ensure you're on the main branch with latest changes
git checkout main
git pull origin main

# Verify working directory is clean
git status

# Create annotated tag with message
git tag -a darkone-admin-standard-v1.0 -m "Standardized Darkone Admin baseline v1.0"

# Push tag to remote repository
git push origin darkone-admin-standard-v1.0
```

### Verify Tag

```sh
# List all darkone-admin-standard tags
git tag -l "darkone-admin-standard-*"

# Show tag details
git show darkone-admin-standard-v1.0

# Verify tag exists on remote
git ls-remote --tags origin | grep darkone-admin-standard
```

### Clone from Tag (for verification)

```sh
# Clone specific tag to verify it works
git clone --branch darkone-admin-standard-v1.0 <REPO_HTTPS_URL> test-clone

# Verify the clone
cd test-clone
npm install
npm run dev
```

---

## Tag Versioning Convention

### Format

```
darkone-admin-standard-vX.Y
```

| Component | Meaning | When to Increment |
|-----------|---------|-------------------|
| **X** (Major) | Breaking changes | Structure changes, removed features, incompatible updates |
| **Y** (Minor) | Non-breaking updates | Documentation updates, bug fixes, safe improvements |

### Examples

| Tag | Description |
|-----|-------------|
| `darkone-admin-standard-v1.0` | Initial standardized baseline |
| `darkone-admin-standard-v1.1` | Documentation improvements |
| `darkone-admin-standard-v1.2` | Minor bug fixes |
| `darkone-admin-standard-v2.0` | Major structure change (breaking) |

---

## Post-Tag Actions

After successfully creating and pushing the tag:

1. **Verify Remote**: Confirm tag appears in GitHub/GitLab releases
2. **Document**: Note the tag creation in project records
3. **Communicate**: Inform team the baseline is ready for cloning
4. **Archive**: This tag becomes the reference point for all new projects

---

## Troubleshooting

### Tag Already Exists

```sh
# Delete local tag
git tag -d darkone-admin-standard-v1.0

# Delete remote tag (use with caution)
git push origin --delete darkone-admin-standard-v1.0

# Recreate tag
git tag -a darkone-admin-standard-v1.0 -m "Standardized Darkone Admin baseline v1.0"
git push origin darkone-admin-standard-v1.0
```

### Verify Tag Points to Correct Commit

```sh
# Show commit the tag points to
git rev-list -n 1 darkone-admin-standard-v1.0

# Compare with current HEAD
git rev-parse HEAD
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [Clone Workflow](./CLONE_WORKFLOW.md) | How to use this tag for new projects |
| [README](../README.md) | Project overview and usage |
| [Asset Map](../DARKONE_ASSET_MAP.md) | Complete asset inventory |
