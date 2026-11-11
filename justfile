set dotenv-load := true

mod agent

vault := env("NAMA_VAULT", "")

default:
    @just --list --list-submodules

[group("dev")]
[doc("Install the toolchain")]
setup:
    npm ci || npm install

[group("dev")]
[doc("Format and lint, fixing what can be fixed")]
fmt:
    npx biome check --write .

[group("dev")]
[doc("Everything that must pass before declaring work done")]
check:
    npx biome check .
    command -v rumdl >/dev/null && rumdl check . || true

[group("dev")]
[doc("Run the project's and the portable checks over every changed file")]
[script("bash")]
guards:
    status=0
    for check in markdown french comment-slop hardcoded-url portable biome file-length folder-size yaml-extension; do
        just _guard "$check" || status=1
    done
    exit $status

_guard check:
    @.agents/portable/checks/changed-files.sh | xargs -r -d '\n' .agents/checks/run.sh {{ check }}

[group("build")]
[doc("Bundle src/ into dist/main.js")]
build: check
    npx esbuild src/main.js --bundle --format=cjs --platform=browser --target=es2022 \
      --external:obsidian --outfile=dist/main.js

[group("build")]
[doc("Copy the build into $NAMA_VAULT/.obsidian/plugins/nama")]
[script("bash")]
install: build
    set -euo pipefail
    [[ -n "{{ vault }}" ]] || { echo "NAMA_VAULT is not set: copy .env.example to .env" >&2; exit 1; }
    [[ -d "{{ vault }}/.obsidian" ]] || { echo "NAMA_VAULT holds no .obsidian" >&2; exit 1; }
    target="{{ vault }}/.obsidian/plugins/nama"
    mkdir -p "$target"
    cp dist/main.js manifest.json "$target/"
    echo "installed: reload Obsidian"
