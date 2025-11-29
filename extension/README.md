# OzoneAI Chrome Extension

## Installation Instructions

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right corner)
3. Click "Load unpacked"
4. Select the `extension` folder
5. The OzoneAI extension icon should appear in your toolbar

## How to Use

1. Visit any website with content you want to analyze
2. **Drag ANY content** - text, links, images, social media posts, blog articles
3. A floating **AI chatbot** appears on the right side of your screen
4. **Drop the content** into the chatbot
5. The AI assistant starts a conversation about your dropped content
6. Continue chatting, asking questions, or drop more content

## Universal Drag & Drop Support

The extension intelligently captures **ANY content type**:

- ✍️ **Text** - Selected text from any webpage
- 🔗 **Links** - URLs, article links, navigation items
- 🖼️ **Images** - Photos, graphics, screenshots
- 📱 **Social Media Posts** - Twitter/X, LinkedIn, Facebook, Instagram, WhatsApp
- 📰 **Blog Articles** - Medium, Substack, personal blogs
- 💬 **Comments** - Discussion threads, reviews
- 📄 **Content Blocks** - Paragraphs, divs, sections

## Features

- 🎨 **Professional UI** - Modern design with smooth animations and rounded corners
- 💬 **AI Chatbot Interface** - Perplexity-style conversation UI
- 📝 **Chat History** - Persistent conversations stored locally
- 🎯 **Smart Content Detection** - Automatically recognizes content types
- ✨ **Visual Feedback** - Animated drop zones and status indicators
- 🚀 **Instant Response** - Real-time AI chat experience

## Development

The extension consists of:
- `manifest.json` - Extension configuration
- `content.js` - Script that runs on all webpages
- `content.css` - Styles for the drag overlay
- `background.js` - Background service worker
- `popup.html` - Extension popup interface
- `popup.js` - Popup functionality

## Permissions

- `activeTab` - To interact with the current webpage
- `storage` - To store dropped content and settings
- `<all_urls>` - To work on any website
