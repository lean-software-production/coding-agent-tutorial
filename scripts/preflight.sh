#!/bin/sh
# Checks you have everything this tutorial needs. Run it with: sh scripts/preflight.sh
# It is plain shell on purpose: it must work before Node.js is installed.

ok=true
pass() { printf '  ok       %s\n' "$1"; }
fail() { printf '  MISSING  %s\n' "$1"; ok=false; }

if command -v node >/dev/null 2>&1; then
  version=$(node --version)
  major=${version#v}; major=${major%%.*}
  if [ "$major" -ge 24 ]; then
    pass "Node.js $version"
  else
    fail "Node.js 24 or newer (you have $version) - https://nodejs.org"
  fi
else
  fail "Node.js - install it from https://nodejs.org (npm comes with it)"
fi

if command -v npm >/dev/null 2>&1; then
  pass "npm $(npm --version)"
else
  fail "npm - it normally comes with Node.js"
fi

if command -v git >/dev/null 2>&1; then
  pass "git"
else
  fail "git - https://git-scm.com"
fi

if [ -d node_modules ]; then
  pass "dependencies installed"
else
  fail "dependencies - run: npm install"
fi

key=${OPENROUTER_API_KEY:-$(sed -n 's/^OPENROUTER_API_KEY=//p' .env 2>/dev/null)}
if [ -n "$key" ] && [ "$key" != "your-key" ]; then
  pass "OPENROUTER_API_KEY"
else
  fail "OPENROUTER_API_KEY - see \"Don't have an API key yet?\" in README.md"
fi

if $ok; then
  echo "All good. Fire up your coding agent and say \"coach me\"."
else
  echo "Fix the MISSING items above, then run this again."
  exit 1
fi
