#!/usr/bin/env bash
# Create a new project from this template, on this computer only.
# This script never contacts GitHub, Vercel or Supabase. The only network use is the optional
# app scaffold, which downloads from the npm registry (skip it with --skip-scaffold).
#
# Usage: bash scripts/new-project.sh <name> [--dry-run] [--skip-scaffold] [--in-place]
#   --dry-run        accepted for clarity; the script is always local
#   --skip-scaffold  do not generate the app (no download)
#   --in-place       specialise the current folder instead of copying (used after `gh repo create --template`)
# Set NEW_PROJECT_PARENT to choose where the copy is made (default: next to the template).
set -euo pipefail

usage() { echo "Usage: bash scripts/new-project.sh <name> [--dry-run] [--skip-scaffold] [--in-place]"; exit 2; }

NAME=""
SKIP_SCAFFOLD=0
IN_PLACE=0
for arg in "$@"; do
  case "$arg" in
    --dry-run) ;;
    --skip-scaffold) SKIP_SCAFFOLD=1 ;;
    --in-place) IN_PLACE=1 ;;
    -h|--help) usage ;;
    -*) echo "Unknown option: $arg"; usage ;;
    *) if [ -z "$NAME" ]; then NAME="$arg"; else usage; fi ;;
  esac
done
[ -n "$NAME" ] || usage
[[ "$NAME" =~ ^[a-z0-9][a-z0-9-]{1,50}$ ]] || { echo "The name must use lowercase letters, numbers and hyphens, 2 to 51 characters."; exit 2; }

TEMPLATE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ "$IN_PLACE" = 1 ]; then
  DEST="$PWD"
else
  DEST="${NEW_PROJECT_PARENT:-$(dirname "$TEMPLATE")}/$NAME"
  [ ! -e "$DEST" ] || { echo "$DEST already exists. Choose another name."; exit 1; }
  mkdir -p "$DEST"
  # Regular files and links only, so odd entries (devices, sockets) are never copied.
  SKIPPED=0
  while IFS= read -r -d '' file; do
    mkdir -p "$DEST/$(dirname "$file")"
    if ! cp -P "$TEMPLATE/$file" "$DEST/$file" 2>/dev/null; then SKIPPED=$((SKIPPED + 1)); fi
  done < <(cd "$TEMPLATE" && find . \( -type f -o -type l \) \
    -not -path './.git/*' -not -path './node_modules/*' -not -path './BOOTSTRAP.md' \
    -not -path './.claude/settings.local.json' -not -path './.claude/.cc-writes/*' \
    -not -path './docs/file-plan.md' -print0)
  [ "$SKIPPED" = 0 ] || echo "Note: skipped $SKIPPED unreadable entries in the template."
fi

cd "$DEST"
grep -q '^is_template: true' project.config.yaml || [ "$IN_PLACE" = 1 ] || { echo "This does not look like the template (is_template is not true)."; exit 1; }
rm -f BOOTSTRAP.md docs/file-plan.md

# --- Specialise the copy ---------------------------------------------------------------
sed -i 's/^is_template: true.*/is_template: false/' project.config.yaml
PROFILE="$(sed -n 's/^stack_profile: *\([a-z0-9-]*\).*/\1/p' project.config.yaml | head -1)"
PFILE="profiles/${PROFILE}.yaml"
[ -f "$PFILE" ] || { echo "No stack profile file at $PFILE"; exit 1; }

# Read a two-space-indented "key: value" block (like "scripts:") from the profile.
profile_block() { awk -v b="$1" '$0 ~ "^"b":"{f=1;next} /^[^ #]/{f=0} f && /^  [A-Za-z0-9_-]+:/{print}' "$PFILE"; }
script_for() { profile_block scripts | sed -n "s/^  $1: *//p" | head -1; }

fill() { sed -i "s|{{$1}}|$2|g" CLAUDE.md; }
fill INSTALL "npm install"
for pair in TYPECHECK:typecheck LINT:lint TEST:test BUILD:build A11Y:a11y DEV:dev; do
  key="${pair#*:}"
  if [ -n "$(script_for "$key")" ]; then fill "${pair%%:*}" "npm run $key"; else fill "${pair%%:*}" "not defined for this profile"; fi
done
sed -i "1s/.*/# $NAME/" CLAUDE.md
sed -i "s|^Reusable starting point.*|Project created from the product template on $(date +%F). Edit this file for this product only.|" CLAUDE.md

printf '# Decisions log\n\nFormat: date, decision, reason, source.\n\n| Date | Decision | Reason | Source |\n|---|---|---|---|\n' > docs/decisions.md
printf '# Open questions\n\nFormat: ID, question, why it matters, status.\n' > docs/open-questions.md

if [ "$IN_PLACE" = 0 ]; then
  git init -q -b main
  git add -A
  GIT_AUTHOR_NAME="${GIT_AUTHOR_NAME:-product-template}" GIT_AUTHOR_EMAIL="${GIT_AUTHOR_EMAIL:-template@example.invalid}" \
  GIT_COMMITTER_NAME="${GIT_COMMITTER_NAME:-product-template}" GIT_COMMITTER_EMAIL="${GIT_COMMITTER_EMAIL:-template@example.invalid}" \
    git commit -q -m "chore: create $NAME from product template"
fi

# --- App scaffold (network: npm registry) ----------------------------------------------
if [ "$SKIP_SCAFFOLD" = 0 ]; then
  CMD="$(awk '/^  command: >-/{f=1;next} f && /^    /{sub(/^ +/,"");printf "%s ",$0;next} f{exit}' "$PFILE")"
  [ -n "$CMD" ] || { echo "No scaffold command in $PFILE"; exit 1; }
  CMD="${CMD//\{\{NAME\}\}/app}"
  TMP="$(mktemp -d)"
  (cd "$TMP" && bash -c "$CMD")
  cp -rn "$TMP/app/." "$DEST/"
  rm -rf "$TMP"
  profile_block scripts | while IFS= read -r line; do
    key="$(echo "${line%%:*}" | tr -d ' ')"
    npm pkg set "scripts.$key=${line#*: }" >/dev/null
  done
  npm pkg set "name=$NAME" >/dev/null
  DEPS="$(awk '/^  dev_dependencies:/{f=1;next} f && /^    - /{gsub(/^    - /,"");gsub(/"/,"");printf "%s ",$0;next} f{exit}' "$PFILE")"
  # shellcheck disable=SC2086
  [ -z "$DEPS" ] || npm install --save-dev $DEPS
fi

echo
echo "Created $NAME at $DEST"
[ "$SKIP_SCAFFOLD" = 1 ] && echo "The app scaffold was skipped. Run without --skip-scaffold to generate it."
echo "Next: open that folder in VS Code, start Claude Code there, and run /discover or /spec."
