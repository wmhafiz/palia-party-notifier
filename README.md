# 🎉 Palia Party Notifier - Discord Integration

A Chrome extension that monitors Palia party listings and sends rich Discord notifications when matching parties are found.

## ✨ Features

### 🔔 Discord Notifications

- **Rich Embed Messages**: Beautiful formatted notifications with party details
- **Duplicate Prevention**: Tracks notified parties to avoid spam
- **Smart Formatting**: Single party vs. multiple party notification formats
- **Direct Links**: Click to join parties directly from Discord

### 🎯 Smart Detection

- **Keyword Matching**: Customizable keywords (cake, epic, rare, etc.)
- **ID Extraction**: Automatically extracts party IDs from links
- **Location Detection**: Shows party location (Kilima Valley, Bahari Bay)
- **Title Parsing**: Uses both link titles and text content

### ⚙️ Settings Panel

- **Notification Toggle**: Enable/disable notifications
- **Keyword Management**: Add/remove keywords to watch for
- **Refresh Interval**: Configurable auto-refresh (10-300 seconds)
- **History Management**: Clear notification history to re-notify

## 🚀 Setup Instructions

### 1. Discord Webhook Setup

1. Go to your Discord server settings
2. Navigate to Integrations → Webhooks
3. Create a new webhook for your desired channel
4. Copy the webhook URL
5. Update the `DISCORD_WEBHOOK_URL` constant in `content.js`

### 2. Chrome Extension Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the extension folder
4. The extension will be active on Palia party pages

### 3. Configuration

1. Visit a Palia party listing page
2. Click the "⚙️ Settings" button (top right)
3. Configure your keywords and refresh interval
4. Save settings

## 📋 Discord Notification Format

### Single Party Match

```
🎉 Palia Party Match Found!
**EPIC CAKE PARTY 🍰 Join now!**

📍 Location: Kilima Valley
🆔 Party ID: epic123

🔗 Join Party
[Click here to join the party](https://example.com/epic123)
```

### Multiple Party Matches

```
🎊 Multiple Palia Party Matches!
Found 3 matching parties:

🎯 EPIC CAKE PARTY 🍰 Join now!
📍 Kilima Valley • 🆔 epic123 • [Join Party](https://example.com/epic123)

🎯 RARE FISH HUNTING 🐟 Legendary spots
📍 Bahari Bay • 🆔 rare456 • [Join Party](https://example.com/rare456)

🎯 PLUSHIE COLLECTION EVENT 🧸 Epic rewards
📍 Kilima Valley • 🆔 plushie789 • [Join Party](https://example.com/plushie789)
```

## 🔧 Technical Details

### File Structure

```
palia-party-notifier/
├── manifest.json          # Extension manifest
├── content.js            # Main content script with Discord integration
├── background.js         # Background script for notifications
├── test_discord.html     # Test page for development
├── example.html          # Example party page structure
└── icons/               # Extension icons
```

### Key Functions

#### `sendDiscordNotification(matches)`

- Sends formatted notifications to Discord webhook
- Handles both single and multiple party matches
- Includes rich embeds with party details

#### `getPartyDetails(element)`

- Extracts party information from DOM elements
- Gets ID, title, location, and URL
- Handles various HTML structures

#### `notifyUser(matches)`

- Filters out already notified parties
- Calls Discord notification function
- Provides fallback browser notifications

### Storage Management

- **Settings**: Stored in `chrome.storage.local`
- **Notification History**: Tracks notified party IDs
- **Persistent**: Survives browser restarts

## 🧪 Testing

### Using the Test Page

1. Open `test_discord.html` in your browser
2. Click "Load Content Script"
3. Configure keywords in settings
4. Test notifications with sample data

### Manual Testing

1. Visit actual Palia party pages
2. Monitor console logs for debugging
3. Check Discord channel for notifications
4. Verify duplicate prevention works

## 🎨 Customization

### Discord Webhook URL

```javascript
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/YOUR_WEBHOOK_URL";
```

### Default Keywords

```javascript
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
```

### Notification Colors

```javascript
color: 0x9f7aea, // Purple theme matching Palia
```

## 🐛 Troubleshooting

### Common Issues

**Discord notifications not working:**

- Check webhook URL is correct
- Verify Discord channel permissions
- Check browser console for errors

**Duplicate notifications:**

- Clear notification history in settings
- Check if party IDs are being extracted correctly

**Extension not loading:**

- Refresh the page
- Check Chrome extension is enabled
- Verify manifest.json is valid

### Debug Mode

Enable console logging to see detailed information:

```javascript
function log(...args) {
  console.log("[PaliaNotifier]", ...args);
}
```

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🔄 Version History

### v2.0.0 - Discord Integration

- Added Discord webhook notifications
- Implemented duplicate detection
- Enhanced party detail extraction
- Added rich embed formatting
- Improved settings UI

### v1.0.0 - Initial Release

- Basic browser notifications
- Keyword matching
- Auto-refresh functionality
- Settings panel
