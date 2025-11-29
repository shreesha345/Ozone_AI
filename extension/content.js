/**
 * OzoneAI Browser Extension - Content Script
 * 
 * Enables drag-and-drop functionality on all web pages, capturing text, images, links,
 * and social media posts. Creates a floating chatbot interface for immediate analysis.
 * Runs on all web pages and detects content from Twitter, LinkedIn, Facebook, WhatsApp, etc.
 */
let isEnabled = true;
let draggedContent = null;
let floatingChatbot = null;

// Check if extension is enabled
chrome.storage.local.get(['extensionEnabled'], (result) => {
  isEnabled = result.extensionEnabled !== false;
  if (isEnabled) {
    showIndicator();
  }
});

// Listen for extension toggle
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'EXTENSION_TOGGLED') {
    isEnabled = message.enabled;
    if (isEnabled) {
      showIndicator();
    } else {
      hideIndicator();
      hideFloatingChatbot();
    }
  }
  // respond to popup asking for the currently selected text
  if (message.type === 'GET_SELECTION') {
    const selection = window.getSelection().toString().trim();
    const response = {
      selection: selection || null,
      metadata: {
        url: window.location.href,
        title: document.title,
        timestamp: Date.now()
      }
    };
    // send synchronous response
    if (message.requestId && chrome.runtime && chrome.runtime.sendMessage) {
      // not using sendResponse here because popup sends via tabs.sendMessage
    }
    return Promise.resolve(response);
  }
});

// Show indicator
function showIndicator() {
  if (document.getElementById('ozoneai-indicator')) return;
  
  const indicator = document.createElement('div');
  indicator.id = 'ozoneai-indicator';
  indicator.innerHTML = '🌐 OzoneAI Active';
  document.body.appendChild(indicator);
}

// Hide indicator
function hideIndicator() {
  const indicator = document.getElementById('ozoneai-indicator');
  if (indicator) indicator.remove();
}

