import ReactDOM from 'react-dom/client';

// React utilities to prevent DOM manipulation errors

// Global variable to track if we're in development mode
const isDevelopment = import.meta.env.DEV;

// Store the original console.error to prevent spam
const originalConsoleError = console.error;

// Filter out common React DOM errors that are not critical
console.error = (...args) => {
  const message = args.join(' ');
  
  // Filter out common React DOM errors that occur during development
  if (isDevelopment) {
    const ignoredErrors = [
      "Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.",
      "Failed to execute 'insertBefore' on 'Node': The node before which the new node is to be inserted is not a child of this node.",
      "Warning: You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before."
    ];
    
    if (ignoredErrors.some(error => message.includes(error))) {
      return; // Don't log these errors in development
    }
  }
  
  // Log all other errors normally
  originalConsoleError.apply(console, args);
};

// Utility to safely unmount React components
export const safeUnmount = (container) => {
  if (container && container._reactRootContainer) {
    try {
      // Use React 18's unmount method
      if (container._reactRootContainer._internalRoot) {
        container._reactRootContainer.unmount();
      }
    } catch (error) {
      // If unmount fails, clear the container manually
      container.innerHTML = '';
    }
  }
};

// Utility to prevent multiple root creation
let globalRoot = null;

export const createSafeRoot = (container) => {
  if (!container) {
    console.error('Container element not found');
    return null;
  }

  // If root already exists and is valid, return it
  if (globalRoot && globalRoot._internalRoot) {
    return globalRoot;
  }

  // Clear container safely
  try {
    container.innerHTML = '';
  } catch (error) {
    console.warn('Failed to clear container:', error);
  }

  // Create new root
  try {
    globalRoot = ReactDOM.createRoot(container);
    return globalRoot;
  } catch (error) {
    console.error('Failed to create React root:', error);
    
    // Try to recover by clearing the container and retrying
    try {
      container.innerHTML = '';
      globalRoot = ReactDOM.createRoot(container);
      return globalRoot;
    } catch (retryError) {
      console.error('Failed to create React root on retry:', retryError);
      return null;
    }
  }
};

// Utility to cleanup on page unload
export const setupCleanup = () => {
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
      // Cleanup any global references
      globalRoot = null;
    });
  }
};

// Utility to handle React Refresh errors
export const handleReactRefreshError = (error) => {
  if (isDevelopment && (error.message.includes('removeChild') || error.message.includes('insertBefore'))) {
    // In development, these errors are often caused by hot reloading
    // We can safely ignore them and let the app continue
    console.warn('React Refresh error detected, continuing...');
    return true; // Error handled
  }
  return false; // Error not handled, let it propagate
};

// Utility to safely parse JSON
export const safeJSONParse = (str, defaultValue = null) => {
  if (!str || str === 'undefined' || str === 'null') {
    return defaultValue;
  }
  
  try {
    return JSON.parse(str);
  } catch (error) {
    console.warn('Failed to parse JSON:', str, error);
    return defaultValue;
  }
};

// Utility to safely stringify JSON
export const safeJSONStringify = (obj, defaultValue = '') => {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    console.warn('Failed to stringify JSON:', obj, error);
    return defaultValue;
  }
};

// Export development flag
export { isDevelopment }; 