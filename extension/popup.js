/**
 * OzoneAI Browser Extension - Popup Interface
 * 
 * Provides the main chatbot interface in the extension popup with chat history,
 * message handling, and real-time analysis display. Communicates with content scripts
 * to receive dropped content and display analysis results.
 */
let currentChatId = Date.now().toString();
let messages = [];
let isTyping = false;

const messagesContainer = document.getElementById('messagesContainer');
const emptyState = document.getElementById('emptyState');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const historyBtn = document.getElementById('historyBtn');

// Load chat history
function loadChat() {
  chrome.storage.local.get(['currentChat', 'chatHistory'], (result) => {
    if (result.currentChat && result.currentChat.messages && result.currentChat.messages.length > 0) {
      messages = result.currentChat.messages;
      currentChatId = result.currentChat.id;
      renderMessages();
    }
  });
}

// Render messages
function renderMessages() {
  if (messages.length === 0) {
    emptyState.style.display = 'flex';
    return;
  }
  
  emptyState.style.display = 'none';
  
  messagesContainer.innerHTML = messages.map(msg => {
    const time = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Check if content is HTML (image preview) or text
    let contentHtml = '';
    if (msg.content.startsWith('<div class="message-image-preview">')) {
      contentHtml = msg.content; // Already HTML
    } else {
      contentHtml = escapeHtml(msg.content);
    }

    return `
      <div class="message ${msg.role}">
        <div class="message-avatar">
          ${msg.role === 'assistant' ? '🤖' : '👤'}
        </div>
        <div class="message-content">
          ${contentHtml}
          <div class="message-time">${time}</div>
        </div>
      </div>
    `;
  }).join('');
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Show typing indicator
function showTyping() {
  if (isTyping) return;
  isTyping = true;
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message assistant';
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
function hideTyping() {
  isTyping = false;
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

// Add message
function addMessage(role, content) {
  const message = {
    role,
    content,
    timestamp: Date.now()
  };
  
  messages.push(message);
  saveChat();
  renderMessages();
}

// Save chat
function saveChat() {
  const chat = {
    id: currentChatId,
    messages,
    lastUpdated: Date.now()
  };
  
  chrome.storage.local.set({ currentChat: chat });
  
  // Also save to history
  chrome.storage.local.get(['chatHistory'], (result) => {
    const history = result.chatHistory || [];
    const existingIndex = history.findIndex(c => c.id === currentChatId);
    
    if (existingIndex >= 0) {
      history[existingIndex] = chat;
    } else {
      history.unshift(chat);
    }
    
    // Keep last 50 chats
    chrome.storage.local.set({ chatHistory: history.slice(0, 50) });
  });
}

// Send message
async function sendMessage() {
  const content = messageInput.value.trim();
  if (!content) return;
  
  // Add user message
  addMessage('user', content);
  messageInput.value = '';
  messageInput.style.height = 'auto';
  sendBtn.disabled = true;
  
  // Show typing
  showTyping();
  
  // Simulate AI response (you can replace this with actual API call)
  setTimeout(() => {
    hideTyping();
    addMessage('assistant', `I received your message: "${content}". This is a demo response. In production, I would process this with AI and provide a helpful answer.`);
  }, 1500);
}

// New chat
newChatBtn.addEventListener('click', () => {
  currentChatId = Date.now().toString();
  messages = [];
  emptyState.style.display = 'flex';
  messagesContainer.innerHTML = '';
  messagesContainer.appendChild(emptyState);
  messageInput.value = '';
  saveChat();
});

// History button
historyBtn.addEventListener('click', () => {
  chrome.storage.local.get(['chatHistory'], (result) => {
    const history = result.chatHistory || [];
    if (history.length === 0) {
      alert('No chat history yet!');
    } else {
      // In a real implementation, show a history sidebar
      const titles = history.map((chat, i) => 
        `${i + 1}. ${new Date(chat.lastUpdated).toLocaleString()} (${chat.messages.length} messages)`
      ).join('\n');
      alert('Chat History:\n\n' + titles);
    }
  });
});

// Input handling
messageInput.addEventListener('input', () => {
  sendBtn.disabled = !messageInput.value.trim();
  
  // Auto-resize textarea
  messageInput.style.height = 'auto';
  messageInput.style.height = messageInput.scrollHeight + 'px';
});

messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (!sendBtn.disabled) {
      sendMessage();
    }
  }
});

sendBtn.addEventListener('click', sendMessage);

