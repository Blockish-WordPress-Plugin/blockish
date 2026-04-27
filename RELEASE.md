# Release Instructions

This plugin releases from GitHub to WordPress.org SVN automatically when a Git tag is pushed.

On a successful deploy, the WordPress.org SVN repository receives the same production files in:

- `trunk/`
- `tags/{version}/`

Example: pushing Git tag `1.0.3` deploys production files to SVN `trunk/` and `tags/1.0.3/`.

## Safety Rule

WordPress.org deploy is the final workflow step. If version validation, dependency install, build, PHP syntax checks, or zip generation fails, the workflow stops and nothing is released to WordPress.org.

The deploy workflow uses `10up/action-wordpress-plugin-deploy`, which commits the tag contents (after `.distignore` exclusions) to both SVN `trunk` and the matching SVN version tag.

## Required Secrets

Add these in GitHub repository settings under Actions secrets:

- `SVN_USERNAME`
- `SVN_PASSWORD`

Use a WordPress.org SVN password (application password), not your normal account password.

## Release Checklist

### Step 1 — Update version strings (all 3 locations must match)

| File | Field |
|------|-------|
| `package.json` | `"version"` |
| `blockish.php` | `* Version:` |
| `readme.txt` | `Stable tag:` |

Also update `readme.txt` changelog:
```
= X.Y.Z [Day Month Year] =
* Added: ...
* Fixed: ...
```

### Step 2 — Local pre-flight (run this before any git commands)

```bash
npm run release
```

This script checks all version strings, `Requires PHP`, `Requires at least`, changelog entry, PHP syntax, builds assets, creates zip, and verifies zip contents. It will fail loudly if anything is wrong.

Inspect the generated `blockish/` folder to confirm the contents look right.

### Step 3 — Commit, tag, push

```bash
npm run ship
```

This prompts for confirmation, then runs:
```
git add -A
git commit -m "vX.Y.Z"
git tag vX.Y.Z
git push origin main
git push origin vX.Y.Z
```

The pushed tag triggers the WordPress.org deployment via GitHub Actions.

## Updating WordPress.org Assets (banner, icon, screenshots)

Assets live in `.wordpress-org/`. Add or update files there — no version bump needed.

```
.wordpress-org/
  icon-128x128.png
  icon-256x256.png
  banner-772x250.png
  banner-1544x500.png    ← retina, optional
  screenshot-1.png       ← matches == Screenshots == in readme.txt
  screenshot-2.png
```

Then just commit and push to `main`:

```bash
git add .wordpress-org/
git commit -m "Update WordPress.org assets"
git push origin main
```

GitHub Actions detects the `.wordpress-org/` change and deploys **only the assets** to SVN `assets/` automatically. No tag needed, no plugin release triggered.

---

### Step 4 — (Optional) GitHub Release

The deploy workflow creates a GitHub Release automatically from the changelog entry in `readme.txt`. If you need to do it manually:

```bash
gh release create v1.0.3 blockish-v1.0.3.zip \
  --title "Blockish 1.0.3" \
  --notes "See readme.txt for full changelog."
```

## Version Guard (in GitHub Actions)

The workflow rejects a deploy unless the Git tag matches both:

- `Version:` in `blockish.php`
- `Stable tag:` in `readme.txt`

## Version bump rules

| Change type | Example | When to use |
|-------------|---------|-------------|
| Patch | 1.0.3 → 1.0.4 | Bug fixes only |
| Minor | 1.0.3 → 1.1.0 | New features, backward compatible |
| Major | 1.x.x → 2.0.0 | Breaking changes |

## Files shipped to WordPress.org

Controlled by `.distignore`. These files/dirs are **excluded**:
`.git`, `.github`, `.ai`, `.claude`, `.distignore`, `.editorconfig`, `.gitignore`, `.gitattributes`, `.DS_Store`, `node_modules`, `package.json`, `package-lock.json`, `phpcs.xml`, `CLAUDE.md`, `RELEASE.md`, `scripts/`, `src/`, `*.zip`
