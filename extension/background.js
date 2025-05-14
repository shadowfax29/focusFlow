// Default blocked sites as fallback
const DEFAULT_BLOCKED_SITES = [
  'facebook.com',
  'twitter.com',
  'instagram.com',
  'reddit.com',
  'youtube.com'
];

// FocusFlow app API connection
const API_BASE_URL = 'http://localhost:5000';
let authToken = null;

// Timer state
let timerState = {
  isRunning: false,
  timerMode: 'focus', // 'focus', 'shortBreak', 'longBreak'
  secondsRemaining: 25 * 60, // Default to 25 minutes in seconds
  totalSeconds: 25 * 60,
  currentPomodoro: 1,
  totalPomodoros: 4,
  activeSessionId: null,
  lastSyncTime: null
};

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  // Initialize settings
  chrome.storage.local.set({
    isBlocking: false,
    blockedSites: DEFAULT_BLOCKED_SITES,
    appConnected: false,
    focusflowUrl: API_BASE_URL,
    timerState: timerState
  });
});

// Function to connect to FocusFlow account
async function connectToFocusFlow(username, password) {
  try {
    console.log(`Attempting to connect to FocusFlow at ${API_BASE_URL}`);

    // Login to FocusFlow
    console.log('Sending login request with credentials:', { username, password: '***' });

    let userData = null;
    let tokenData = null;

    try {
      // Step 1: Login to get session cookie
      const loginResponse = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include' // Important: include cookies for session
      });

      console.log('Login response status:', loginResponse.status);
      console.log('Login response headers:', Object.fromEntries([...loginResponse.headers.entries()]));

      // Check if the response is JSON
      const contentType = loginResponse.headers.get('content-type');
      console.log('Content-Type:', contentType);

      let responseText = await loginResponse.text();
      console.log('Response text (first 100 chars):', responseText.substring(0, 100));

      if (!contentType || !contentType.includes('application/json')) {
        console.error('Login response is not JSON:', responseText);
        throw new Error('Login failed: Server returned non-JSON response');
      }

      // Parse the JSON response
      try {
        userData = JSON.parse(responseText);
        console.log('Parsed user data:', userData);
      } catch (jsonError) {
        console.error('Error parsing JSON:', jsonError);
        console.error('Response that failed to parse:', responseText);
        throw new Error('Login failed: Invalid JSON response');
      }

      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${userData.message || 'Unknown error'}`);
      }

      // Login successful
      console.log('Login successful:', userData);

      // Step 2: Get token for extension
      console.log('Requesting extension token...');
      const tokenResponse = await fetch(`${API_BASE_URL}/api/extension/token`, {
        method: 'POST',
        credentials: 'include' // Important: include cookies for session
      });

      console.log('Token response status:', tokenResponse.status);

      if (!tokenResponse.ok) {
        throw new Error('Failed to get extension token: Server returned error');
      }

      // Parse the JSON response
      tokenData = await tokenResponse.json();
      console.log('Received token data:', tokenData);

    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }

    console.log('Token received:', tokenData);

    if (!tokenData || !tokenData.token) {
      throw new Error('Token response did not contain a token');
    }

    // Save token and connection state
    authToken = tokenData.token;
    chrome.storage.local.set({
      authToken: tokenData.token,
      appConnected: true,
      username: username
    });

    // Sync blocked sites
    console.log('Syncing blocked sites...');
    await syncBlockedSites();

    return { success: true };
  } catch (error) {
    console.error('Error connecting to FocusFlow:', error);
    return { success: false, error: error.message };
  }
}

// Function to sync blocked sites from FocusFlow app
async function syncBlockedSites() {
  try {
    // Check if we have an auth token
    if (!authToken) {
      const data = await chrome.storage.local.get(['authToken']);
      authToken = data.authToken;

      if (!authToken) {
        throw new Error('Not authenticated with FocusFlow');
      }
    }

    console.log(`Fetching blocked sites from ${API_BASE_URL}/api/extension/blocked-sites`);
    console.log('Using auth token:', authToken.substring(0, 10) + '...');

    try {
      // Fetch blocked sites from API
      const response = await fetch(`${API_BASE_URL}/api/extension/blocked-sites`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include' // Include cookies for session
      });

      console.log('Blocked sites response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch blocked sites: ${response.status} ${response.statusText}`);
      }

      // Parse the JSON response
      const blockedSites = await response.json();
      console.log('Received blocked sites:', blockedSites);

      // Extract domains and update storage
      if (!Array.isArray(blockedSites)) {
        console.error('Blocked sites is not an array:', blockedSites);
        throw new Error('Failed to fetch blocked sites: Invalid response format');
      }

      const domains = blockedSites.map(site => site.domain);
      console.log('Extracted domains:', domains);

      await chrome.storage.local.set({ blockedSites: domains });
      console.log('Blocked sites saved to storage');

      return domains;
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('Error syncing blocked sites:', error);
    // Fallback to locally stored sites
    const data = await chrome.storage.local.get(['blockedSites']);
    console.log('Falling back to stored sites:', data.blockedSites || DEFAULT_BLOCKED_SITES);
    return data.blockedSites || DEFAULT_BLOCKED_SITES;
  }
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'startBlocking') {
    enableBlocking();
  } else if (message.action === 'stopBlocking') {
    disableBlocking();
  } else if (message.action === 'connectAccount') {
    connectToFocusFlow(message.username, message.password)
      .then(sendResponse);
    return true; // Keep the message channel open for the async response
  } else if (message.action === 'syncBlockedSites') {
    syncBlockedSites()
      .then(sendResponse);
    return true; // Keep the message channel open for the async response
  } else if (message.action === 'getConnectionStatus') {
    chrome.storage.local.get(['appConnected', 'username'], sendResponse);
    return true;
  } else if (message.action === 'getTimerState') {
    chrome.storage.local.get(['timerState'], sendResponse);
    return true;
  } else if (message.action === 'syncTimerStatus') {
    syncTimerStatus()
      .then(sendResponse);
    return true; // Keep the message channel open for the async response
  }
});