// Listen for dropped content from content script
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'CONTENT_DROPPED') {
    const { data } = message;
    
    let content = '';
    if (data.type === 'image') {
      content = `<div class="message-image-preview"><img src="${data.content}" alt="${data.metadata?.alt || 'Dropped image'}" /></div>${data.metadata?.alt ? `<div class="message-text">${data.metadata.alt}</div>` : ''}`;
    } else {
      content = data.content;
    }
    
    // Add as user message
    addMessage('user', content);
    
    // Show typing and respond
    showTyping();
    setTimeout(() => {
      hideTyping();
      addMessage('assistant', `I received your ${data.type}. How can I help you with this?`);
    }, 1000);
    // Also run a quick analysis render in the popup UI if present
    try {
      const textForAnalysis = data.type === 'image' ? (data.metadata?.alt || 'Image dropped') : (data.content || '');
      const analysis = analyzeTextForUI(textForAnalysis);
      renderAnalysisToUI(analysis);
    } catch (e) {
      // ignore
    }
  }
});

// Request selection from active tab when popup opens, and render analysis if available
function requestSelectionFromActiveTab() {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: 'GET_SELECTION' }, (response) => {
        if (chrome.runtime.lastError) {
          // no content script in page
          return;
        }
        if (response && response.selection) {
          // populate input and render analysis
          messageInput.value = response.selection;
          sendBtn.disabled = !messageInput.value.trim();
          const analysis = analyzeTextForUI(response.selection);
          renderAnalysisToUI(analysis);
        }
      });
    });
  } catch (e) {
    console.error('Selection request failed', e);
  }
}

// Simple heuristic analyzer for UI demo purposes
function analyzeTextForUI(text) {
  const len = text ? text.length : 0;
  // crude credibility score heuristic
  let base = 60;
  base += Math.min(30, Math.floor(len / 20));
  if (/\b(https?:\/\/|www\.)/i.test(text)) base += 10;
  if (/\b(news|report|study|gov|official|data|statistics)\b/i.test(text)) base += 10;
  if (/\b(opinion|i think|imo|feel)\b/i.test(text)) base -= 15;
  const credibility = Math.max(10, Math.min(99, base));

  // deepfake heuristic: if image words present, small chance otherwise low
  let deepfakePercent = 2;
  if (/photo|image|picture|video|frame|gif/i.test(text)) deepfakePercent = Math.min(8, Math.max(1, Math.floor(len / 200)));

  // bias assessment (very basic)
  const bias = /\b(right|conservative)\b/i.test(text) ? 'Right' : (/\b(left|liberal)\b/i.test(text) ? 'Left' : 'Neutral / Balanced Reporting');

  // key claims: pick up to 3 sentence fragments
  const sentences = text.split(/[\.\?\!]\s+/).map(s => s.trim()).filter(Boolean);
  const claims = sentences.slice(0, 3).map(s => ({ text: s, verified: /\b(gov|official|report|data|study)\b/i.test(s) }));

  return {
    credibility,
    credibilityLabel: credibility > 85 ? 'Very High' : (credibility > 65 ? 'High' : (credibility > 45 ? 'Medium' : 'Low')),
    credibilityDesc: sentences[0] ? (sentences[0].slice(0, 80) + (sentences[0].length > 80 ? '...' : '')) : 'No content',
    bias,
    claims,
    deepfakePercent,
    deepfakeLabel: deepfakePercent < 5 ? 'Authentic Media' : 'Possibly Edited',
  };
}

// Render analysis into the popup dashboard elements
function renderAnalysisToUI(analysis) {
  try {
    const credEl = document.getElementById('credibilityPercent');
    const pill = document.getElementById('credibilityPill');
    const desc = document.getElementById('credibilityDesc');
    const claim = document.getElementById('credibilityClaim');
    const deepP = document.getElementById('deepfakePercent');
    const deepL = document.getElementById('deepfakeLabel');

    if (credEl) credEl.textContent = `${analysis.credibility}%`;
    if (pill) pill.textContent = analysis.credibilityLabel;
    if (desc) desc.textContent = analysis.credibilityDesc;
    if (claim) claim.textContent = analysis.claims && analysis.claims[0] ? (analysis.claims[0].verified ? 'Key claims verified' : analysis.claims[0].text) : '';
    if (deepP) deepP.textContent = (analysis.deepfakePercent < 1 ? '<1%' : `${analysis.deepfakePercent}%`);
    if (deepL) deepL.textContent = analysis.deepfakeLabel;

    // mark that we have analysis: hide chat empty state styling
    const empty = document.getElementById('emptyState');
    if (empty) empty.style.display = 'block';
  } catch (e) {
    console.error('renderAnalysisToUI failed', e);
  }
}

// Initialize
loadChat();
// Ask the active tab for any selected text when popup opens
requestSelectionFromActiveTab();
