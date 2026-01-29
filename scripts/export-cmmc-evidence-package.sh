#!/usr/bin/env bash
# Export CMMC evidence package for C3PAO auditor handoff.
# Collects /opt/compliance/hardening-evidence, /opt/compliance/validation-evidence,
# and /opt/compliance/policies (if present) into a single tarball.
#
# Usage: sudo ./scripts/export-cmmc-evidence-package.sh [--output /path/to/evidence-package.tar.gz]
# Default output: /opt/compliance/evidence-package-YYYYMMDD-HHMM.tar.gz (or ./evidence-package-*.tar.gz if /opt/compliance not writable)

set -e

BASE_DIR="${BASE_DIR:-/opt/compliance}"
TIMESTAMP=$(date +%Y%m%d-%H%M)
DEFAULT_OUTPUT="${BASE_DIR}/evidence-package-${TIMESTAMP}.tar.gz"
OUTPUT="${DEFAULT_OUTPUT}"

while [[ $# -gt 0 ]]; do
  case $1 in
    --output)
      OUTPUT="$2"
      shift 2
      ;;
    --base-dir)
      BASE_DIR="$2"
      shift 2
      ;;
    *)
      echo "Usage: $0 [--output /path/to/package.tar.gz] [--base-dir /opt/compliance]" >&2
      exit 1
      ;;
  esac
done

# If default is under /opt/compliance and we can't write there, use cwd
if [[ "$OUTPUT" == "$DEFAULT_OUTPUT" ]] && [[ ! -w "$(dirname "$OUTPUT")" ]]; then
  OUTPUT="./evidence-package-${TIMESTAMP}.tar.gz"
fi

TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p "$TMP_DIR/evidence"

if [[ -d "${BASE_DIR}/hardening-evidence" ]]; then
  cp -a "${BASE_DIR}/hardening-evidence" "$TMP_DIR/evidence/"
fi
if [[ -d "${BASE_DIR}/validation-evidence" ]]; then
  cp -a "${BASE_DIR}/validation-evidence" "$TMP_DIR/evidence/"
fi
if [[ -d "${BASE_DIR}/policies" ]]; then
  cp -a "${BASE_DIR}/policies" "$TMP_DIR/evidence/"
fi

tar -czf "$OUTPUT" -C "$TMP_DIR" evidence
echo "Evidence package written: $OUTPUT"
