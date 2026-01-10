// PlanScope Background Service Worker
// Handles extension lifecycle and message passing

chrome.runtime.onInstalled.addListener(() => {
  console.log('PlanScope extension installed');
});

// Handle messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TAB_INFO') {
    sendResponse({ tabId: sender.tab?.id, url: sender.tab?.url });
  }
  return true;
});

export {};
