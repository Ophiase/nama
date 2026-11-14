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
    npx tsc -p .
    command -v rumdl >/dev/null && rumdl check . || true

[group("dev")]
[doc("Run the project's and the portable checks over every changed file")]
[script("bash")]
guards:
    status=0
    for check in markdown french comment-slop short-names hardcoded-url portable biome file-length folder-size yaml-extension; do
        just _guard "$check" || status=1
    done
    exit $status

_guard check:
    @.agents/portable/checks/changed-files.sh | xargs -r -d '\n' .agents/checks/run.sh {{ check }}

[group("build")]
[doc("Bundle src/ into dist/main.js")]
build: check
    npx esbuild src/main.ts --bundle --format=cjs --platform=browser --target=es2022 \
      --external:obsidian --loader:.txt=text --outfile=dist/main.js

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

[group("release")]
[doc("The CHANGELOG.md section of a version, without its heading")]
notes version:
    @awk '/^## / { inside = ($2 == "{{ version }}"); next } inside' CHANGELOG.md

[group("release")]
[doc("Set the version in every manifest, commit and tag it; pushing the tag publishes a draft")]
[script("bash")]
release version:
    set -euo pipefail
    [[ "{{ version }}" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "a version is x.y.z, without v" >&2; exit 1; }
    [[ -z "$(git status --porcelain)" ]] || { echo "commit or stash first" >&2; exit 1; }
    [[ -n "$(just notes {{ version }})" ]] || { echo "CHANGELOG.md has no section {{ version }}" >&2; exit 1; }
    npm version "{{ version }}" --no-git-tag-version --allow-same-version >/dev/null
    node -e '
      const fs = require("node:fs");
      const read = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
      const write = (file, data) => fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
      const manifest = read("manifest.json");
      const versions = read("versions.json");
      manifest.version = process.argv[1];
      versions[manifest.version] = manifest.minAppVersion;
      write("manifest.json", manifest);
      write("versions.json", versions);
    ' "{{ version }}"
    just agent gate
    git add manifest.json versions.json package.json package-lock.json
    git diff --cached --quiet || git commit -q -m "release: {{ version }}"
    git tag -a "{{ version }}" -m "{{ version }}"
    echo "tagged {{ version }}: git push origin main {{ version }} publishes the draft release"
