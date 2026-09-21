#!/usr/bin/env bash
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
temp=$(mktemp -d)
trap 'rm -rf "$temp"' EXIT
mkdir -p "$temp/bin" "$temp/project/node_modules" "$temp/home/.pi/agent" "$temp/home/.codex"

stub() {
  cat >"$temp/bin/$1" <<STUB
#!/usr/bin/env bash
$2
STUB
  chmod +x "$temp/bin/$1"
}

run_setup() {
  env PATH="$temp/bin:/usr/bin:/bin" HOME="$temp/home" SETUP_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY=test-key \
    PI_AUTH_STATE="${PI_AUTH_STATE:-}" ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}" PI_CODING_AGENT_DIR="${PI_CODING_AGENT_DIR:-}" \
    "$root/bin/setup" --check "$@"
}

real_node=$(command -v node)
stub node 'case "$1" in --version) echo v24.0.0;; *) exec '"$real_node"' "$@";; esac'
stub npm 'case "$1" in --version) echo 11.0.0;; ls) exit 0;; *) exit 0;; esac'
stub git 'exit 0'
stub pi '
case "$1" in
  --version) echo pi-test ;;
  auth)
    provider=""
    while [ $# -gt 0 ]; do
      [ "$1" = --provider ] && provider=$2
      shift
    done
    case "${PI_AUTH_STATE:-ready}" in
      ready) printf "{\"status\":\"valid\"}\n"; exit 0 ;;
      anthropic-only) [ "$provider" = anthropic ] ;;
      xai-only) [ "$provider" = xai ] ;;
      stale|unknown) printf "{\"status\":\"invalid\"}\n"; exit 1 ;;
    esac ;;
esac'
stub claude 'case "$1" in --version) echo claude-test;; auth) [ "${CLAUDE_AUTH_STATE:-missing}" = ready ];; *) exit 0;; esac'
stub codex 'case "$1" in --version) echo codex-test;; login) [ "${CODEX_AUTH_STATE:-missing}" = ready ];; *) exit 0;; esac'
stub curl 'exit 0'
printf '{"openai-codex":{"access":"not-a-real-secret"}}\n' >"$temp/home/.pi/agent/auth.json"
printf '{"defaultModel":"openai-codex/gpt-test"}\n' >"$temp/home/.pi/agent/settings.json"
printf 'model = "test-model"\n' >"$temp/home/.codex/config.toml"

# One authenticated harness is enough by default, and credentials stay hidden.
run_setup --no-color >"$temp/default.out"
grep -q 'PASS  Ready' "$temp/default.out"
grep -q 'WARN  Claude Code authentication missing' "$temp/default.out"
grep -q 'WARN  Codex authentication missing' "$temp/default.out"
grep -q 'Pi authentication configured for openai-codex' "$temp/default.out"
if grep -Eq 'test-key|not-a-real-secret' "$temp/default.out"; then
  echo 'setup displayed a credential' >&2
  exit 1
fi

# Normal setup also succeeds without prompting when everything is configured.
env PATH="$temp/bin:/usr/bin:/bin" HOME="$temp/home" SETUP_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY=test-key \
  "$root/bin/setup" --agent pi --no-color >"$temp/normal.out"
grep -q 'PASS  Ready' "$temp/normal.out"

# Explicit harness selection is strict.
if run_setup --agent all --no-color >"$temp/all.out" 2>&1; then
  echo 'explicit all unexpectedly passed' >&2
  exit 1
fi
grep -q 'all selected coding harnesses must be configured' "$temp/all.out"
run_setup --agent pi --no-color >"$temp/pi-ready.out"
if run_setup --agent claude --no-color >"$temp/claude.out" 2>&1; then
  echo 'unauthenticated selected Claude unexpectedly passed' >&2
  exit 1
fi
grep -q 'run: claude auth login' "$temp/claude.out"

# Pi uses its native authentication check rather than trusting an auth file.
if PI_AUTH_STATE=stale run_setup --agent pi --no-color >"$temp/pi-stale.out" 2>&1; then
  echo 'stale Pi authentication unexpectedly passed' >&2
  exit 1
fi
grep -q 'Pi authentication missing or invalid' "$temp/pi-stale.out"

# Environment-only authentication can supply a provider candidate.
mv "$temp/home/.pi/agent/auth.json" "$temp/home/.pi/agent/auth.saved"
mv "$temp/home/.pi/agent/settings.json" "$temp/home/.pi/agent/settings.saved"
ANTHROPIC_API_KEY=anthropic-env-secret PI_AUTH_STATE=anthropic-only run_setup --agent pi --no-color >"$temp/pi-env.out"
grep -q 'configured for anthropic' "$temp/pi-env.out"
if grep -q 'anthropic-env-secret' "$temp/pi-env.out"; then
  echo 'setup displayed an environment credential' >&2
  exit 1
fi
mv "$temp/home/.pi/agent/auth.saved" "$temp/home/.pi/agent/auth.json"
mv "$temp/home/.pi/agent/settings.saved" "$temp/home/.pi/agent/settings.json"

# PI_CODING_AGENT_DIR takes precedence over ~/.pi/agent.
mkdir -p "$temp/alternate"
printf '{"xai":{"access":"alternate-secret"}}\n' >"$temp/alternate/auth.json"
printf '{"defaultProvider":"xai"}\n' >"$temp/alternate/settings.json"
PI_CODING_AGENT_DIR="$temp/alternate" PI_AUTH_STATE=xai-only run_setup --agent pi --no-color >"$temp/pi-dir.out"
grep -q 'configured for xai' "$temp/pi-dir.out"
if grep -q 'alternate-secret' "$temp/pi-dir.out"; then
  echo 'setup displayed an overridden-directory credential' >&2
  exit 1
fi

# Missing optional harnesses warn by default but fail when explicitly selected.
mv "$temp/bin/codex" "$temp/bin/codex.off"
run_setup --no-color >"$temp/missing-default.out"
grep -q 'WARN  Codex not installed' "$temp/missing-default.out"
if run_setup --agent codex --no-color >"$temp/missing-explicit.out" 2>&1; then
  echo 'explicit missing Codex unexpectedly passed' >&2
  exit 1
fi
grep -q 'selected coding harness (codex) is not configured' "$temp/missing-explicit.out"
mv "$temp/bin/codex.off" "$temp/bin/codex"

# Check mode reports a missing application key without prompting.
if env PATH="$temp/bin:/usr/bin:/bin" HOME="$temp/home" SETUP_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY= \
  "$root/bin/setup" --check --agent pi --no-color >"$temp/no-key.out" 2>&1; then
  echo 'missing OpenRouter key unexpectedly passed' >&2
  exit 1
fi
grep -q 'OPENROUTER_API_KEY missing — run bin/setup' "$temp/no-key.out"

# Options that need values fail clearly rather than looping.
if "$root/bin/setup" --agent >"$temp/missing-agent.out" 2>&1; then
  echo 'missing --agent value unexpectedly passed' >&2
  exit 1
fi
grep -q -- '--agent needs pi, claude, codex, or all' "$temp/missing-agent.out"

run_setup --agent pi --live --no-color >"$temp/live.out"
grep -q 'one model request used' "$temp/live.out"
grep -qx '@AGENTS.md' "$root/CLAUDE.md"
