// Background service worker
console.log('OzoneAI background service worker started');

// Initialize extension state
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    extensionEnabled: true,
    droppedItems: []
  });
  console.log('OzoneAI extension installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'contentDropped') {
    console.log('Content dropped:', request.content);
    
    // Store in history
    chrome.storage.local.get(['droppedItems'], (result) => {
      const items = result.droppedItems || [];
      items.unshift({
        ...request.content,
        timestamp: Date.now()
      });
      
      // Keep only last 50 items
      if (items.length > 50) {
        items.length = 50;
      }
      
      chrome.storage.local.set({ droppedItems: items });
    });
    
    // Send to OzoneAI web app if open
    chrome.tabs.query({ url: "http://localhost:8080/*" }, (tabs) => {
      if (tabs.length > 0) {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'receiveDroppedContent',
            content: request.content
          });
        });
      }
    });
    
    sendResponse({ success: true });
  }
  
  return true;
});

// Handle icon click
chrome.action.onClicked.addListener((tab) => {
  // Open OzoneAI if not already open
  chrome.tabs.query({ url: "http://localhost:8080/*" }, (tabs) => {
    if (tabs.length === 0) {
      chrome.tabs.create({ url: "http://localhost:8080/main" });
    } else {
      chrome.tabs.update(tabs[0].id, { active: true });
    }
  });
});
