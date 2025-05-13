// This script runs in the context of each web page

// Check if we're on a blocked site when blocking is active
chrome.storage.local.get(['isBlocking', 'blockedSites'], function(result) {
  if (!result.isBlocking) return;
  
  const hostname = window.location.hostname;
  const blockedSites = result.blockedSites || [];
  
  // Check if current site is blocked
  const isBlocked = blockedSites.some(site => hostname.includes(site));
  
  if (isBlocked) {
    // Display blocking overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
    overlay.style.zIndex = '999999';
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
        <p style="margin-bottom: 20px; font-size: 16px;">
          Return to your work or take a break when your timer is complete.
        </p>
        <button id="ff-override-button" style="background-color: #f43f5e; border: none; color: white; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold;">
          Override Block (Not Recommended)
        </button>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add event listener for override button
    document.getElementById('ff-override-button').addEventListener('click', function() {
      overlay.remove();
    });
  }
});