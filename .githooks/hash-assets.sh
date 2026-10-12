#!/bin/sh
# BrainRush - cache busting for JS/CSS (Hostinger caches them for 7 days).
# Renames every tracked js/*.js and css/*.css to <name>.<hash>.<ext>, where
# <hash> is the first 8 characters of the file's staged git blob id, and
# rewrites the references in every tracked *.html. A changed file therefore
# gets a new URL; unchanged files keep theirs. Runs from the pre-commit hook
# (git config core.hooksPath .githooks); safe to run by hand, idempotent.

cd "$(git rev-parse --show-toplevel)" || exit 1

git ls-files -- 'js/*.js' 'css/*.css' | while IFS= read -r old; do
  [ -f "$old" ] || continue
  hash=$(git ls-files -s -- "$old" | cut -d' ' -f2 | cut -c1-8)
  [ -n "$hash" ] || continue
  ext=${old##*.}
  base=$(printf '%s\n' "${old%.*}" | sed 's/\.[0-9a-f]\{8\}$//')
  new="$base.$hash.$ext"
  [ "$old" = "$new" ] && continue

  git mv -- "$old" "$new" || exit 1
  # Asset paths only contain [A-Za-z0-9._/-], so escaping the dots is enough.
  pattern=$(printf '%s\n' "$old" | sed 's/\./\\./g')
  git ls-files -- '*.html' | while IFS= read -r html; do
    if grep -q -F -- "$old" "$html"; then
      sed -i "s|$pattern|$new|g" "$html"
      git add -- "$html"
    fi
  done
  echo "hash-assets: $old -> $new"
done
