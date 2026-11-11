#!/usr/bin/env bash
# Usage: short-names.sh <file>...
# Reports single-letter names declared in JavaScript: a binding, an arrow
# parameter, a destructured key. Biome has no equivalent of clippy's
# min_ident_chars, so this is that lint. Exits 1 when it reports anything.
set -uo pipefail

checks=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

declared='(const|let|var|for \((const|let)) [A-Za-z_$]\b'
arrow='(^|[(,[:space:]])[A-Za-z_$] *(,[^()]*)?\) *=>|(^|[^.[:alnum:]_$])[A-Za-z_$] *=>'
destructured='(const|let|var|for \((const|let)) \[ *[A-Za-z_$] *[],]|, *[A-Za-z_$] *\] *(=|of)'

report=""
for file in "$@"; do
  [[ $file == *.js && -f $file ]] || continue
  "$checks/is-ignored.sh" short-names "$file" && continue
  hits=$(grep -nE "$declared|$arrow|$destructured" "$file")
  [[ -n $hits ]] && report+=$(printf '%s\n' "$hits" | sed "s|^|$file:|")$'\n'
done

[[ -z $report ]] && exit 0

printf 'Single-letter names:\n\n%s\n' "$report"
printf 'Name what it holds: `url` over `u`, `index` over `i`, `match` over `m`.\n'
exit 1
