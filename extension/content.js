// This script runs in the context of each web page

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

// Function to update timer display
function updateTimerDisplay() {
  const timerElement = document.getElementById('ff-timer-display');
  if (!timerElement) return;

  // Get timer state from extension
  chrome.runtime.sendMessage({ action: 'getTimerState' }, function(response) {
    console.log('Got timer state response:', response);

    if (response && response.timerState) {
      const timerState = response.timerState;

      // Validate timer state
      if (typeof timerState.secondsRemaining !== 'number') {
        console.error('Invalid secondsRemaining:', timerState.secondsRemaining);
        timerState.secondsRemaining = 25 * 60; // Default to 25 minutes
      }

      const { secondsRemaining, timerMode } = timerState;
      const modeText = timerMode === 'focus' ? 'Focus' :
                       timerMode === 'shortBreak' ? 'Short Break' : 'Long Break';

      // Update display
      const timeText = formatTime(secondsRemaining);
      timerElement.textContent = `${modeText} Time: ${timeText}`;
      console.log('Updated timer display to:', timerElement.textContent);
    } else {
      timerElement.textContent = 'Timer not active';
      console.log('No timer state available, showing "Timer not active"');
    }
  });

  // Update every second
  setTimeout(updateTimerDisplay, 1000);
}

// Function to create and show the blocking overlay
function showBlockingOverlay() {
  // Check if overlay already exists
  if (document.getElementById('focusflow-blocking-overlay')) return;

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'focusflow-blocking-overlay';
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  overlay.style.zIndex = '2147483647'; // Max z-index
  overlay.style.display = 'flex';
  overlay.style.flexDirection = 'column';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.color = 'white';
  overlay.style.textAlign = 'center';
  overlay.style.fontFamily = 'sans-serif';

  overlay.innerHTML = `
    <div style="background-color: #1e40af; padding: 30px; border-radius: 10px; max-width: 500px;">
      <h1 style="margin-top: 0; color: white; font-size: 24px;">Site Blocked by FocusFlow</h1>
      <p style="font-size: 16px; line-height: 1.5;">
        This site has been blocked during your focus time to help you stay productive.
      </p>
      <div id="ff-timer-display" style="font-size: 28px; font-weight: bold; margin: 20px 0; color: white;">
        Loading timer...
      </div>
      <p style="margin-bottom: 20px; font-size: 16px;">
        Return to your work or take a break when your timer is complete.
      </p>
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button id="ff-back-button" style="background-color: #4b5563; border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
          Go Back
        </button>
        <button id="ff-override-button" style="background-color: #f43f5e; border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
          Override Block
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add event listener for back button
  document.getElementById('ff-back-button').addEventListener('click', function() {
    history.back();
  });

  // Add event listener for override button
  document.getElementById('ff-override-button').addEventListener('click', function() {
    overlay.remove();
  });

  // Start updating timer display
  updateTimerDisplay();
}

// Initial check when page loads
chrome.storage.local.get(['isBlocking', 'blockedSites'], function(result) {
  if (!result.isBlocking) return;

  const hostname = window.location.hostname;
  const blockedSites = result.blockedSites || [];

  // Check if current site is blocked
  const isBlocked = blockedSites.some(site => hostname.includes(site));

  if (isBlocked) {
    showBlockingOverlay();
  }
});

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === 'blockSite') {
    showBlockingOverlay();
  }
});