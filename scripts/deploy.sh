#!/usr/bin/env bash
# deploy.sh — one-step Vercel deploy for the Praxis demo.
# First run: opens browser for OAuth.
# Subsequent runs: deploys directly to production.
set -euo pipefail

if ! command -v npx >/dev/null 2>&1; then
  echo "npx not found. Install Node 20+ first." >&2
  exit 1
fi

echo "[deploy] checking Vercel auth..."
if ! npx -y vercel whoami >/dev/null 2>&1; then
  echo "[deploy] not logged in — launching browser auth"
  npx -y vercel login
fi

echo "[deploy] who are we?"
npx -y vercel whoami

echo "[deploy] linking + deploying production..."
npx -y vercel --prod --yes
