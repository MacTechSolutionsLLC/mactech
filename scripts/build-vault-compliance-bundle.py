#!/usr/bin/env python3
"""
Build the vault-boundary CMMC policy and procedure bundle.

Copies policies and procedures listed in vault-compliance-bundle-manifest.json
into vault-compliance-bundle/ (or a custom output dir). Used to populate
/opt/compliance/policies in the deployable CUI vault image.

Usage:
  python3 scripts/build-vault-compliance-bundle.py [--output-dir <path>] [--repo-root <path>]
  python3 scripts/build-vault-compliance-bundle.py --install-dir /opt/compliance/policies  # requires root for /opt
"""

import argparse
import json
import shutil
import sys
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Build vault-boundary CMMC policy/procedure bundle from manifest"
    )
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path.cwd(),
        help="Repository root (default: current directory)",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Output directory (default: compliance/cmmc/level2/vault-compliance-bundle)",
    )
    parser.add_argument(
        "--install-dir",
        type=Path,
        default=None,
        help="Install directory (e.g. /opt/compliance/policies); copies bundle there (may require root)",
    )
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    manifest_path = repo_root / "compliance" / "cmmc" / "level2" / "vault-compliance-bundle-manifest.json"
    if not manifest_path.exists():
        print(f"Manifest not found: {manifest_path}", file=sys.stderr)
        return 1

    with open(manifest_path, encoding="utf-8") as f:
        manifest = json.load(f)

    source_dir = repo_root / manifest["source_dir"]
    if not source_dir.exists():
        print(f"Source dir not found: {source_dir}", file=sys.stderr)
        return 1

    output_dir = args.output_dir
    if output_dir is None:
        output_dir = repo_root / "compliance" / "cmmc" / "level2" / "vault-compliance-bundle"
    output_dir = output_dir.resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    copied = 0
    for name in manifest["files"]:
        src = source_dir / name
        if not src.exists():
            print(f"Skip (missing): {name}", file=sys.stderr)
            continue
        dst = output_dir / name
        shutil.copy2(src, dst)
        print(f"Copied: {name}")
        copied += 1

    print(f"Bundle built: {copied} files -> {output_dir}")

    if args.install_dir:
        install_dir = args.install_dir.resolve()
        install_dir.mkdir(parents=True, exist_ok=True)
        for f in output_dir.iterdir():
            if f.is_file():
                shutil.copy2(f, install_dir / f.name)
        print(f"Installed: {install_dir}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
