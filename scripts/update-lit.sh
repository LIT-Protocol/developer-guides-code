CALLER_DIR=$(pwd)

if [ -f "$CALLER_DIR/package.json" ]; then
  echo "Updating lit-protocol dependencies in $CALLER_DIR"
  
  for pkg in $(jq -r '.dependencies | keys[] | select(test("^@lit-protocol"))' "$CALLER_DIR/package.json"); do
    LATEST_VERSION=$(npm show $pkg version)
    echo "Updating $pkg to version ^$LATEST_VERSION"
    npm pkg set "dependencies.$pkg=^$LATEST_VERSION"
  done
else
  echo "No package.json found in $CALLER_DIR."
fi
done