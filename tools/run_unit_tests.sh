#!/bin/bash
set -euo pipefail
set -x

repo_root=$(git rev-parse --show-toplevel)

args=()
for arg in "$@"; do
  case "$arg" in
    "${repo_root}/web/"*) args+=("${arg#"${repo_root}/web/"}") ;;
    app/*) args+=("${arg#app/}") ;;
    *) args+=("$arg") ;;
  esac
done

cd "${repo_root}/web"
npm run test -- ${args[@]+"${args[@]}"}
