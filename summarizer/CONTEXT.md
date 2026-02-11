# Context

## Project Overview
This project is a **browser bookmarklet** designed to summarize YouTube videos or web pages using external LLM providers (Gemini, ChatGPT, Claude, Perplexity, Kimi). It works by:
1.  Extracting the current URL (and video ID/timestamp if on YouTube).
2.  Constructing a prompt with an "Expert Technical Writer" persona.
3.  Injecting a UI overlay into the current page to allow the user to select an LLM provider and copy the prompt.
4.  Opening the selected LLM provider in a new tab with the prompt in the clipboard.

## Tech Stack
-   **Language**: Vanilla JavaScript (ES5/ES6 compatible for browser execution).
-   **Build Tool**: `uglify-js` (via npm) to minify the code into a single-line bookmarklet.
-   **Shell**: `sh` for the build script.

## File Structure

### Source (`src/`)
-   `src/main.js`: **Primary Source**. Contains the bookmarklet logic, including:
    -   `EXPERT_PROMPT`: The prompt template for YouTube videos.
    -   `FALLBACK_PROMPT`: The prompt template for generic web pages.
    -   URL parsing logic (YouTube ID extraction).
    -   DOM manipulation to inject the UI overlay (`div#ai-sum-pop`).
    -   Clipboard handling and navigation logic.
-   `src/main.v1.js`, `src/main.v2.js`: Legacy/alternative versions.

### Build (`build.sh` & `package.json`)
-   `package.json`:
    -   Dependency: `uglify-js` (dev).
    -   Script: `npm run build` triggers `sh build.sh`.
-   `build.sh`:
    -   Minifies `src/main.js` using `uglifyjs`.
    -   Prepends `javascript:` to the output.
    -   Writes to `dist/bookmarklet.js`.
    -   Attempts to copy the result to the system clipboard (`pbcopy`, `wl-copy`, `xclip`).

### Output (`dist/`)
-   `dist/bookmarklet.js`: The final minified string ready to be pasted into a browser bookmark.

## Development Workflow
1.  **Edit**: Modify `src/main.js`.
2.  **Build**: Run `npm run build`.
3.  **Install**: Copy the content of `dist/bookmarklet.js` and create a new bookmark with this URL.

## Key Constraints & behaviors
-   **No External Runtime**: The code runs entirely in the user's browser context.
-   **CSP/Security**: Some sites (like YouTube or heavy CSP sites) might block the UI injection or clipboard access. The code includes a `try/catch` block to fallback to a simple `alert` if DOM injection fails, though clipboard access restrictions may still apply.
-   **Single File Output**: The goal is a single line of JavaScript code.
