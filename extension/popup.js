document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const toggleButton = document.getElementById('toggleButton');
  const syncButton = document.getElementById('syncButton');
  const statusDiv = document.getElementById('status');
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  const siteListContainer = document.getElementById('siteListContainer');
  const connectButton = document.getElementById('connectButton');
  const disconnectButton = document.getElementById('disconnectButton');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const loginErrorDiv = document.getElementById('login-error');
  const loginForm = document.getElementById('login-form');
  const connectedAccount = document.getElementById('connected-account');
  const connectionStatus = document.getElementById('connection-status');

  // Timer elements
  const timerTimeDisplay = document.querySelector('.timer-time');
  const timerModeDisplay = document.querySelector('.timer-mode');
  const timerCircle = document.querySelector('.timer-circle');
  const startTimerButton = document.getElementById('startTimerButton');
  const resetTimerButton = document.getElementById('resetTimerButton');
  const pomodoroCountDisplay = document.querySelector('.pomodoro-count');
  const progressFill = document.querySelector('.progress-fill');

  // Variables
  let isConnected = false;
  let currentUsername = '';
  let timerState = null;

  // Initialize UI
  initializeUI();

  // TAB FUNCTIONALITY
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      tabButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');

      // Hide all tab contents
      tabContents.forEach(content => content.classList.remove('active'));
      // Show selected tab content
      const tabId = this.getAttribute('data-tab');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });

  // BLOCKING FUNCTIONALITY
  toggleButton.addEventListener('click', function() {
    chrome.storage.local.get(['isBlocking'], function(result) {
      const newState = !result.isBlocking;

      chrome.storage.local.set({isBlocking: newState}, function() {
        updateBlockingUI(newState);

        // Send message to background.js to update blocking rules
        chrome.runtime.sendMessage({
          action: newState ? 'startBlocking' : 'stopBlocking'
        });
      });
    });
  });

  // SYNC FUNCTIONALITY
  syncButton.addEventListener('click', function() {
    syncButton.disabled = true;
    syncButton.textContent = 'Syncing...';

    chrome.runtime.sendMessage({action: 'syncBlockedSites'}, function(sites) {
      // Update the sites list
      updateSitesList(sites);

      // Re-enable the button
      syncButton.disabled = false;
      syncButton.textContent = 'Sync Blocked Sites';
    });
  });

  // ACCOUNT CONNECTION FUNCTIONALITY
  connectButton.addEventListener('click', function() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      loginErrorDiv.textContent = 'Please enter both username and password';
      return;
    }

    // Disable button and show loading state
    connectButton.disabled = true;
    connectButton.textContent = 'Connecting...';
    loginErrorDiv.textContent = '';

    // Send connection request to background.js
    chrome.runtime.sendMessage({
      action: 'connectAccount',
      username: username,
      password: password
    }, function(response) {
      connectButton.disabled = false;
      connectButton.textContent = 'Connect Account';

      if (response && response.success) {
        isConnected = true;
        currentUsername = username;
        updateConnectionUI();

        // Sync the blocked sites after successful connection
        chrome.runtime.sendMessage({action: 'syncBlockedSites'}, function(sites) {
          updateSitesList(sites);
        });
      } else {
        const errorMsg = response && response.error
          ? response.error
          : 'Failed to connect to FocusFlow';
        loginErrorDiv.textContent = errorMsg;
      }
    });
  });

  disconnectButton.addEventListener('click', function() {
    // Clear connection data
    chrome.storage.local.set({
      appConnected: false,
      authToken: null,
      username: null
    }, function() {
      isConnected = false;
      currentUsername = '';
      updateConnectionUI();
    });
  });

  // TIMER FUNCTIONALITY
  startTimerButton.addEventListener('click', function() {
    if (timerState && timerState.isRunning) {
      // Pause timer
      timerState.isRunning = false;
      startTimerButton.textContent = 'Start Timer';

      // Update timer state in storage
      chrome.storage.local.set({ timerState });
    } else {
      // Start timer
      if (timerState) {
        timerState.isRunning = true;
        startTimerButton.textContent = 'Pause Timer';

        // Show notification when starting a focus session
        if (timerState.timerMode === 'focus') {
          chrome.runtime.sendMessage({
            action: 'showNotification',
            title: 'Focus Time Started',
            message: 'Stay focused and productive!',
            type: 'sessionStart'
          });
        }
        // Show notification when starting a break
        else if (timerState.timerMode === 'shortBreak' || timerState.timerMode === 'longBreak') {
          chrome.runtime.sendMessage({
            action: 'showNotification',
            title: 'Break Time Started',
            message: 'Take a moment to relax.',
            type: 'breakTime'
          });
        }

        // Update timer state in storage
        chrome.storage.local.set({ timerState });
      } else {
        // Sync timer status first
        chrome.runtime.sendMessage({ action: 'syncTimerStatus' }, function() {
          updateTimerUI();
        });
      }
    }
  });

  resetTimerButton.addEventListener('click', function() {
    // Reset timer
    if (timerState) {
      timerState.isRunning = false;
      timerState.secondsRemaining = timerState.totalSeconds;
      startTimerButton.textContent = 'Start Timer';

      // Update timer state in storage
      chrome.storage.local.set({ timerState });

      // Update UI
      updateTimerUI();
    }
  });

  // Listen for timer updates from background.js
  chrome.runtime.onMessage.addListener(function(message) {
    if (message.action === 'timerUpdate') {
      timerState = message.timerState;
      updateTimerUI();
    }
  });

  // Format time for display (MM:SS)
  function formatTime(seconds) {
    // Ensure seconds is a valid number
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) {
      console.error('Invalid seconds value:', seconds);
      seconds = 0;
    }

    // Cap at 99:59 for display purposes
    if (seconds > 5999) { // 99 minutes and 59 seconds
      seconds = 5999;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // Update timer UI based on current state
  function updateTimerUI() {
    console.log('Updating timer UI with state:', timerState);

    if (!timerState) {
      console.log('No timer state available, skipping UI update');
      // Set default display
      timerTimeDisplay.textContent = '25:00';
      timerModeDisplay.textContent = 'Focus Time';
      timerCircle.className = 'timer-circle focus';
      startTimerButton.textContent = 'Start Timer';
      pomodoroCountDisplay.textContent = 'Pomodoro 1/4';
      progressFill.style.width = '0%';
      return;
    }

    // Validate timer state
    if (typeof timerState.secondsRemaining !== 'number') {
      console.error('Invalid secondsRemaining:', timerState.secondsRemaining);
      timerState.secondsRemaining = 25 * 60; // Default to 25 minutes
    }

    if (typeof timerState.totalSeconds !== 'number') {
      console.error('Invalid totalSeconds:', timerState.totalSeconds);
      timerState.totalSeconds = 25 * 60; // Default to 25 minutes
    }

    // Update time display
    timerTimeDisplay.textContent = formatTime(timerState.secondsRemaining);
    console.log('Updated timer display to:', timerTimeDisplay.textContent);

    // Update mode display
    if (timerState.timerMode === 'focus') {
      timerModeDisplay.textContent = 'Focus Time';
      timerCircle.className = 'timer-circle focus';
    } else if (timerState.timerMode === 'shortBreak') {
      timerModeDisplay.textContent = 'Short Break';
      timerCircle.className = 'timer-circle shortBreak';
    } else {
      timerModeDisplay.textContent = 'Long Break';
      timerCircle.className = 'timer-circle longBreak';
    }
    console.log('Updated mode display to:', timerModeDisplay.textContent);

    // Update start/pause button
    startTimerButton.textContent = timerState.isRunning ? 'Pause Timer' : 'Start Timer';

    // Update pomodoro count
    const currentPomodoro = timerState.currentPomodoro || 1;
    const totalPomodoros = timerState.totalPomodoros || 4;
    pomodoroCountDisplay.textContent = `Pomodoro ${currentPomodoro}/${totalPomodoros}`;

    // Update progress bar
    let progress = 0;
    if (timerState.totalSeconds > 0) {
      progress = ((timerState.totalSeconds - timerState.secondsRemaining) / timerState.totalSeconds) * 100;
      // Ensure progress is between 0 and 100
      progress = Math.max(0, Math.min(100, progress));
    }
    progressFill.style.width = `${progress}%`;
    console.log('Updated progress bar to:', progress + '%');

    // Update blocking state if timer is running
    if (timerState.isRunning) {
      chrome.storage.local.set({ isBlocking: true });
      updateBlockingUI(true);
    }
  }

  // INITIALIZATION FUNCTION
  function initializeUI() {
    // Check blocking state
    chrome.storage.local.get(['isBlocking', 'blockedSites', 'timerState'], function(result) {
      // Update blocking UI
      const isBlocking = result.isBlocking || false;
      updateBlockingUI(isBlocking);

      // Update sites list
      const sites = result.blockedSites || [];
      updateSitesList(sites);

      // Update timer UI
      timerState = result.timerState;
      updateTimerUI();
    });

    // Check connection status
    chrome.runtime.sendMessage({action: 'getConnectionStatus'}, function(result) {
      isConnected = result.appConnected || false;
      currentUsername = result.username || '';
      updateConnectionUI();

      // If connected, sync timer status
      if (isConnected) {
        chrome.runtime.sendMessage({action: 'syncTimerStatus'}, function() {
          // Get updated timer state
          chrome.storage.local.get(['timerState'], function(result) {
            timerState = result.timerState;
            updateTimerUI();
          });
        });
      }
    });
  }

  // HELPER FUNCTIONS
  function updateBlockingUI(isBlocking) {
    if (isBlocking) {
      statusDiv.textContent = 'Blocker is active';
      statusDiv.className = 'status active';
      toggleButton.textContent = 'Stop Blocking';
    } else {
      statusDiv.textContent = 'Blocker is inactive';
      statusDiv.className = 'status inactive';
      toggleButton.textContent = 'Start Blocking';
    }
  }

  function updateSitesList(sites) {
    // Clear current list
    siteListContainer.innerHTML = '';

    if (!sites || sites.length === 0) {
      siteListContainer.innerHTML = '<div class="site-item">No sites in blocklist</div>';
      return;
    }

    // Add each site to the list
    sites.forEach(site => {
      const siteElement = document.createElement('div');
      siteElement.className = 'site-item';
      siteElement.textContent = site;
      siteListContainer.appendChild(siteElement);
    });
  }

  function updateConnectionUI() {
    if (isConnected) {
      connectionStatus.textContent = `Connected as ${currentUsername}`;
      connectionStatus.className = 'connection-status connected';
      loginForm.style.display = 'none';
      connectedAccount.style.display = 'block';
      syncButton.disabled = false;
    } else {
      connectionStatus.textContent = 'Not connected to FocusFlow';
      connectionStatus.className = 'connection-status';
      loginForm.style.display = 'block';
      connectedAccount.style.display = 'none';
      syncButton.disabled = true;
    }
  }
});