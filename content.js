(function () {
  "use strict";

  const DEFAULT_KEYWORDS = [
    "cake",
    "plushie",
    "cakes",
    "epic",
    "sushi",
    "fish",
    "rare",
    "legendary",
  ];
  const DEFAULT_REFRESH = 30;
  const STORAGE_KEY = "paliaNotifierSettings";

  let settings = {};

  function log(...args) {
    console.log("[PaliaNotifier]", ...args);
  }

  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get([STORAGE_KEY]);
      if (result[STORAGE_KEY]) {
        settings = result[STORAGE_KEY];
      } else {
        settings = {
          keywords: DEFAULT_KEYWORDS,
          notify: true,
          refresh: DEFAULT_REFRESH,
        };
      }
    } catch (e) {
      console.error("Error loading settings:", e);
      settings = {
        keywords: DEFAULT_KEYWORDS,
        notify: true,
        refresh: DEFAULT_REFRESH,
      };
    }
  }

  async function saveSettings() {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: settings });
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  }

  function normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function notifyUser(matches) {
    if (!settings.notify || matches.length === 0) return;

    // Create summary message
    let message;
    if (matches.length === 1) {
      message = `Found: ${matches[0]}`;
    } else {
      message = `Found ${matches.length} matches: ${matches
        .slice(0, 2)
        .join(", ")}${matches.length > 2 ? "..." : ""}`;
    }

    // Try Chrome extension notification first
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: "showNotification",
        title: "🎉 Palia Party Match!",
        message: message,
      });
      // Don't wait for response to avoid message port errors
    } else {
      // Fallback to browser notification
      fallbackNotification(message);
    }

    log("Notification:", message);
  }

  function fallbackNotification(message) {
    if (Notification.permission === "granted") {
      new Notification("🎉 Palia Party Match!", {
        body: message,
        icon: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQxIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojNmI0NmMxO3N0b3Atb3BhY2l0eToxIiAvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzhiNWNmNjtzdG9wLW9wYWNpdHk6MSIgLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48Y2lyY2xlIGN4PSIyNCIgY3k9IjI0IiByPSIyMiIgZmlsbD0idXJsKCNncmFkMSkiIHN0cm9rZT0iIzRjMWQ5NSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+",
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          fallbackNotification(message);
        }
      });
    }
  }

  function waitForSelector(selector, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let elapsed = 0;
      const check = () => {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          resolve(elements);
        } else if (elapsed >= timeout) {
          reject(new Error(`Timeout: Selector "${selector}" not found`));
        } else {
          elapsed += interval;
          setTimeout(check, interval);
        }
      };
      check();
    });
  }

  async function checkTitles() {
    try {
      log("Checking for matching titles...");
      const elements = await waitForSelector(".line-clamp-3");
      const titles = Array.from(elements).map((el) => el.textContent.trim());
      log(`Found ${titles.length} titles:`, titles);

      const matched = titles.filter((title) =>
        settings.keywords.some((keyword) =>
          normalize(title).includes(normalize(keyword))
        )
      );

      if (matched.length > 0) {
        notifyUser(matched);
      } else {
        log("No matching titles found.");
      }
    } catch (err) {
      log("Error during check:", err.message);
    }
  }

  function createSettingsUI() {
    const style = document.createElement("style");
    style.textContent = `
        #palia-toggle-button {
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 25px;
          cursor: pointer;
          z-index: 10000;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }
        #palia-toggle-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
        }
        #palia-settings {
          display: none;
          position: fixed;
          top: 70px;
          right: 20px;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          z-index: 10000;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
          border-radius: 16px;
          width: 300px;
          animation: slideIn 0.3s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        #palia-settings .title {
          font-size: 18px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 20px;
          text-align: center;
        }
        #palia-settings .form-group {
          margin-bottom: 20px;
        }
        #palia-settings .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #4a5568;
        }
        #palia-settings .checkbox-group {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
        }
        #palia-settings .checkbox-group input[type="checkbox"] {
          width: 18px;
          height: 18px;
          margin-right: 12px;
          accent-color: #667eea;
        }
        #palia-settings .checkbox-group label {
          margin-bottom: 0;
          cursor: pointer;
        }
        #palia-settings .input-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        #palia-settings input[type="number"] {
          width: 80px;
          padding: 8px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }
        #palia-settings input[type="number"]:focus {
          outline: none;
          border-color: #667eea;
        }
        #palia-settings textarea {
          width: 100%;
          min-height: 80px;
          padding: 12px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 14px;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s ease;
        }
        #palia-settings textarea:focus {
          outline: none;
          border-color: #667eea;
        }
        #palia-settings .save-button {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }
        #palia-settings .save-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }
        #palia-settings .save-button:active {
          transform: translateY(0);
        }
        #palia-settings .keyword-count {
          font-size: 12px;
          color: #718096;
          margin-top: 4px;
        }
      `;
    document.head.appendChild(style);

    const toggleBtn = document.createElement("button");
    toggleBtn.id = "palia-toggle-button";
    toggleBtn.innerHTML = "⚙️ Settings";
    document.body.appendChild(toggleBtn);

    const panel = document.createElement("div");
    panel.id = "palia-settings";
    panel.innerHTML = `
        <div class="title">🎉 Palia Party Notifier</div>
        
        <div class="checkbox-group">
          <input type="checkbox" id="palia-toggle" ${
            settings.notify ? "checked" : ""
          }/>
          <label for="palia-toggle">Enable Notifications</label>
        </div>
        
        <div class="form-group">
          <label>Auto-refresh interval:</label>
          <div class="input-group">
            <input type="number" id="palia-refresh" value="${
              settings.refresh
            }" min="10" max="300">
            <span>seconds</span>
          </div>
        </div>
        
        <div class="form-group">
          <label for="palia-keywords">Keywords to watch for:</label>
          <textarea id="palia-keywords" placeholder="Enter keywords separated by commas...">${settings.keywords.join(
            ", "
          )}</textarea>
          <div class="keyword-count">Current: ${
            settings.keywords.length
          } keywords</div>
        </div>
        
        <button class="save-button" id="palia-save">💾 Save Settings</button>
      `;
    document.body.appendChild(panel);

    toggleBtn.onclick = () => {
      const isVisible = panel.style.display === "block";
      panel.style.display = isVisible ? "none" : "block";

      if (!isVisible) {
        // Update keyword count when opening
        const updateKeywordCount = () => {
          const keywords = document
            .getElementById("palia-keywords")
            .value.split(",")
            .map((k) => k.trim())
            .filter(Boolean);
          document.querySelector(
            ".keyword-count"
          ).textContent = `Current: ${keywords.length} keywords`;
        };
        document
          .getElementById("palia-keywords")
          .addEventListener("input", updateKeywordCount);
      }
    };

    document.getElementById("palia-save").onclick = async () => {
      const notifyCheckbox = document.getElementById("palia-toggle");
      const refreshInput = document.getElementById("palia-refresh");
      const keywordsInput = document.getElementById("palia-keywords");

      settings.notify = notifyCheckbox.checked;
      settings.refresh = Math.max(
        10,
        Math.min(300, parseInt(refreshInput.value, 10) || 30)
      );
      settings.keywords = keywordsInput.value
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);

      await saveSettings();

      // Show success feedback
      const button = document.getElementById("palia-save");
      const originalText = button.textContent;
      button.textContent = "✅ Saved!";
      button.style.background =
        "linear-gradient(135deg, #48bb78 0%, #38a169 100%)";

      setTimeout(() => {
        location.reload();
      }, 1000);
    };
  }

  // === Main Execution ===
  async function init() {
    log("Extension loaded. Loading settings...");
    await loadSettings();

    // Request notification permission
    if (
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      log("Requesting notification permission...");
      await Notification.requestPermission();
    }

    createSettingsUI();
    checkTitles();

    setInterval(() => {
      log(`Refreshing page every ${settings.refresh} seconds...`);
      location.reload();
    }, settings.refresh * 1000);
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
