// Session configuration - 2025 best practices
// 30 minute inactivity timeout - auto logout with toast notification

export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT: 30 * 60 * 1000,  // 30 minutes
  CHECK_INTERVAL: 30 * 1000,           // Check every 30 seconds
  ACTIVITY_EVENTS: ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'],
};

// Track last activity timestamp
export function resetActivity(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lastActivity', Date.now().toString());
  }
}

// Get milliseconds since last activity
export function getInactivityTime(): number {
  if (typeof window === 'undefined') return 0;
  const last = localStorage.getItem('lastActivity');
  return last ? Date.now() - parseInt(last) : 0;
}

// Check if session is expired due to inactivity
export function isSessionExpired(): boolean {
  return getInactivityTime() > SESSION_CONFIG.INACTIVITY_TIMEOUT;
}

// Initialize activity tracking on window load
export function initActivityTracking(): void {
  if (typeof window === 'undefined') return;
  
  // Set initial activity timestamp if not set
  if (!localStorage.getItem('lastActivity')) {
    resetActivity();
  }
  
  // Add event listeners for activity
  SESSION_CONFIG.ACTIVITY_EVENTS.forEach(event => {
    window.addEventListener(event, resetActivity, { passive: true });
  });
}

// Clean up activity listeners
export function cleanupActivityTracking(): void {
  if (typeof window === 'undefined') return;
  
  SESSION_CONFIG.ACTIVITY_EVENTS.forEach(event => {
    window.removeEventListener(event, resetActivity);
  });
}