// Function to enable website blocking
async function enableBlocking() {
  // Try to sync sites first if connected to FocusFlow
  try {
    const { appConnected } = await chrome.storage.local.get(['appConnected']);
    if (appConnected) {
      await syncBlockedSites();
    }
  } catch (error) {
    console.error('Error syncing before blocking:', error);
  }

  // Get blocked sites (either synced or from local storage)
  const { blockedSites } = await chrome.storage.local.get(['blockedSites']);
  const sites = blockedSites || DEFAULT_BLOCKED_SITES;

  // Set up blocking rules
  console.log('Blocking enabled for sites:', sites);

  // Update blocking state
  await chrome.storage.local.set({ isBlocking: true });

  // In a complete implementation, this would set up declarativeNetRequest rules
}

// Function to disable website blocking
async function disableBlocking() {
  // Remove all blocking rules
  console.log('Blocking disabled');

  // Update blocking state
  await chrome.storage.local.set({ isBlocking: false });

  // In a complete implementation, this would remove declarativeNetRequest rules
}

// Function to sync timer status with the app
async function syncTimerStatus() {
  try {
    // Check if we have an auth token
    if (!authToken) {
      const data = await chrome.storage.local.get(['authToken']);
      authToken = data.authToken;

      if (!authToken) {
        throw new Error('Not authenticated with FocusFlow');
      }
    }

    console.log(`Fetching timer status from ${API_BASE_URL}/api/extension/timer-status`);

    try {
      // Fetch timer status from API
      const response = await fetch(`${API_BASE_URL}/api/extension/timer-status`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        credentials: 'include' // Include cookies for session
      });

      console.log('Timer status response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch timer status: ${response.status} ${response.statusText}`);
      }

      // Parse the JSON response
      const timerData = await response.json();
      console.log('Received timer status:', timerData);

      // Update timer state
      updateTimerState(timerData);

      return timerData;
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error: ${fetchError.message}`);
    }
  } catch (error) {
    console.error('Error syncing timer status:', error);
    return null;
  }
}

// Function to update timer state based on server data
function updateTimerState(timerData) {
  console.log('Updating timer state with data:', timerData);

  // Ensure we have valid data
  if (!timerData) {
    console.error('Invalid timer data received');
    return;
  }

  const { activeSession, timerSettings, serverTime } = timerData;

  // Ensure we have timer settings
  const settings = timerSettings || {
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    pomodorosUntilLongBreak: 4
  };

  // If there's no active session, reset timer state
  if (!activeSession) {
    console.log('No active session, resetting timer state');

    // Calculate default values based on settings
    const focusSeconds = settings.focusMinutes * 60;

    timerState = {
      isRunning: false,
      timerMode: 'focus',
      secondsRemaining: focusSeconds,
      totalSeconds: focusSeconds,
      currentPomodoro: 1,
      totalPomodoros: settings.pomodorosUntilLongBreak,
      activeSessionId: null,
      lastSyncTime: new Date()
    };

    console.log('New timer state (no active session):', timerState);

    // Update storage
    chrome.storage.local.set({ timerState });

    // Make sure blocking is disabled
    disableBlocking();

    return;
  }

  console.log('Active session found:', activeSession);

  // Calculate time elapsed since session start
  const sessionStartTime = new Date(activeSession.startTime);
  const serverTimeObj = new Date(serverTime);
  const elapsedSeconds = Math.floor((serverTimeObj - sessionStartTime) / 1000);

  console.log('Session start time:', sessionStartTime);
  console.log('Server time:', serverTimeObj);
  console.log('Elapsed seconds:', elapsedSeconds);

  // Calculate remaining time based on session duration
  const totalDuration = activeSession.plannedDuration; // in seconds
  const remainingSeconds = Math.max(0, totalDuration - elapsedSeconds);

  console.log('Total duration:', totalDuration);
  console.log('Remaining seconds:', remainingSeconds);

  // Update timer state
  timerState = {
    isRunning: true,
    timerMode: 'focus',
    secondsRemaining: remainingSeconds,
    totalSeconds: totalDuration,
    currentPomodoro: 1, // This would need more logic to determine the current pomodoro
    totalPomodoros: activeSession.pomodorosPlanned || 4,
    activeSessionId: activeSession.id,
    lastSyncTime: new Date()
  };

  console.log('New timer state (active session):', timerState);

  // Update storage
  chrome.storage.local.set({ timerState });

  // Enable blocking if there's an active session
  enableBlocking();
}

// Use alarms instead of setInterval for better service worker compatibility
chrome.alarms.create('timerCountdown', { periodInMinutes: 0.016 }); // ~1 second
chrome.alarms.create('syncData', { periodInMinutes: 0.5 }); // 30 seconds

// Handle timer countdown
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'timerCountdown') {
    // Get current timer state
    const { timerState } = await chrome.storage.local.get(['timerState']);

    // If timer is not running, do nothing
    if (!timerState || !timerState.isRunning) {
      return;
    }

    // Update seconds remaining
    const newSecondsRemaining = Math.max(0, timerState.secondsRemaining - 1);

    // Update timer state
    const updatedTimerState = {
      ...timerState,
      secondsRemaining: newSecondsRemaining
    };

    // If timer has reached zero, handle completion
    if (newSecondsRemaining === 0) {
      updatedTimerState.isRunning = false;

      // Sync with server to get updated status
      await syncTimerStatus();
    }

    // Save updated state
    chrome.storage.local.set({ timerState: updatedTimerState });

    // Notify popup of timer update
    chrome.runtime.sendMessage({ action: 'timerUpdate', timerState: updatedTimerState });
  } else if (alarm.name === 'syncData') {
    // Sync data with server
    try {
      const { appConnected, isBlocking } = await chrome.storage.local.get(['appConnected', 'isBlocking']);
      if (appConnected) {
        // Sync blocked sites if blocking is enabled
        if (isBlocking) {
          await syncBlockedSites();
        }

        // Always sync timer status
        await syncTimerStatus();
      }
    } catch (error) {
      console.error('Error in periodic sync:', error);
    }
  }
});

// Listen for navigation to blocked sites when blocking is active
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  const { isBlocking, blockedSites } = await chrome.storage.local.get(['isBlocking', 'blockedSites']);

  if (!isBlocking) return;

  const url = new URL(details.url);
  const hostname = url.hostname;

  // Check if the hostname matches any blocked site
  const sites = blockedSites || DEFAULT_BLOCKED_SITES;
  const isBlocked = sites.some(site => hostname.includes(site));

  if (isBlocked) {
    console.log('Blocked navigation to:', hostname);

    // In a complete implementation, we would use chrome.declarativeNetRequest to block
    // For this demo, we're showing a content script overlay via messaging
    chrome.tabs.sendMessage(details.tabId, { action: 'blockSite' });
  }
});