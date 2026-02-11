(function () {
  /* -------------------------------------------------------------------------- */
  /* CONFIGURATION                                                              */
  /* -------------------------------------------------------------------------- */

  // NOTE: We use standard strings with \n to ensure the bookmarklet stays one line.
  var EXPERT_PROMPT =
    "You are an expert technical writer for ML/DevOps engineers, specializing in AI systems, infrastructure, and emerging tech.\n\n" +
    "TASK: Fetch and analyze the FULL transcript/content of this source. Provide a high-signal, scannable summary.\n\n" +
    "CONSTRAINTS:\n" +
    "- No paragraphs >3 lines.\n" +
    "- Use ## Headers, **bold key terms**, bullets/tables.\n" +
    "- Cite timestamps [mm:ss] or sections [para #].\n\n" +
    "OUTPUT (Markdown only):\n" +
    "## Metadata\n" +
    "- **Title**, **Source/Author**, **Date**, **Duration/Length**.\n\n" +
    "## Core Thesis\n" +
    "1-2 sentences on main argument/innovation.\n\n" +
    "## Problems Addressed\n" +
    '- 4-5 bullets: Failures of current approaches (quantify if possible, e.g., "**latency >500ms**").\n\n' +
    "## Proposed Solution\n" +
    "1. Numbered steps of technical implementation.\n" +
    "2. Text-based diagram if relevant (e.g., Mermaid syntax).\n\n" +
    "## Key Concepts\n" +
    "- **Term1**: Definition + example.\n" +
    "- **Term2**: ...\n\n" +
    "## Results & Limits (include if relevant)\n" +
    "| Metric | Baseline | Proposed | Notes [cite] |\n" +
    "|--------|----------|----------|-------------|\n" +
    "| Accuracy | ...   | ...   | ...       |\n\n" +
    "**Limitations**: 3 bullets.\n\n" +
    "## 3 Takeaways\n" +
    '- Actionable for builders (e.g., "Deploy via Docker Swarm").\n\n' +
    "URL: ";

  var FALLBACK_PROMPT =
    "Analyze this webpage. Act as an expert technical writer. Your goal is to provide a comprehensive summary that is high-signal and easy to scan.\n\n" +
    "Constraint: Use distinct headers, bullet points, and bold text.\n\n" +
    "Output Format:\n" +
    "- Metadata: Title, Author/Source.\n" +
    "- The Core Thesis: A 2-sentence summary of the main argument.\n" +
    "- Key Concepts: Bullet points defining specific concepts or metaphors used.\n" +
    "- Strategic Takeaways: High-level conclusions for a developer or builder.\n\n" +
    "URL: ";

  /* -------------------------------------------------------------------------- */
  /* LOGIC                                                                      */
  /* -------------------------------------------------------------------------- */

  var u = location.href;
  var m = u.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  var finalPrompt = "";

  if (m) {
    var vid = m[1];
    var time = u.match(/[?&]t=([^&]+)/);
    var cleanUrl =
      "https://www.youtube.com/watch?v=" + vid + (time ? "&t=" + time[1] : "");
    finalPrompt = EXPERT_PROMPT + cleanUrl;
  } else {
    finalPrompt = FALLBACK_PROMPT + u;
  }

  /* -------------------------------------------------------------------------- */
  /* UI INJECTION (WITH FALLBACK)                                               */
  /* -------------------------------------------------------------------------- */

  try {
    // 1. Clean up existing popup
    var exist = document.getElementById("ai-sum-pop");
    if (exist) exist.remove();

    // 2. Create Element
    var d = document.createElement("div");
    d.id = "ai-sum-pop";
    d.style =
      'position:fixed;top:20px;right:20px;z-index:2147483647;background:#1e1e1e;padding:20px;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.6);font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;width:480px;border:1px solid #333;color:#e0e0e0;text-align:left;';

    // 3. Define HTML
    var html =
      '<h3 style="margin:0 0 12px;font-size:16px;font-weight:600;color:#fff;">Technical Summarizer</h3>';
    html +=
      '<label style="font-size:12px;color:#aaa;display:block;margin-bottom:6px;">Edit Prompt:</label>';
    html +=
      '<textarea id="ai-prompt-box" style="width:100%;height:220px;margin-bottom:16px;background:#2c2c2c;color:#e0e0e0;border:1px solid #444;border-radius:6px;font-size:12px;padding:10px;resize:vertical;font-family:monospace;"></textarea>';
    html +=
      '<label style="font-size:12px;color:#aaa;display:block;margin-bottom:6px;">Provider:</label>';
    html +=
      '<select id="ai-provider" style="width:100%;padding:10px;margin-bottom:16px;background:#2c2c2c;color:#fff;border:1px solid #444;border-radius:6px;font-size:13px;outline:none;"><option value="https://gemini.google.com/app">Gemini</option><option value="https://chatgpt.com/">ChatGPT</option><option value="https://www.perplexity.ai/">Perplexity</option><option value="https://claude.ai/new">Claude</option><option value="https://kimi.moonshot.cn/">Kimi</option></select>';
    html +=
      '<div style="display:flex;align-items:center;margin-bottom:16px;"><input type="checkbox" id="ai-launch-chk" checked style="accent-color:#3b82f6;cursor:pointer;margin-right:10px;transform:scale(1.2);"><label for="ai-launch-chk" style="font-size:14px;color:#ccc;cursor:pointer;">Open New Tab</label></div>';
    html +=
      '<button id="ai-go-btn" style="width:100%;background:#3b82f6;color:#fff;border:none;padding:12px;border-radius:6px;cursor:pointer;font-weight:600;font-size:14px;transition:background 0.2s;">Copy Prompt</button>';
    html +=
      '<div id="ai-msg" style="margin-top:12px;font-size:12px;color:#888;text-align:center;">Ready</div>';
    html +=
      '<button id="ai-close-btn" style="position:absolute;top:10px;right:15px;background:none;border:none;cursor:pointer;font-size:24px;color:#666;">&times;</button>';

    // 4. Inject (This is where Chrome fails)
    d.innerHTML = html;
    document.body.appendChild(d);

    // 5. Initialize UI Logic
    document.getElementById("ai-prompt-box").value = finalPrompt;

    document.getElementById("ai-close-btn").onclick = function () {
      d.remove();
    };

    document.getElementById("ai-go-btn").onclick = function () {
      var fp = document.getElementById("ai-prompt-box").value;
      var url = document.getElementById("ai-provider").value;
      var shouldLaunch = document.getElementById("ai-launch-chk").checked;
      var btn = document.getElementById("ai-go-btn");
      var msg = document.getElementById("ai-msg");

      navigator.clipboard.writeText(fp).then(
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
        function () {
          alert("Clipboard failed.");
        },
      );
    };
  } catch (e) {
    // Fallback for Security-Locked Sites (Chrome/YouTube)
    navigator.clipboard.writeText(finalPrompt).then(
      function () {
        alert(
          "Security Policy Blocked Popup.\n\n✅ Prompt Copied to Clipboard!",
        );
      },
      function () {
        alert("Security Policy Blocked Popup & Clipboard Access Failed.");
      },
    );
  }
})();
