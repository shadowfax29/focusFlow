// Default blocked sites
const DEFAULT_BLOCKED_SITES = [
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'reddit.com',
  'youtube.com'
];

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize settings
  chrome.storage.local.set({
    isBlocking: false,
    blockedSites: DEFAULT_BLOCKED_SITES
  });
});

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'startBlocking') {
    enableBlocking();
  } else if (message.action === 'stopBlocking') {
    disableBlocking();
  }
});

// Function to enable website blocking
function enableBlocking() {
  chrome.storage.local.get(['blockedSites'], function(result) {
    const sites = result.blockedSites || DEFAULT_BLOCKED_SITES;
    
    // Set up blocking rules (simplified implementation)
    // In a real extension, this would use declarativeNetRequest to block navigation
    console.log('Blocking enabled for sites:', sites);
    
    // This is where we would implement actual blocking logic
    // For this demo, we're just storing the state
  });
}

// Function to disable website blocking
function disableBlocking() {
  // Remove all blocking rules
  console.log('Blocking disabled');
  
  // This is where we would remove the blocking rules
}

// Listen for navigation to blocked sites when blocking is active
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  chrome.storage.local.get(['isBlocking', 'blockedSites'], function(result) {
    if (!result.isBlocking) return;
    
    const url = new URL(details.url);
    const hostname = url.hostname;
    
    // Check if the hostname matches any blocked site
    const blockedSites = result.blockedSites || DEFAULT_BLOCKED_SITES;
    const isBlocked = blockedSites.some(site => hostname.includes(site));
    
    if (isBlocked) {
      // In a real extension, we would block the navigation here
      // or redirect to a "site blocked" page
      console.log('Blocked navigation to:', hostname);
      
      // For this demo, we'll just log the blocked attempt
      // Actual blocking would use chrome.declarativeNetRequest
    }
  });
});