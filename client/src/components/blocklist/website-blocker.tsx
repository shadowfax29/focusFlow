import React, { useEffect } from 'react';
import { useBlocklist } from '@/hooks/use-blocklist';
import { useTimer } from '@/hooks/use-timer';

export default function WebsiteBlocker() {
  const { blockedSites } = useBlocklist();
  const { timerMode, isRunning } = useTimer();

  useEffect(() => {
    // Only block sites during active focus sessions
    const shouldBlock = isRunning && timerMode === 'focus';
    
    if (!shouldBlock || blockedSites.length === 0) return;

    // Check current URL against blocklist
    const checkAndBlockSites = () => {
      const currentHost = window.location.hostname;
      
      // Extract the domain part (e.g., from "www.google.com" get "google.com")
      const domainParts = currentHost.split('.');
      const domain = domainParts.length >= 2 
        ? `${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`
        : currentHost;
      
      // Check if current domain is in blocklist
      const blockedSite = blockedSites.find(site => {
        // Handle both with and without www prefix
        const siteHost = site.domain.replace(/^www\./, '');
        const currentDomainPattern = domain.replace(/^www\./, '');
        
        // Check if the domain matches and is enabled
        return siteHost === currentDomainPattern && site.isEnabled;
      });
      
      if (blockedSite) {
        // Redirect to a block page or show an overlay
        console.log(`Site ${domain} is blocked during focus time`);
        
        // Create and show overlay
        const overlay = document.createElement('div');
        overlay.id = 'focusflow-blocker';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.zIndex = '999999';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.color = 'white';
        overlay.style.fontFamily = 'system-ui, sans-serif';
        
        const title = document.createElement('h1');
        title.textContent = 'Site Blocked';
        title.style.fontSize = '2.5rem';
        title.style.marginBottom = '1rem';
        
        const message = document.createElement('p');
        message.textContent = `${blockedSite.domain} is currently blocked during your focus session`;
        message.style.fontSize = '1.25rem';
        message.style.marginBottom = '2rem';
        
        const backButton = document.createElement('button');
        backButton.textContent = 'Go Back';
        backButton.style.padding = '0.75rem 1.5rem';
        backButton.style.fontSize = '1rem';
        backButton.style.backgroundColor = '#3b82f6';
        backButton.style.color = 'white';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '0.375rem';
        backButton.style.cursor = 'pointer';
        backButton.onclick = () => {
          window.history.back();
        };
        
        overlay.appendChild(title);
        overlay.appendChild(message);
        overlay.appendChild(backButton);
        
        document.body.appendChild(overlay);
      }
    };
    
    // Check immediately and set up a mutation observer to detect navigation
    checkAndBlockSites();
    
    // Handle page visibility changes to catch tab switches
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAndBlockSites();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      const existingOverlay = document.getElementById('focusflow-blocker');
      if (existingOverlay) {
        existingOverlay.remove();
      }
    };
  }, [blockedSites, isRunning, timerMode]);
  
  // This component doesn't render anything visible
  return null;
}