#!/usr/bin/env bash
set -eu

config_dir="$HOME/.codex"
config_file="$config_dir/config.toml"

mkdir -p "$config_dir"
touch "$config_file"
sed -i '/^default_permissions = /d' "$config_file"
sed -i '/^sandbox_mode = /d' "$config_file"
printf 'default_permissions = ":danger-full-access"\n' >>"$config_file"
