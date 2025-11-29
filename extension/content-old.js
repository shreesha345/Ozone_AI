// Content script that runs on all web pages
console.log('OzoneAI extension content script loaded');

let isDragging = false;
let draggedContent = null;
let dragOverlay = null;

// Create a visual indicator when extension is active
function createExtensionIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'ozoneai-indicator';
  indicator.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="7 10 12 15 17 10"></polyline>
      <line x1="12" x2="12" y1="15" y2="3"></line>
    </svg>
    <span>OzoneAI Active</span>
  `;
  document.body.appendChild(indicator);
}

// Check if extension is enabled
chrome.storage.local.get(['extensionEnabled'], (result) => {
  if (result.extensionEnabled !== false) {
    createExtensionIndicator();
  }
});

// Listen for enable/disable messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleExtension') {
    const indicator = document.getElementById('ozoneai-indicator');
    if (request.enabled) {
      if (!indicator) createExtensionIndicator();
    } else {
      if (indicator) indicator.remove();
    }
  }
});

// Create drag overlay
function createDragOverlay() {
  if (dragOverlay) return dragOverlay;
  
  dragOverlay = document.createElement('div');
  dragOverlay.id = 'ozoneai-drag-overlay';
  dragOverlay.innerHTML = `
    <div class="ozoneai-drop-zone">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" x2="12" y1="15" y2="3"></line>
      </svg>
      <p>Drop here to send to OzoneAI</p>
    </div>
  `;
  document.body.appendChild(dragOverlay);
  return dragOverlay;
}

// Handle text selection drag
document.addEventListener('dragstart', (e) => {
  chrome.storage.local.get(['extensionEnabled'], (result) => {
    if (result.extensionEnabled === false) return;
    
    isDragging = true;
    
    // Get selected text
    const selection = window.getSelection();
    const selectedText = selection.toString();
    
    if (selectedText) {
      draggedContent = {
        type: 'text',
        content: selectedText,
        source: window.location.href
      };
    }
    
    // Handle image drag
    if (e.target.tagName === 'IMG') {
      draggedContent = {
        type: 'image',
        url: e.target.src,
        alt: e.target.alt || '',
        source: window.location.href
      };
    }
    
    // Show overlay after a short delay
    setTimeout(() => {
      if (isDragging) {
        createDragOverlay();
      }
    }, 200);
  });
});

document.addEventListener('drag', (e) => {
  if (isDragging && dragOverlay) {
    dragOverlay.style.display = 'flex';
  }
});

document.addEventListener('dragend', (e) => {
  isDragging = false;
  if (dragOverlay) {
    dragOverlay.style.display = 'none';
  }
});

// Handle drop on overlay
if (dragOverlay) {
  dragOverlay.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
  });

  dragOverlay.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedContent) {
      // Send to background script/storage
      chrome.storage.local.set({ 
        lastDroppedContent: draggedContent,
        droppedAt: Date.now()
      });
      
      // Send message to popup if open
      chrome.runtime.sendMessage({
        action: 'contentDropped',
        content: draggedContent
      });
      
      // Show success feedback
      const dropZone = dragOverlay.querySelector('.ozoneai-drop-zone');
      dropZone.classList.add('success');
      dropZone.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <p>Sent to OzoneAI!</p>
      `;
      
      setTimeout(() => {
        if (dragOverlay) {
          dragOverlay.style.display = 'none';
          dropZone.classList.remove('success');
          dropZone.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" x2="12" y1="15" y2="3"></line>
            </svg>
            <p>Drop here to send to OzoneAI</p>
          `;
        }
      }, 2000);
    }
    
    draggedContent = null;
    isDragging = false;
  });
}

// Re-attach drop listener after overlay is created
document.addEventListener('dragstart', () => {
  setTimeout(() => {
    const overlay = document.getElementById('ozoneai-drag-overlay');
    if (overlay && !overlay.hasAttribute('data-listener-attached')) {
      overlay.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
      });

      overlay.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (draggedContent) {
          chrome.storage.local.set({ 
            lastDroppedContent: draggedContent,
            droppedAt: Date.now()
          });
          
          chrome.runtime.sendMessage({
            action: 'contentDropped',
            content: draggedContent
          });
          
          const dropZone = overlay.querySelector('.ozoneai-drop-zone');
          dropZone.classList.add('success');
          dropZone.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <p>Sent to OzoneAI!</p>
          `;
          
          setTimeout(() => {
            overlay.style.display = 'none';
            dropZone.classList.remove('success');
            dropZone.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" x2="12" y1="15" y2="3"></line>
              </svg>
              <p>Drop here to send to OzoneAI</p>
            `;
          }, 2000);
        }
        
        draggedContent = null;
        isDragging = false;
      });
      
      overlay.setAttribute('data-listener-attached', 'true');
    }
  }, 250);
});
