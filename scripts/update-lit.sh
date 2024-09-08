#!/bin/bash

TARGET_DIR="${1:-$(pwd)}"

if [ -f "$TARGET_DIR/package.json" ]; then
  echo "Updating lit-protocol dependencies in $TARGET_DIR"
  
  for pkg in $(jq -r '.dependencies | keys[] | select(test("^@lit-protocol"))' "$TARGET_DIR/package.json"); do
    LATEST_VERSION=$(npm show $pkg version)
    echo "Updating $pkg to version ^$LATEST_VERSION"
    npm pkg set "dependencies.$pkg=^$LATEST_VERSION"
  done
else
  echo "No package.json found in $TARGET_DIR."
fi