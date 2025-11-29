// Popup script
const toggle = document.getElementById('toggle');
const status = document.getElementById('status');
const historyList = document.getElementById('historyList');
const openAppBtn = document.getElementById('openApp');

// Load initial state
chrome.storage.local.get(['extensionEnabled', 'droppedItems'], (result) => {
  const enabled = result.extensionEnabled !== false;
  updateToggleUI(enabled);
  updateHistory(result.droppedItems || []);
});

// Toggle extension
toggle.addEventListener('click', () => {
  chrome.storage.local.get(['extensionEnabled'], (result) => {
    const newState = !(result.extensionEnabled !== false);
    chrome.storage.local.set({ extensionEnabled: newState });
    updateToggleUI(newState);
    
    // Notify all tabs
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'toggleExtension',
          enabled: newState
        }).catch(() => {});
      });
    });
  });
});

function updateToggleUI(enabled) {
  if (enabled) {
    toggle.classList.add('active');
    status.textContent = 'Enabled';
  } else {
    toggle.classList.remove('active');
    status.textContent = 'Disabled';
  }
}

function updateHistory(items) {
  if (items.length === 0) {
    historyList.innerHTML = '<div class="empty-state">No items dropped yet</div>';
    return;
  }
  
  historyList.innerHTML = items.slice(0, 10).map(item => {
    const timeAgo = getTimeAgo(item.timestamp);
    let content = '';
    
    if (item.type === 'text') {
      content = item.content;
    } else if (item.type === 'image') {
      content = item.alt || item.url;
    }
    
    return `
      <div class="history-item" data-item='${JSON.stringify(item)}'>
        <div class="history-item-type">${item.type}</div>
        <div class="history-item-content">${escapeHtml(content)}</div>
        <div class="history-item-time">${timeAgo}</div>
      </div>
    `;
  }).join('');
  
  // Add click listeners
  historyList.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const item = JSON.parse(el.getAttribute('data-item'));
      sendToOzoneAI(item);
    });
  });
}

function getTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function sendToOzoneAI(item) {
  chrome.tabs.query({ url: "http://localhost:8080/*" }, (tabs) => {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'receiveDroppedContent',
        content: item
      });
      chrome.tabs.update(tabs[0].id, { active: true });
      window.close();
    } else {
      chrome.tabs.create({ 
        url: `http://localhost:8080/main?dropped=${encodeURIComponent(JSON.stringify(item))}` 
      });
      window.close();
    }
  });
}

// Open OzoneAI button
openAppBtn.addEventListener('click', () => {
  chrome.tabs.query({ url: "http://localhost:8080/*" }, (tabs) => {
    if (tabs.length === 0) {
      chrome.tabs.create({ url: "http://localhost:8080/main" });
    } else {
      chrome.tabs.update(tabs[0].id, { active: true });
    }
    window.close();
  });
});

// Listen for new drops
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'contentDropped') {
    chrome.storage.local.get(['droppedItems'], (result) => {
      updateHistory(result.droppedItems || []);
    });
  }
});

// Refresh history every 5 seconds
setInterval(() => {
  chrome.storage.local.get(['droppedItems'], (result) => {
    updateHistory(result.droppedItems || []);
  });
}, 5000);
