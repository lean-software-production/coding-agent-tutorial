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

run_doctor() {
  env PATH="$temp/bin:/usr/bin:/bin" HOME="$temp/home" DOCTOR_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY=test-key "$root/bin/doctor" "$@"
}

real_node=$(command -v node)
stub node 'case "$1" in --version) echo v24.0.0;; *) exec '"$real_node"' "$@";; esac'
stub npm 'case "$1" in --version) echo 11.0.0;; ls) exit 0;; *) exit 0;; esac'
stub git 'exit 0'
stub pi '
case "$1" in
  --version) echo pi-test ;;
  auth)
    case "${PI_AUTH_STATE:-ready}" in
      ready) printf "{\\"status\\":\\"valid\\"}\\n"; exit 0 ;;
      stale|unknown) printf "{\\"status\\":\\"invalid\\"}\\n"; exit 1 ;;
    esac ;;
esac'
stub claude 'case "$1" in --version) echo claude-test;; auth) [ "${CLAUDE_AUTH_STATE:-missing}" = ready ];; *) exit 0;; esac'
stub codex 'case "$1" in --version) echo codex-test;; login) [ "${CODEX_AUTH_STATE:-missing}" = ready ];; *) exit 0;; esac'
stub curl 'exit 0'
printf '{"openai-codex":{"access":"not-a-real-secret"}}\n' >"$temp/home/.pi/agent/auth.json"
printf '{"defaultModel":"openai-codex/gpt-test"}\n' >"$temp/home/.pi/agent/settings.json"
printf 'model = "test-model"\n' >"$temp/home/.codex/config.toml"

# Default reports all, accepts one ready harness, and does not expose the key.
run_doctor --no-color >"$temp/default.out"
grep -q 'PASS  Ready' "$temp/default.out"
grep -q 'WARN  Claude Code provider authentication missing' "$temp/default.out"
grep -q 'WARN  Codex provider authentication missing' "$temp/default.out"
grep -q 'Pi provider authentication configured for openai-codex' "$temp/default.out"
if grep -Eq 'test-key|not-a-real-secret' "$temp/default.out"; then
  echo 'doctor displayed a credential' >&2
  exit 1
fi

# Explicit selection is strict.
if run_doctor --agent all --no-color >"$temp/all.out" 2>&1; then
  echo 'explicit all unexpectedly passed' >&2
  exit 1
fi
grep -q 'all selected coaching harnesses must be configured' "$temp/all.out"
run_doctor --agent pi --no-color >"$temp/pi-ready.out"
if run_doctor --agent claude --no-color >"$temp/claude.out" 2>&1; then
  echo 'unauthenticated selected Claude unexpectedly passed' >&2
  exit 1
fi
grep -q 'run: claude auth login' "$temp/claude.out"

# Pi's native check rejects stale and unknown providers despite an auth file.
if PI_AUTH_STATE=stale run_doctor --agent pi --no-color >"$temp/pi-stale.out" 2>&1; then
  echo 'stale Pi authentication unexpectedly passed' >&2
  exit 1
fi
grep -q 'Pi provider authentication missing or invalid' "$temp/pi-stale.out"
if PI_AUTH_STATE=unknown run_doctor --agent pi --no-color >"$temp/pi-unknown.out" 2>&1; then
  echo 'unknown Pi provider unexpectedly passed' >&2
  exit 1
fi
grep -q 'Pi provider authentication missing or invalid' "$temp/pi-unknown.out"

# Missing executables always fail, even with the implicit default policy.
mv "$temp/bin/codex" "$temp/bin/codex.off"
if run_doctor --no-color >"$temp/missing.out" 2>&1; then
  echo 'missing Codex unexpectedly passed' >&2
  exit 1
fi
grep -q 'Codex not installed' "$temp/missing.out"
mv "$temp/bin/codex.off" "$temp/bin/codex"

# setup --check keeps its project-and-application-only contract.
env PATH="$temp/bin:/usr/bin:/bin" HOME="$temp/home" DOCTOR_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY=test-key \
  "$root/setup" --check >"$temp/setup.out"
grep -q 'agent checks deferred to setup --check' "$temp/setup.out"

run_doctor --agent pi --live --no-color >"$temp/live.out"
grep -q 'one model request used' "$temp/live.out"
grep -qx '@AGENTS.md' "$root/CLAUDE.md"
