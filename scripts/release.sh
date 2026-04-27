#!/usr/bin/env bash
# Release script for Blockish plugin.
# Usage: ./scripts/release.sh [version]
# Example: ./scripts/release.sh 1.2.0
# If version is omitted, reads current version from package.json.

set -e

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PLUGIN_DIR"

# ── Helpers ──────────────────────────────────────────────────────────────────
red()   { echo -e "\033[0;31m$*\033[0m"; }
green() { echo -e "\033[0;32m$*\033[0m"; }
yellow(){ echo -e "\033[0;33m$*\033[0m"; }
die()   { red "ERROR: $*"; exit 1; }

# ── Version ───────────────────────────────────────────────────────────────────
CURRENT_VERSION=$(node -p "require('./package.json').version" 2>/dev/null) \
  || die "Cannot read version from package.json"

NEW_VERSION="${1:-$CURRENT_VERSION}"

if [[ "$NEW_VERSION" != "$CURRENT_VERSION" ]]; then
  # Validate semver format
  [[ "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] \
    || die "Version must be in semver format (e.g. 1.2.0), got: $NEW_VERSION"
fi

yellow "==> Releasing version $NEW_VERSION"

# ── 1. Consistency check: all version strings must match NEW_VERSION ──────────
yellow "--> Checking version consistency..."

PHP_VERSION=$(grep -m1 '^ \* Version:' blockish.php | awk '{print $NF}')
README_VERSION=$(grep -m1 '^Version:' readme.txt | awk '{print $NF}' 2>/dev/null || echo "")
STABLE_TAG=$(grep -m1 '^Stable tag:' readme.txt | awk '{print $NF}')
PKG_VERSION=$(node -p "require('./package.json').version")

MISMATCH=0
check_version() {
  local label="$1" val="$2"
  if [[ "$val" != "$NEW_VERSION" ]]; then
    red "  ✗ $label = $val  (expected $NEW_VERSION)"
    MISMATCH=1
  else
    green "  ✓ $label = $val"
  fi
}

check_version "package.json"          "$PKG_VERSION"
check_version "blockish.php header"   "$PHP_VERSION"
check_version "readme.txt Stable tag:" "$STABLE_TAG"

[[ $MISMATCH -eq 0 ]] || die "Version mismatch detected. Fix all version strings before releasing."

# ── 2. Requires PHP consistency ──────────────────────────────────────────────
yellow "--> Checking Requires PHP consistency..."
PHP_HEADER_REQ=$(grep -m1 '^ \* Requires PHP:' blockish.php | awk '{print $NF}')
PHP_README_REQ=$(grep -m1 '^Requires PHP:' readme.txt | awk '{print $NF}')
if [[ "$PHP_HEADER_REQ" != "$PHP_README_REQ" ]]; then
  die "Requires PHP mismatch: plugin header=$PHP_HEADER_REQ, readme.txt=$PHP_README_REQ"
fi
green "  ✓ Requires PHP: $PHP_HEADER_REQ (consistent)"

# ── 3. Requires WP consistency ───────────────────────────────────────────────
yellow "--> Checking Requires at least consistency..."
WP_HEADER_REQ=$(grep -m1 '^ \* Requires at least:' blockish.php | awk '{print $NF}')
WP_README_REQ=$(grep -m1 '^Requires at least:' readme.txt | awk '{print $NF}')
if [[ "$WP_HEADER_REQ" != "$WP_README_REQ" ]]; then
  die "Requires at least mismatch: plugin header=$WP_HEADER_REQ, readme.txt=$WP_README_REQ"
fi
green "  ✓ Requires at least: $WP_HEADER_REQ (consistent)"

# ── 4. Changelog entry exists in readme.txt ──────────────────────────────────
yellow "--> Checking changelog entry..."
if ! grep -q "= $NEW_VERSION" readme.txt; then
  die "No changelog entry found for $NEW_VERSION in readme.txt. Add one before releasing."
fi
green "  ✓ Changelog entry for $NEW_VERSION found"

# ── 5. PHP syntax check ───────────────────────────────────────────────────────
yellow "--> PHP syntax check..."
php -l blockish.php > /dev/null || die "PHP syntax error in blockish.php"
find includes -name '*.php' -print0 | xargs -0 -n1 php -l > /dev/null \
  || die "PHP syntax error in includes/"
green "  ✓ All PHP files pass syntax check"

# ── 6. Build JS/CSS ───────────────────────────────────────────────────────────
yellow "--> Building assets (npm run build)..."
npm run build || die "npm build failed"
green "  ✓ Build complete"

# ── 7. Build zip ─────────────────────────────────────────────────────────────
yellow "--> Creating release zip..."
ZIP_FILE="blockish-v${NEW_VERSION}.zip"
rm -rf blockish "$ZIP_FILE"
rsync -a --exclude-from=.buildignore --exclude='scripts' . blockish
zip -qr "$ZIP_FILE" blockish
green "  ✓ Created: $ZIP_FILE ($(du -sh "$ZIP_FILE" | cut -f1))"
green "  ✓ Folder kept: blockish/ (inspect before shipping)"

# ── 8. Verify zip contents (spot-check) ──────────────────────────────────────
yellow "--> Verifying zip contents..."
ZIPLIST=$(unzip -l "$ZIP_FILE")

required_files=(
  "blockish/blockish.php"
  "blockish/readme.txt"
  "blockish/includes/Core/Blocks.php"
  "blockish/includes/Core/Enqueue.php"
  "blockish/build/"
)
for f in "${required_files[@]}"; do
  if echo "$ZIPLIST" | grep -q "$f"; then
    green "  ✓ $f"
  else
    die "Missing from zip: $f"
  fi
done

forbidden_patterns=("node_modules" "src/" ".claude/" ".ai/" "CLAUDE.md" "package.json" "package-lock.json")
for p in "${forbidden_patterns[@]}"; do
  if echo "$ZIPLIST" | grep -q "$p"; then
    die "Dev file leaked into zip: $p"
  fi
done
green "  ✓ No dev files in zip"

# ── Done ─────────────────────────────────────────────────────────────────────
echo ""
green "============================================"
green "  Release $NEW_VERSION is ready!"
green "  Zip: $ZIP_FILE"
green "============================================"
echo ""
yellow "Next step:"
echo "  Inspect the blockish/ folder, then run:"
echo ""
echo "  npm run ship"
