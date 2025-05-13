document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('toggleButton');
  const statusDiv = document.getElementById('status');
  
  // Check current state
  chrome.storage.local.get(['isBlocking'], function(result) {
    const isBlocking = result.isBlocking || false;
    updateUI(isBlocking);
  });
  
  // Toggle blocking when button is clicked
  toggleButton.addEventListener('click', function() {
    chrome.storage.local.get(['isBlocking'], function(result) {
      const newState = !result.isBlocking;
      
      chrome.storage.local.set({isBlocking: newState}, function() {
        updateUI(newState);
        
        // Send message to background.js to update blocking rules
        chrome.runtime.sendMessage({action: newState ? 'startBlocking' : 'stopBlocking'});
      });
    });
  });
  
  function updateUI(isBlocking) {
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
});