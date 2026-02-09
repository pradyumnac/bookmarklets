# 🧠 AI Technical Summarizer

> **Stop writing generic prompts.** This bookmarklet extracts the transcript (or page text), wraps it in an "Expert Technical Writer" persona, and hands it to your favorite LLM.

![Demo](https://via.placeholder.com/800x400?text=Insert+Screenshot+Here+Later)

## Why?

Most "YouTube Summarizer" extensions are garbage. They:

1. Require an API key (cost money).
2. Are overly broad (generic summaries).
3. Track your history.

**This tool is different:**

- **Client-side only:** It runs on _your_ DOM.
- **Model Agnostic:** Works with Gemini, ChatGPT, Claude, Perplexity, or Kimi.
- **High-Signal Prompt:** It doesn't just ask for a summary; it asks for "Core Thesis," "Mental Models," and "Strategic Takeaways."

## 🚀 Install (Drag & Drop)

1. Create a new bookmark in your browser bar.
2. Name it **"Summarize"**.
3. Paste this code into the **URL** field:

```javascript
(function () {
  /* -------------------------------------------------------------------------- */
  /* CONFIGURATION                                */
  /* -------------------------------------------------------------------------- */

  // The "Expert Technical Writer" Prompt
  const EXPERT_PROMPT = `Analyze the transcript of this YouTube video. Act as an expert technical writer. Your goal is to provide a comprehensive summary that is high-signal and easy to scan.

Constraint: Do not use long paragraphs. Use distinct headers, bullet points, and bold text to highlight key terminology and mechanics.

Output Format:
- Metadata: Title, Channel, Date.
- The Core Thesis: A 2-sentence summary of the video's main argument.
- The Problem Space: Bullet points explaining why current methods (like standard RAG or context stuffing) fail.
- The Proposed Solution: A step-by-step breakdown of the technical solution proposed (e.g., How does the RLM/REPL loop work?).
- Key Mental Models: Define the specific concepts or metaphors used (e.g., "Dependency Graphs").
- Results & Limitations: What did the experiments show? What are the downsides?
- 3 Strategic Takeaways: High-level conclusions for a developer or builder.

URL: `;

  const FALLBACK_PROMPT = `Analyze this webpage. Act as an expert technical writer. Your goal is to provide a comprehensive summary that is high-signal and easy to scan.

Constraint: Use distinct headers, bullet points, and bold text.

Output Format:
- Metadata: Title, Author/Source.
- The Core Thesis: A 2-sentence summary of the main argument.
- Key Concepts: Bullet points defining specific concepts or metaphors used.
- Strategic Takeaways: High-level conclusions for a developer or builder.

URL: `;

  /* -------------------------------------------------------------------------- */
  /* LOGIC                                    */
  /* -------------------------------------------------------------------------- */

  // 1. Parse URL & Build Prompt
  var u = location.href;
  var m = u.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  var defaultPrompt = "";

  if (m) {
    /* VIDEO MODE */
    var vid = m[1];
    var time = u.match(/[?&]t=([^&]+)/);
    var cleanUrl =
      "https://www.youtube.com/watch?v=" + vid + (time ? "&t=" + time[1] : "");
    defaultPrompt = EXPERT_PROMPT + cleanUrl;
  } else {
    /* FALLBACK MODE */
    defaultPrompt = FALLBACK_PROMPT + u;
  }

  /* -------------------------------------------------------------------------- */
  /* UI                                     */
  /* -------------------------------------------------------------------------- */

  // Remove existing popup if present
  var exist = document.getElementById("ai-sum-pop");
  if (exist) exist.remove();

  // Create Container
  var d = document.createElement("div");
  d.id = "ai-sum-pop";
  d.style =
    'position:fixed;top:20px;right:20px;z-index:2147483647;background:#1e1e1e;padding:20px;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.6);font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;width:480px;border:1px solid #333;color:#e0e0e0;text-align:left;';

  // Build HTML
  var html =
    '<h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#fff;">Technical Summarizer</h3>';

  // Text Area
  html +=
    '<label style="font-size:12px;color:#aaa;display:block;margin-bottom:6px;">Edit Prompt:</label>';
  html +=
    '<textarea id="ai-prompt-box" style="width:100%;height:220px;margin-bottom:16px;background:#2c2c2c;color:#e0e0e0;border:1px solid #444;border-radius:6px;font-size:12px;padding:10px;resize:vertical;font-family:monospace;"></textarea>';

  // Provider Selector
  html +=
    '<label style="font-size:12px;color:#aaa;display:block;margin-bottom:6px;">Provider:</label>';
  html +=
    '<select id="ai-provider" style="width:100%;padding:10px;margin-bottom:16px;background:#2c2c2c;color:#fff;border:1px solid #444;border-radius:6px;font-size:13px;outline:none;">';
  html += '<option value="https://gemini.google.com/app">Gemini</option>';
  html += '<option value="https://chatgpt.com/">ChatGPT</option>';
  html += '<option value="https://www.perplexity.ai/">Perplexity</option>';
  html += '<option value="https://claude.ai/new">Claude</option>';
  html += '<option value="https://kimi.moonshot.cn/">Kimi</option>';
  html += "</select>";

  // Checkbox
  html += '<div style="display:flex;align-items:center;margin-bottom:16px;">';
  html +=
    '<input type="checkbox" id="ai-launch-chk" checked style="accent-color:#3b82f6;cursor:pointer;margin-right:10px;transform:scale(1.2);">';
  html +=
    '<label for="ai-launch-chk" style="font-size:14px;color:#ccc;cursor:pointer;">Open New Tab</label>';
  html += "</div>";

  // Buttons
  html +=
    '<button id="ai-go-btn" style="width:100%;background:#3b82f6;color:#fff;border:none;padding:12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:14px;transition:background 0.2s;">Copy Prompt</button>';
  html +=
    '<div id="ai-msg" style="margin-top:12px;font-size:12px;color:#888;text-align:center;">Ready</div>';
  html +=
    '<button id="ai-close-btn" style="position:absolute;top:10px;right:15px;background:none;border:none;cursor:pointer;font-size:24px;color:#666;">&times;</button>';

  d.innerHTML = html;
  document.body.appendChild(d);

  // Initialize Textarea
  document.getElementById("ai-prompt-box").value = defaultPrompt;

  /* -------------------------------------------------------------------------- */
  /* INTERACTIONS                                 */
  /* -------------------------------------------------------------------------- */

  document.getElementById("ai-close-btn").onclick = function () {
    d.remove();
  };

  document.getElementById("ai-go-btn").onclick = function () {
    var finalPrompt = document.getElementById("ai-prompt-box").value;
    var url = document.getElementById("ai-provider").value;
    var shouldLaunch = document.getElementById("ai-launch-chk").checked;
    var btn = document.getElementById("ai-go-btn");
    var msg = document.getElementById("ai-msg");

    navigator.clipboard.writeText(finalPrompt).then(
      function () {
        btn.innerText = "Copied!";
        btn.style.background = "#10b981";

        if (shouldLaunch) {
          msg.innerText = "Opening tab... Paste there!";
          setTimeout(function () {
            window.open(url, "_blank");
            d.remove();
          }, 600);
        } else {
          msg.innerText = "Copied to clipboard only.";
          setTimeout(function () {
            d.remove();
          }, 1200);
        }
      },
      function (err) {
        alert("Clipboard access denied. Please copy manually.");
        if (shouldLaunch) window.open(url, "_blank");
      },
    );
  };
})();
```

## 🛠️ How it works

    Detection: Checks if you are on YouTube (extracts Video ID + Timestamp) or a regular page.

    Context: If on YouTube, it builds a prompt asking the AI to "Analyze the transcript."

    UI Injection: Creates a temporary, dark-mode overlay on the page.

    Copy & Go: You edit the prompt, click Go, and it opens your chosen AI provider with the prompt in your clipboard.

## 💻 Development

Want to tweak the prompt?

    Edit src/main.js.

    Run npm install and npm run build.

    Copy the output from dist/bookmarklet.js.
