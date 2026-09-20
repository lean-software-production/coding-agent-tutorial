#!/usr/bin/env bash
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
temp=$(mktemp -d)
trap 'rm -rf "$temp"' EXIT
mkdir -p "$temp/bin" "$temp/project/node_modules" "$temp/home/.pi/agent" "$temp/home/.codex"

stub() {
  cat >"$temp/bin/$1" <<EOF
#!/usr/bin/env bash
$2
EOF
  chmod +x "$temp/bin/$1"
}

stub node 'case "$1" in --version) echo v24.0.0;; *) exit 0;; esac'
stub npm 'case "$1" in --version) echo 11.0.0;; ls) exit 0;; *) exit 0;; esac'
stub git 'exit 0'
stub pi 'case "$1" in --version) echo pi-test;; config) exit 1;; *) exit 0;; esac'
stub claude 'case "$1" in --version) echo claude-test;; auth) exit 0;; config) exit 1;; *) exit 0;; esac'
stub codex 'case "$1" in --version) echo codex-test;; login) exit 0;; *) exit 0;; esac'
stub curl 'exit 0'
printf '{"provider":"configured"}\n' >"$temp/home/.pi/agent/auth.json"
printf 'model = "test-model"\n' >"$temp/home/.codex/config.toml"

env PATH="$temp/bin:$PATH" HOME="$temp/home" DOCTOR_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY=test-key \
  "$root/bin/doctor" --agent all --no-color >"$temp/all.out"
grep -q 'PASS  Ready' "$temp/all.out"
grep -q 'Codex model/default: test-model' "$temp/all.out"
if grep -q 'test-key' "$temp/all.out"; then
  echo 'doctor displayed a credential' >&2
  exit 1
fi

env PATH="$temp/bin:$PATH" HOME="$temp/home" DOCTOR_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY=test-key \
  "$root/bin/doctor" --agent all --live --no-color >"$temp/live.out"
grep -q 'one model request used' "$temp/live.out"

env PATH="$temp/bin:$PATH" HOME="$temp/home" DOCTOR_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY=test-key \
  "$root/setup" --check >"$temp/setup.out"
grep -q 'agent checks deferred to setup --check' "$temp/setup.out"

if env PATH="$temp/bin:$PATH" HOME="$temp/home" DOCTOR_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY=test-key \
  "$root/bin/doctor" --agent nope --no-color >"$temp/invalid.out" 2>&1; then
  echo 'invalid agent unexpectedly passed' >&2
  exit 1
fi
grep -q 'Unknown agent: nope' "$temp/invalid.out"

if env PATH="$temp/bin:$PATH" HOME="$temp/home" DOCTOR_PROJECT_ROOT="$temp/project" \
  "$root/bin/doctor" --agent pi --no-color >"$temp/key.out" 2>&1; then
  echo 'missing OpenRouter key unexpectedly passed' >&2
  exit 1
fi
grep -q 'OPENROUTER_API_KEY missing' "$temp/key.out"

rm "$temp/home/.pi/agent/auth.json"
if env PATH="$temp/bin:$PATH" HOME="$temp/home" DOCTOR_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY=test-key \
  "$root/bin/doctor" --agent pi --no-color >"$temp/pi.out" 2>&1; then
  echo 'unauthenticated selected Pi unexpectedly passed' >&2
  exit 1
fi
grep -q 'selected coaching harness (pi) is not configured' "$temp/pi.out"
