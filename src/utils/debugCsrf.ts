// Debug utility to check CSRF token handling
export const debugCsrfToken = () => {
  console.log('=== CSRF Debug Info ===');
  
  // Check if we're in browser
  if (typeof document === 'undefined') {
    console.log('❌ Not in browser environment');
    return;
  }
  
  // Check all cookies
  console.log('🍪 All cookies:', document.cookie);
  
  // Check for XSRF-TOKEN specifically
  const name = 'XSRF-TOKEN';
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  
  if (parts.length === 2) {
    const token = parts.pop()?.split(';').shift();
    const decodedToken = token ? decodeURIComponent(token) : null;
    console.log('✅ XSRF-TOKEN found:', decodedToken);
  } else {
    console.log('❌ XSRF-TOKEN not found in cookies');
  }
  
  // Check for Laravel session cookie
  const sessionName = 'laravel-session';
  const sessionValue = `; ${document.cookie}`;
  const sessionParts = sessionValue.split(`; ${sessionName}=`);
  
  if (sessionParts.length === 2) {
    console.log('✅ Laravel session cookie found');
  } else {
    console.log('❌ Laravel session cookie not found');
  }
  
  console.log('=== End Debug Info ===');
};

// Extend Window interface to include debugCsrf
declare global {
  interface Window {
    debugCsrf: () => void;
  }
}

// Make available in browser console
if (typeof window !== 'undefined') {
  window.debugCsrf = debugCsrfToken;
}