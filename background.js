// Background script for handling notifications
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[PaliaNotifier Background] Received message:", request);

  if (request.action === "showNotification") {
    chrome.notifications.create(
      {
        type: "basic",
        iconUrl: "icon48.png",
        title: request.title,
        message: request.message,
      },
      (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error(
            "[PaliaNotifier Background] Notification error:",
            chrome.runtime.lastError
          );
        } else {
          console.log(
            "[PaliaNotifier Background] Notification created:",
            notificationId
          );
        }
      }
    );
  }

  // Don't call sendResponse to avoid message port issues
});
