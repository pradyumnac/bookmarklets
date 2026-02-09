#!/bin/sh

# 1. Create the 'dist' directory if it doesn't exist (-p avoids errors)
mkdir -p dist

# 2. Build the bookmarklet
# We use a subshell ( ... ) to combine the "javascript:" prefix
# and the minified code into a single stream, then redirect to the file.
(
  printf "javascript:"
  ./node_modules/.bin/uglifyjs src/main.js -c -m -O quote_style=1
) >dist/bookmarklet.js

echo "✅ Build successful -> dist/bookmarklet.js"
