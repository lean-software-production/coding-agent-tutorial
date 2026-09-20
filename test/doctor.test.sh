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
  env PATH="$temp/bin:/usr/bin:/bin" HOME="$temp/home" DOCTOR_PROJECT_ROOT="$temp/project" OPENROUTER_API_KEY=test-key \
    PI_AUTH_STATE="${PI_AUTH_STATE:-}" ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-}" PI_CODING_AGENT_DIR="${PI_CODING_AGENT_DIR:-}" \
    "$root/bin/doctor" "$@"
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
      ready) printf "{\\"status\\":\\"valid\\"}\\n"; exit 0 ;;
      anthropic-only) [ "$provider" = anthropic ] ;;
      xai-only) [ "$provider" = xai ] ;;
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

# Environment-only auth is a candidate, but Pi's native check still decides it.
mv "$temp/home/.pi/agent/auth.json" "$temp/home/.pi/agent/auth.saved"
mv "$temp/home/.pi/agent/settings.json" "$temp/home/.pi/agent/settings.saved"
if ! ANTHROPIC_API_KEY=anthropic-env-secret PI_AUTH_STATE=anthropic-only run_doctor --agent pi --no-color >"$temp/pi-env.out"; then
  echo 'environment-only Pi authentication unexpectedly failed' >&2
  exit 1
fi
grep -q 'configured for anthropic' "$temp/pi-env.out"
if grep -q 'anthropic-env-secret' "$temp/pi-env.out"; then
  echo 'doctor displayed an environment credential' >&2
  exit 1
fi
mv "$temp/home/.pi/agent/auth.saved" "$temp/home/.pi/agent/auth.json"
mv "$temp/home/.pi/agent/settings.saved" "$temp/home/.pi/agent/settings.json"

# Unknown or ambiguous stored candidates do not pass without native validation.
printf '{"mystery":{"access":"unknown-secret"}}\n' >"$temp/home/.pi/agent/auth.json"
printf '{"defaultProvider":"also-mystery","defaultModel":"not-qualified"}\n' >"$temp/home/.pi/agent/settings.json"
if PI_AUTH_STATE=unknown run_doctor --agent pi --no-color >"$temp/pi-ambiguous.out" 2>&1; then
  echo 'unknown stored Pi candidates unexpectedly passed' >&2
  exit 1
fi
grep -q 'configured provider(s): also-mystery mystery openrouter' "$temp/pi-ambiguous.out"
if grep -q 'unknown-secret' "$temp/pi-ambiguous.out"; then
  echo 'doctor displayed an unknown-provider credential' >&2
  exit 1
fi

# PI_CODING_AGENT_DIR takes precedence over ~/.pi/agent.
mkdir -p "$temp/alternate"
printf '{"xai":{"access":"alternate-secret"}}\n' >"$temp/alternate/auth.json"
printf '{"defaultProvider":"xai"}\n' >"$temp/alternate/settings.json"
if ! PI_CODING_AGENT_DIR="$temp/alternate" PI_AUTH_STATE=xai-only run_doctor --agent pi --no-color >"$temp/pi-dir.out"; then
  echo 'Pi authentication in PI_CODING_AGENT_DIR unexpectedly failed' >&2
  exit 1
fi
grep -q 'configured for xai' "$temp/pi-dir.out"
if grep -q 'alternate-secret' "$temp/pi-dir.out"; then
  echo 'doctor displayed an overridden-directory credential' >&2
  exit 1
fi

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
