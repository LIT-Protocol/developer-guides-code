#!/bin/bash

TARGET_DIR="${1:-$(pwd)}"
TARGET_DIR=$(realpath "$TARGET_DIR")

if [ -d "$TARGET_DIR" ]; then
  cd "$TARGET_DIR" || exit
  echo "Updating lit-protocol dependencies in $TARGET_DIR"
  
  if [ -f "package.json" ]; then
    for pkg in $(jq -r '.dependencies | keys[] | select(test("^@lit-protocol"))' "package.json"); do
      LATEST_VERSION=$(npm show $pkg version)
      echo "Updating $pkg to version ^$LATEST_VERSION"
      npm pkg set "dependencies.$pkg=^$LATEST_VERSION"
    done
  else
    echo "No package.json found in $TARGET_DIR."
  fi
else
  echo "Directory $TARGET_DIR does not exist."
fi