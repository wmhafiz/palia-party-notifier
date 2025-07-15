(function () {
  "use strict";

  const rareFish = [
    "Midnight Paddlefish",
    "Ancient Fish",
    "Enchanted Pupfish",
    "Giant Kilima Stingray",
    "Beluga Sturgeon",
    "Alligator Gar",
    "Blobfish",
    "Crimson Fangtooth",
    "Hypnotic Moray",
    "Void Ray",
    "Mermaid"
  ];

  const epicFish = [
    "Blue Marlin",
    "Bluefin Tuna",
    "Yellowfin Tuna",
    "Barracuda",
    "Ribbontail Ray"
  ];

  const legendaryFish = [
    "Ancient Fish"
  ];

  // === PARTY GROUPS CONFIGURATION ===
  // Easy to add/remove groups - just modify this object
  const PARTY_GROUPS = {
    "Fish Dishes": {
      keywords: ["fish", "rare", "epic", "legendary", "t1", "t2", "t3", "sashimi", "sushi", "poke", "pokebowl", "poke bowl", "taco", "fish stew"],
      webhookUrl: "https://discord.com/api/webhooks/1393939260993704018/hiRehdCIc-daAuZZH0ATgq62WmlSkoKLiLnzsBpTCU1gzERCC_TDPDe_G5hAzqg0TjBK",
      color: 0x3498db, // Blue
      enabled: true
    },
    "Focus Food": {
      keywords: [
        "focus", "energy", "bean burger", "Bouillabaisse", "Fried",
        "Pumpkin Curry", "Dumplings", "akwindu chappa", "stir fry", "Cabbage Rolls",
        "Masala", "Spicy Rice", "Steak Dinner", "Apple Pie", "Noodle", "Spicy Rice Cakes",
      ],
      webhookUrl: "https://discord.com/api/webhooks/1394465867219341343/2NuQoxBUhPXfwsKivNsW0mK39dHXNGDuYSY5P2RF80Tsq7CQbQ4O_aSQWI86J191KszS",
      color: 0x9b59b6, // Purple
      enabled: true
    },
    "Giveaways": {
      keywords: ["giveaway", "free", "plush", "new member", "gathering"],
      webhookUrl: "https://discord.com/api/webhooks/1394466102620323912/Cf6-KbJGO9X6oLxqrxgIi6Uj1VkEsEe8kOpkY0O0XA1vQIEIlZmNZrOv4NjpEKnbdlYi",
      color: 0xe74c3c, // Red
      enabled: true
    },
    "Flow Tree": {
      keywords: ["flow tree", "flow", "tree", "grove"],
      webhookUrl: "https://discord.com/api/webhooks/1394466429897543720/X52FGeiK3TMQxrc_FDzZ1EvAuM2pHX_3facTu2tZ8QUAtqXRgByNB3Wv94H23hT9mPMW",
      color: 0x27ae60, // Green
      enabled: true
    },
    "Hunting": {
      keywords: ["hunting", "hunt", "chapaa", "sernuk", "muujin", "ogopo", "ogopu"],
      webhookUrl: "https://discord.com/api/webhooks/1394466499288371281/GidMTbSgmK2zmuYxYUN1Ih1yMHxU3A1nuPEK9shVhkkMzjhoXLsVVRHiGW0pTeQV57wF",
      color: 0x8b4513, // Brown
      enabled: true
    },
    "Bug Catching": {
      keywords: ["bug catching", "bug", "lure"],
      webhookUrl: "https://discord.com/api/webhooks/1394466586299207821/1W_BBu3KkAx0IT4mC7Kax2WHO-SnOrBEWe6ujWs76U0PSGrxSUFSRGoUdHB0cL_n5_t_",
      color: 0xf39c12, // Orange
      enabled: true
    },
    "Fishing": {
      keywords: [
        "fishing", "fish", "rare", "epic", "legendary", "t1", "t2", "t3",
        ...rareFish,
        ...epicFish,
        ...legendaryFish
      ],
      webhookUrl: "https://discord.com/api/webhooks/1394484347003863120/Z9bBrWLdy4yGL-AkqmGgFCk68pEB8YEsjsYXBq7fj3iuox5Gx4mJrhPt1dEMgeocfxeY",
      color: 0x27ae60, // Green
      enabled: true
    },
    "Celebration Cakes": {
      keywords: ["celebration cake", "cake", "birthday", "birthday cake"],
      webhookUrl: "https://discord.com/api/webhooks/1394466004674809966/qpVh_p81Ry1Ob883jOV2-iLY6HxLIsD3KWReI-fc9WO9QV5ZyCY1FnOyVebsvGP2QDl0",
      color: 0xff6b6b, // Light Red
      enabled: true
    }
  };

  const DEFAULT_REFRESH = 30;
  const STORAGE_KEY = "paliaNotifierSettings";
  const NOTIFIED_IDS_KEY = "paliaNotifiedIds";

  let settings = {};
  let notifiedIds = new Set();

  function log(...args) {
    console.log("[PaliaNotifier]", ...args);
  }

  async function loadSettings() {
    try {
      const result = await chrome.storage.local.get([
        STORAGE_KEY,
        NOTIFIED_IDS_KEY,
      ]);
      if (result[STORAGE_KEY]) {
        settings = result[STORAGE_KEY];
      } else {
        settings = {
          notify: true,
          refresh: DEFAULT_REFRESH,
          groupSettings: {}
        };
      }

      // Always ensure groupSettings exists and has all current groups
      if (!settings.groupSettings) {
        settings.groupSettings = {};
      }

      // Initialize/update group settings with current groups
      Object.keys(PARTY_GROUPS).forEach(groupName => {
        if (!settings.groupSettings[groupName]) {
          settings.groupSettings[groupName] = {
            enabled: PARTY_GROUPS[groupName].enabled
          };
        }
      });

      // Clean up old group settings that no longer exist
      Object.keys(settings.groupSettings).forEach(groupName => {
        if (!PARTY_GROUPS[groupName]) {
          delete settings.groupSettings[groupName];
        }
      });

      // Load notified IDs
      if (result[NOTIFIED_IDS_KEY]) {
        notifiedIds = new Set(result[NOTIFIED_IDS_KEY]);
      }
    } catch (e) {
      console.error("Error loading settings:", e);
      settings = {
        notify: true,
        refresh: DEFAULT_REFRESH,
        groupSettings: {}
      };

      // Initialize group settings with defaults
      Object.keys(PARTY_GROUPS).forEach(groupName => {
        settings.groupSettings[groupName] = {
          enabled: PARTY_GROUPS[groupName].enabled
        };
      });
    }
  }

  async function saveSettings() {
    try {
      await chrome.storage.local.set({ [STORAGE_KEY]: settings });
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  }

  async function saveNotifiedIds() {
    try {
      await chrome.storage.local.set({
        [NOTIFIED_IDS_KEY]: Array.from(notifiedIds),
      });
    } catch (e) {
      console.error("Error saving notified IDs:", e);
    }
  }

  function normalize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function extractIdFromHref(href) {
    // Extract ID from href="/id" format
    const match = href.match(/^\/([^\/]+)$/);
    return match ? match[1] : null;
  }

  function getPartyDetails(element) {
    try {
      // Find the parent link element
      const linkElement = element.closest("a[href]");
      if (!linkElement) return null;

      const href = linkElement.getAttribute("href");
      const id = extractIdFromHref(href);
      if (!id) return null;

      // Get the title from the element
      const title = element.textContent.trim();

      // Try to get additional details from the link
      const titleAttr = linkElement.getAttribute("title");
      const fullTitle = titleAttr || title;

      // Try to find the time information by looking for clock SVG + adjacent text
      let timeInfo = "Time not specified";

      // Look for clock SVG (path contains clock-specific path data)
      const clockSvgs = linkElement.querySelectorAll("svg");
      for (const svg of clockSvgs) {
        const path = svg.querySelector("path");
        if (
          path &&
          path.getAttribute("d") &&
          path.getAttribute("d").includes("12 2.25c-5.385")
        ) {
          // This is likely a clock icon, find the adjacent span
          const parentDiv = svg.closest("div");
          if (parentDiv) {
            const timeSpan = parentDiv.querySelector("span.text-white");
            if (timeSpan) {
              const timeText = timeSpan.textContent.trim();
              // Check if it matches time patterns
              if (
                timeText.match(
                  /(?:< )?\d+[mhd]\s+ago|in\s+\d+[mhd]|\d{1,2}:\d{2}\s+(?:AM|PM)|\d{1,2}\s+\w+,?\s+\d{1,2}:\d{2}\s+(?:AM|PM)/i
                )
              ) {
                timeInfo = timeText;
                break;
              }
            }
          }
        }
      }

      // Fallback: look for any time-like patterns if clock method didn't work
      if (timeInfo === "Time not specified") {
        const allElements = linkElement.querySelectorAll("span, div");
        for (const elem of allElements) {
          const text = elem.textContent.trim();

          // Match various time formats:
          // - "< 1m ago", "1m ago", "11m ago", "in 7m"
          // - "13 Jul, 10:30 PM", "14 Jul, 1:00 AM"
          // - "10:30 PM"
          if (
            text.match(
              /^(?:< )?\d+[mhd]\s+ago$|^in\s+\d+[mhd]$|^\d{1,2}:\d{2}\s+(?:AM|PM)$|^\d{1,2}\s+\w+,?\s+\d{1,2}:\d{2}\s+(?:AM|PM)$/i
            )
          ) {
            timeInfo = text;
            break;
          }
        }
      }

      // Extract host name
      let hostName = "Host not specified";

      // Look for host name in spans with specific classes
      // The host name appears after a profile image or initial div
      const allSpans = linkElement.querySelectorAll("span");

      for (const span of allSpans) {
        const text = span.textContent.trim();

        // Check if this span has the correct classes for host name
        if (
          !span.classList.contains("text-white") ||
          !span.className.includes("text-[3.5cqw]")
        ) {
          continue;
        }

        // Skip if this span contains time information
        if (
          text.match(
            /^(?:< )?\d+[mhd]\s+ago$|^in\s+\d+[mhd]$|^\d{1,2}:\d{2}\s+(?:AM|PM)$|^\d{1,2}\s+\w+,?\s+\d{1,2}:\d{2}\s+(?:AM|PM)$/i
          )
        ) {
          continue;
        }

        // Skip if this span contains activity type (Bug Catching, Cooking, etc.)
        if (
          text.match(
            /^(Bug Catching|Cooking|Gardening|Furniture Making|Fishing|Foraging|Hunting|Mining)$/i
          )
        ) {
          continue;
        }

        // Skip if this span contains location information
        if (text.match(/^(Kilima Valley|Bahari Bay|Housing Plot)$/i)) {
          continue;
        }

        // Skip if this span contains user count (e.g., "1/25", "3/3")
        if (text.match(/^\d+\/\d+$/)) {
          continue;
        }

        // Skip if this span contains item quantities (e.g., "100 × Sashimi")
        if (text.match(/^\d+\s*×\s*.+$/)) {
          continue;
        }

        // Skip if this span contains "Beginner friendly"
        if (text.match(/^Beginner friendly$/i)) {
          continue;
        }

        // Check if this span is in the same container as a profile image or initial div
        const parentDiv = span.closest("div");

        if (parentDiv) {
          // Check if this div has the specific pattern for host containers
          // Host containers have classes like "flex min-h-[6.75cqw] flex-row items-center gap-[1.5cqw]"
          const hasHostContainerClasses =
            parentDiv.className.includes("flex") &&
            parentDiv.className.includes("items-center") &&
            parentDiv.className.includes("gap-[1.5cqw]");

          if (hasHostContainerClasses) {
            // Look for a profile image container within this div
            const allDivs = parentDiv.querySelectorAll("div");

            let hasProfileImage = false;

            for (const div of allDivs) {
              if (
                div.classList.contains("@container") ||
                div.className.includes("@container") ||
                div.className.includes("size-[4cqw]")
              ) {
                if (
                  div.querySelector("img") ||
                  div.querySelector("span.select-none")
                ) {
                  hasProfileImage = true;
                  break;
                }
              }
            }

            if (hasProfileImage) {
              hostName = text;
              break;
            }
          }
        }
      }

      // Extract dish information
      let dishName = "No dish specified";
      let dishImage = null;
      let dishQuantity = null;

      // Look for dish containers with specific classes
      const dishContainers = linkElement.querySelectorAll("div");
      for (const container of dishContainers) {
        // Check if this div has the dish container pattern
        if (
          container.className.includes(
            "flex flex-row items-center gap-[1cqw]"
          ) &&
          container.className.includes("border-white/25") &&
          container.className.includes("bg-white/15")
        ) {
          // Look for dish image
          const dishImg = container.querySelector("img");
          if (
            dishImg &&
            dishImg.src &&
            dishImg.src.includes("/cooking/meals/")
          ) {
            dishImage = dishImg.src;

            // Get dish name from img alt attribute as fallback
            const altText = dishImg.alt;

            // Look for dish name and quantity in the text content
            const dishTextDiv = container.querySelector(
              "div[class*='text-[3.5cqw]'][class*='text-white']"
            );

            if (dishTextDiv) {
              const fullText = dishTextDiv.textContent.trim();

              // Extract quantity and dish name (format: "100 × Fish Stew")
              const quantityMatch = fullText.match(/^(\d+)\s*×\s*(.+)$/);
              if (quantityMatch) {
                dishQuantity = parseInt(quantityMatch[1]);
                dishName = quantityMatch[2].trim();
              } else {
                // If no quantity pattern, use the full text as dish name
                dishName = fullText || altText;
              }
            } else {
              // Fallback to alt text if no text div found
              dishName = altText;
            }

            log(
              `Found dish: ${dishName} (${dishQuantity}x) - Image: ${dishImage}`
            );
            break;
          }
        }
      }

      return {
        id,
        title: fullTitle,
        time: timeInfo,
        host: hostName,
        dish: {
          name: dishName,
          image: dishImage,
          quantity: dishQuantity,
        },
        url: window.location.origin + href,
      };
    } catch (error) {
      log("Error extracting party details:", error);
      return null;
    }
  }

  function findMatchingGroups(title) {
    const normalizedTitle = normalize(title);
    const matchingGroups = [];

    Object.entries(PARTY_GROUPS).forEach(([groupName, groupConfig]) => {
      // Check if group is enabled in settings
      if (!settings.groupSettings[groupName]?.enabled) {
        return;
      }

      // Check if any keyword matches
      const hasMatch = groupConfig.keywords.some(keyword =>
        normalizedTitle.includes(normalize(keyword))
      );

      if (hasMatch) {
        matchingGroups.push({
          name: groupName,
          config: groupConfig
        });
      }
    });

    return matchingGroups;
  }

  async function sendDiscordNotification(matches) {
    if (!settings.notify || matches.length === 0) return;

    try {
      const paliaIconUrl = "https://i.ibb.co/Y451dW1P/palia-icon-128.png";
      const currentTime = new Date().toISOString();

      // Group matches by their matching groups
      const groupedMatches = new Map();

      for (const match of matches) {
        const matchingGroups = findMatchingGroups(match.title);

        for (const group of matchingGroups) {
          if (!groupedMatches.has(group.name)) {
            groupedMatches.set(group.name, []);
          }
          groupedMatches.get(group.name).push({
            ...match,
            group: group
          });
        }
      }

      // Send notifications for each group
      for (const [groupName, groupMatches] of groupedMatches) {
        const groupConfig = PARTY_GROUPS[groupName];

        for (const match of groupMatches) {
          // Build description with dish info if available
          let description = `👤 **Host:** ${match.host}\n⏰ **Time:** ${match.time}`;

          if (match.dish && match.dish.name !== "No dish specified") {
            const dishInfo = match.dish.quantity
              ? `${match.dish.quantity}x ${match.dish.name}`
              : match.dish.name;
            description += `\n🍽️ **Dish:** ${dishInfo}`;
          }

          const embed = {
            title: `${groupName}: ${match.title}`,
            description: description,
            color: groupConfig.color,
            fields: [
              {
                name: "🔗 Join Party",
                value: `[Click here to join the party](${match.url})`,
                inline: false,
              },
            ],
            thumbnail: {
              url: match.dish && match.dish.image ? match.dish.image : paliaIconUrl,
            },
            timestamp: currentTime,
            footer: {
              text: `Palia Party Notifier - ${groupName}`,
              icon_url: paliaIconUrl,
            },
          };

          const payload = {
            username: `Palia ${groupName}`,
            avatar_url: paliaIconUrl,
            embeds: [embed],
          };

          const response = await fetch(groupConfig.webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (response.ok) {
            log(`Discord notification sent successfully for ${groupName} party: ${match.id}`);
            notifiedIds.add(match.id);
          } else {
            log(`Failed to send Discord notification for ${groupName} party ${match.id}:`, response.status, response.statusText);
          }

          // Add a small delay between messages to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Save all notified IDs after processing all matches
      await saveNotifiedIds();
    } catch (error) {
      log("Error sending Discord notification:", error);
    }
  }

  function notifyUser(matches) {
    if (!settings.notify || matches.length === 0) return;

    // Filter out already notified matches
    const newMatches = matches.filter((match) => !notifiedIds.has(match.id));

    if (newMatches.length === 0) {
      log("All matches already notified, skipping");
      return;
    }

    // Send Discord notification
    sendDiscordNotification(newMatches);

    // Create summary message for fallback
    let message;
    if (newMatches.length === 1) {
      const match = newMatches[0];
      const matchingGroups = findMatchingGroups(match.title);
      const groupNames = matchingGroups.map(g => g.name).join(", ");

      let dishInfo = "";
      if (match.dish && match.dish.name !== "No dish specified") {
        dishInfo = match.dish.quantity
          ? ` - ${match.dish.quantity}x ${match.dish.name}`
          : ` - ${match.dish.name}`;
      }
      message = `Found [${groupNames}]: ${match.title} (Host: ${match.host}${dishInfo})`;
    } else {
      message = `Found ${newMatches.length} matches across multiple groups`;
    }

    // Try Chrome extension notification as fallback
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({
        action: "showNotification",
        title: "🎉 Palia Party Match!",
        message: message,
      });
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

      const matchedElements = [];

      Array.from(elements).forEach((element) => {
        const title = element.textContent.trim();
        const matchingGroups = findMatchingGroups(title);

        if (matchingGroups.length > 0) {
          matchedElements.push(element);
        }
      });

      if (matchedElements.length > 0) {
        // Extract party details for each matched element
        const matches = matchedElements
          .map((element) => getPartyDetails(element))
          .filter((details) => details !== null);

        if (matches.length > 0) {
          log("Found matches with details:", matches);
          notifyUser(matches);
        } else {
          log("No valid party details found for matches");
        }
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
          width: 320px;
          max-height: 80vh;
          overflow-y: auto;
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
          margin-bottom: 12px;
          padding: 8px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.02);
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
          flex: 1;
        }
        #palia-settings .group-indicator {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-left: 8px;
          flex-shrink: 0;
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
        #palia-settings .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 12px;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
        }
        #palia-settings .group-keywords {
          font-size: 12px;
          color: #718096;
          margin-top: 4px;
          font-style: italic;
        }
      `;
    document.head.appendChild(style);

    const toggleBtn = document.createElement("button");
    toggleBtn.id = "palia-toggle-button";
    toggleBtn.innerHTML = "⚙️ Settings";
    document.body.appendChild(toggleBtn);

    // Generate group checkboxes
    const groupCheckboxes = Object.entries(PARTY_GROUPS).map(([groupName, groupConfig]) => {
      // Ensure groupSettings exists and has this group
      if (!settings.groupSettings) {
        settings.groupSettings = {};
      }
      if (!settings.groupSettings[groupName]) {
        settings.groupSettings[groupName] = {
          enabled: groupConfig.enabled
        };
      }

      const isEnabled = settings.groupSettings[groupName]?.enabled !== false;
      const colorHex = `#${groupConfig.color.toString(16).padStart(6, '0')}`;

      return `
        <div class="checkbox-group">
          <input type="checkbox" id="group-${groupName}" ${isEnabled ? "checked" : ""}/>
          <label for="group-${groupName}">${groupName}</label>
          <div class="group-indicator" style="background-color: ${colorHex};"></div>
        </div>
        <div class="group-keywords">Keywords: ${groupConfig.keywords.join(", ")}</div>
      `;
    }).join("");

    const panel = document.createElement("div");
    panel.id = "palia-settings";
    panel.innerHTML = `
        <div class="title">🎉 Palia Party Notifier</div>
        
        <div class="form-group">
          <div class="checkbox-group">
            <input type="checkbox" id="palia-toggle" ${settings.notify ? "checked" : ""}/>
            <label for="palia-toggle">Enable Notifications</label>
          </div>
        </div>
        
        <div class="form-group">
          <label>Auto-refresh interval:</label>
          <div class="input-group">
            <input type="number" id="palia-refresh" value="${settings.refresh}" min="10" max="300">
            <span>seconds</span>
          </div>
        </div>
        
        <div class="form-group">
          <div class="section-title">Party Groups</div>
          ${groupCheckboxes}
        </div>
        
        <div class="form-group">
          <label>Notification History:</label>
          <div style="font-size: 12px; color: #718096; margin-bottom: 8px;">
            ${notifiedIds.size} parties already notified
          </div>
          <button class="save-button" id="palia-clear-history" style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); margin-bottom: 10px;">
            🗑️ Clear History
          </button>
        </div>
        
        <button class="save-button" id="palia-save">💾 Save Settings</button>
      `;
    document.body.appendChild(panel);

    toggleBtn.onclick = () => {
      const isVisible = panel.style.display === "block";
      panel.style.display = isVisible ? "none" : "block";
    };

    document.getElementById("palia-clear-history").onclick = async () => {
      if (
        confirm(
          "Are you sure you want to clear notification history? This will allow previously notified parties to be sent again."
        )
      ) {
        notifiedIds.clear();
        await saveNotifiedIds();

        // Show success feedback
        const button = document.getElementById("palia-clear-history");
        const originalText = button.textContent;
        button.textContent = "✅ Cleared!";
        button.style.background =
          "linear-gradient(135deg, #48bb78 0%, #38a169 100%)";

        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    };

    document.getElementById("palia-save").onclick = async () => {
      const notifyCheckbox = document.getElementById("palia-toggle");
      const refreshInput = document.getElementById("palia-refresh");

      settings.notify = notifyCheckbox.checked;
      settings.refresh = Math.max(
        10,
        Math.min(300, parseInt(refreshInput.value, 10) || 30)
      );

      // Update group settings
      Object.keys(PARTY_GROUPS).forEach(groupName => {
        const checkbox = document.getElementById(`group-${groupName}`);
        if (checkbox) {
          settings.groupSettings[groupName] = {
            enabled: checkbox.checked
          };
        }
      });

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
