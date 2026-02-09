#!/bin/sh

# 1. Create the 'dist' directory
mkdir -p dist

# 2. Clipboard Helper Function
copy_to_clipboard() {
  if command -v pbcopy >/dev/null 2>&1; then
    # macOS
    pbcopy
  elif command -v wl-copy >/dev/null 2>&1; then
    # Wayland (Linux)
    wl-copy
  elif command -v xclip >/dev/null 2>&1; then
    # X11 (Linux)
    xclip -selection clipboard
  elif command -v xsel >/dev/null 2>&1; then
    # X11 Alternative (Linux)
    xsel --clipboard --input
  else
    echo "⚠️  Warning: No clipboard tool found (install xclip, wl-copy, or pbcopy)."
    return 1
  fi
  echo "📋 Copied bookmarklet to clipboard"
}

# 3. Build the bookmarklet
# Wrapping in a subshell for the "javascript:" prefix
(
  printf "javascript:"
  ./node_modules/.bin/uglifyjs src/main.js -c -m -O quote_style=1
) >dist/bookmarklet.js

echo "✅ Build successful -> dist/bookmarklet.js"

# 4. Pipe the file content into our helper function
cat dist/bookmarklet.js | copy_to_clipboard