// Create floating chatbot
function createFloatingChatbot() {
  if (floatingChatbot) return floatingChatbot;
  
  const chatbot = document.createElement('div');
  chatbot.id = 'ozoneai-floating-chatbot';
  chatbot.innerHTML = `
    <div class="chatbot-header">
      <div class="chatbot-logo google-font-style">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="10" opacity="0.2"/>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
        <span>OzoneAI</span>
      </div>
      <div class="chatbot-actions">
        <button class="goto-ozone-btn" id="goto-ozone">
          Open App
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </button>
        <button class="chatbot-close" id="chatbot-close">×</button>
      </div>
    </div>
    <div class="chatbot-messages" id="chatbot-messages">
      <div class="chatbot-empty">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h3>Drag & Drop Anything</h3>
        <p>Text • Links • Images • Posts<br>WhatsApp • LinkedIn • Twitter • Blogs</p>
        <div class="empty-hint">Start by dragging content from any webpage</div>
      </div>
    </div>
    <div class="chatbot-input-container">
      <div class="chatbot-input-wrapper">
        <textarea 
          class="chatbot-input" 
          id="chatbot-input" 
          placeholder="Drop content here or ask anything..."
          rows="1"
        ></textarea>
        <button class="chatbot-send" id="chatbot-send" disabled>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(chatbot);
  floatingChatbot = chatbot;
  
  // Set up event listeners
  document.getElementById('chatbot-close').addEventListener('click', hideFloatingChatbot);
  
  document.getElementById('goto-ozone').addEventListener('click', () => {
    window.open('http://localhost:8080/', '_blank');
  });
  
  const input = document.getElementById('chatbot-input');
  const sendBtn = document.getElementById('chatbot-send');
  
  input.addEventListener('input', () => {
    sendBtn.disabled = !input.value.trim();
    input.style.height = 'auto';
    input.style.height = input.scrollHeight + 'px';
  });
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) {
        sendChatMessage();
      }
    }
  });
  
  sendBtn.addEventListener('click', sendChatMessage);
  
  return chatbot;
}

// Show floating chatbot
function showFloatingChatbot() {
  const chatbot = createFloatingChatbot();
  chatbot.style.display = 'flex';
  
  // Animate in
  setTimeout(() => {
    chatbot.style.transform = 'translateX(0)';
    chatbot.style.opacity = '1';
  }, 10);
}

// Hide floating chatbot
function hideFloatingChatbot() {
  if (floatingChatbot) {
    floatingChatbot.style.transform = 'translateX(100%)';
    floatingChatbot.style.opacity = '0';
    setTimeout(() => {
      floatingChatbot.style.display = 'none';
    }, 300);
  }
}

// Add message to chatbot with image support
function addChatMessage(role, content, imageUrl = null) {
  const messagesContainer = document.getElementById('chatbot-messages');
  const empty = messagesContainer.querySelector('.chatbot-empty');
  if (empty) empty.remove();
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chatbot-message ${role}`;
  
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  let contentHtml = '';
  if (imageUrl) {
    contentHtml = `
      <div class="message-image-preview">
        <img src="${imageUrl}" alt="Dropped image" />
      </div>
      ${content ? `<div class="message-text">${escapeHtml(content)}</div>` : ''}
    `;
  } else {
    contentHtml = escapeHtml(content);
  }
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${role === 'assistant' ? '🤖' : '👤'}</div>
    <div class="message-content">
      ${contentHtml}
      <div class="message-time">${time}</div>
    </div>
  `;
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show typing indicator
function showTypingIndicator() {
  const messagesContainer = document.getElementById('chatbot-messages');
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chatbot-message assistant';
  typingDiv.id = 'typing-indicator';
  typingDiv.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hide typing indicator
function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

// Send chat message
function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  const content = input.value.trim();
  if (!content) return;
  
  addChatMessage('user', content);
  input.value = '';
  input.style.height = 'auto';
  document.getElementById('chatbot-send').disabled = true;
  
  // Show typing
  showTypingIndicator();
  
  // Simulate AI response
  setTimeout(() => {
    hideTypingIndicator();
    addChatMessage('assistant', `I received your message. This is a demo response. In production, I would process this with AI.`);
  }, 1500);
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Enhanced content capture for ANY dragged element
function captureContent(element) {
  // Priority 1: Selected text
  const selection = window.getSelection().toString().trim();
  if (selection) {
    return {
      type: 'text',
      content: selection,
      metadata: {
        source: window.location.href,
        title: document.title,
        timestamp: Date.now()
      }
    };
  }
  
  // Priority 2: Images
  if (element.tagName === 'IMG') {
    return {
      type: 'image',
      content: element.src,
      metadata: {
        alt: element.alt,
        source: window.location.href,
        title: document.title,
        timestamp: Date.now()
      }
    };
  }
  
  // Priority 3: Links (a, posts, articles)
  if (element.tagName === 'A' || element.closest('a')) {
    const link = element.tagName === 'A' ? element : element.closest('a');
    return {
      type: 'link',
      content: link.href,
      metadata: {
        text: link.textContent.trim(),
        source: window.location.href,
        title: document.title,
        timestamp: Date.now()
      }
    };
  }
  
  // Priority 4: Article/Post content (LinkedIn, Twitter, Facebook, WhatsApp, etc.)
  const post = element.closest('article, [role="article"], .post, [data-testid*="post"], [data-testid*="tweet"]');
  if (post) {
    const text = post.textContent.trim();
    const images = Array.from(post.querySelectorAll('img')).map(img => img.src).filter(src => src);
    const links = Array.from(post.querySelectorAll('a')).map(a => a.href).filter(href => href);
    
    return {
      type: 'post',
      content: text,
      metadata: {
        images: images.slice(0, 5),
        links: links.slice(0, 5),
        source: window.location.href,
        title: document.title,
        platform: detectPlatform(),
        timestamp: Date.now()
      }
    };
  }
  
  // Priority 5: Any container with text content
  if (element.textContent && element.textContent.trim().length > 0) {
    return {
      type: 'content',
      content: element.textContent.trim(),
      metadata: {
        tagName: element.tagName,
        source: window.location.href,
        title: document.title,
        timestamp: Date.now()
      }
    };
  }
  
  return null;
}

// Detect social media platform
function detectPlatform() {
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'Twitter/X';
  if (hostname.includes('linkedin.com')) return 'LinkedIn';
  if (hostname.includes('facebook.com')) return 'Facebook';
  if (hostname.includes('instagram.com')) return 'Instagram';
  if (hostname.includes('whatsapp.com') || hostname.includes('web.whatsapp.com')) return 'WhatsApp';
  if (hostname.includes('reddit.com')) return 'Reddit';
  if (hostname.includes('medium.com')) return 'Medium';
  return 'Web';
}

// Format content for display (returns object with text and imageUrl)
function formatContent(data) {
  switch (data.type) {
    case 'text':
      return { text: data.content, imageUrl: null };
    
    case 'image':
      return { 
        text: data.metadata.alt || 'Shared an image', 
        imageUrl: data.content 
      };
    
    case 'link':
      return { 
        text: `🔗 Link\n${data.metadata.text}\n\n${data.content}`, 
        imageUrl: null 
      };
    
    case 'post':
      let formatted = `📱 ${data.metadata.platform} Post\n\n${data.content}`;
      if (data.metadata.images && data.metadata.images.length > 0) {
        formatted += `\n\n📷 ${data.metadata.images.length} image(s)`;
      }
      if (data.metadata.links && data.metadata.links.length > 0) {
        formatted += `\n🔗 ${data.metadata.links.length} link(s)`;
      }
      return { text: formatted, imageUrl: data.metadata.images?.[0] || null };
    
    case 'content':
      return { 
        text: `📄 ${data.metadata.tagName}\n\n${data.content.substring(0, 500)}${data.content.length > 500 ? '...' : ''}`, 
        imageUrl: null 
      };
    
    default:
      return { text: data.content, imageUrl: null };
  }
}

// Drag event listeners
document.addEventListener('dragstart', (e) => {
  if (!isEnabled) return;
  
  // Capture dragged content with enhanced detection
  draggedContent = captureContent(e.target);
  
  // Show floating chatbot after a short delay
  setTimeout(() => {
    if (draggedContent) {
      showFloatingChatbot();
    }
  }, 200);
});

// Auto-open when dragging near edge
document.addEventListener('dragover', (e) => {
  if (!isEnabled) return;
  
  // If dragging something and near the right edge (within 50px)
  if (e.clientX > window.innerWidth - 50) {
    showFloatingChatbot();
  }
  
  const chatbot = document.getElementById('ozoneai-floating-chatbot');
  if (chatbot && chatbot.contains(e.target)) {
    e.preventDefault();
    chatbot.classList.add('drag-over');
  }
});

document.addEventListener('dragend', () => {
  draggedContent = null;
});

// Drop handler for floating chatbot
document.addEventListener('drop', (e) => {
  if (!isEnabled) return;
  
  const chatbot = document.getElementById('ozoneai-floating-chatbot');
  if (chatbot && chatbot.contains(e.target)) {
    e.preventDefault();
    
    // If no draggedContent, try to get from dataTransfer
    if (!draggedContent) {
      const text = e.dataTransfer.getData('text/plain');
      const url = e.dataTransfer.getData('text/uri-list');
      
      if (url) {
        draggedContent = {
          type: 'link',
          content: url,
          metadata: {
            text: text || url,
            source: window.location.href,
            timestamp: Date.now()
          }
        };
      } else if (text) {
        draggedContent = {
          type: 'text',
          content: text,
          metadata: {
            source: window.location.href,
            timestamp: Date.now()
          }
        };
      }
    }
    
    if (draggedContent) {
      // Format and add content as message
      const { text, imageUrl } = formatContent(draggedContent);
      addChatMessage('user', text, imageUrl);
      
      // Store in chrome storage
      chrome.runtime.sendMessage({
        type: 'CONTENT_DROPPED',
        data: draggedContent
      });
      
      // Show typing and respond
      showTypingIndicator();
      setTimeout(() => {
        hideTypingIndicator();
        const typeLabel = draggedContent.type === 'post' ? `${draggedContent.metadata.platform} post` : draggedContent.type;
        addChatMessage('assistant', `I received your ${typeLabel}. How can I help you analyze or work with this content?`);
      }, 1000);
      
      draggedContent = null;
    }
    
    // Remove drag-over state
    chatbot.classList.remove('drag-over');
  }
});

document.addEventListener('dragover', (e) => {
  // Handled in the combined listener above
});

document.addEventListener('dragleave', (e) => {
  const chatbot = document.getElementById('ozoneai-floating-chatbot');
  if (chatbot && e.target === chatbot) {
    chatbot.classList.remove('drag-over');
  }
});
