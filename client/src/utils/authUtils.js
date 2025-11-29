// Utility functions for authentication
export const handleTokenError = (response) => {
  if (response.status === 403 || response.status === 401) {
    console.warn('Token invalid, clearing session...');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload(); // Reload để reset state
    return true; // Indicates token was invalid
  }
  return false; // Token is valid
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token || ''}`,
    'Content-Type': 'application/json'
  };
};

export const fetchWithAuth = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers
    }
  });

  // Check for token error
  if (handleTokenError(response)) {
    return null; // Will reload page
  }

  return response;
};
