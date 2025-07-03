// Get the base API URL depending on environment
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '' // Empty string for same-origin requests on Vercel
  : ''; // In development, use proxy configured in package.json

console.log('API_BASE_URL:', API_BASE_URL);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to set auth token
const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Helper function to get headers
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  try {
    // Check if body is FormData - if so, don't set Content-Type header
    const isFormData = options.body instanceof FormData;
    
    const headers = isFormData 
      ? (options.headers || {}) // Don't include Content-Type for FormData
      : getHeaders();
    
    // Make sure endpoint starts with /api
    let finalEndpoint = endpoint;
    if (!endpoint.startsWith('/api/')) {
      finalEndpoint = `/api${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
    }
    
    console.log(`Making API request to: ${API_BASE_URL}${finalEndpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${finalEndpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      },
    });

    // Check if response is ok first
    if (!response.ok) {
      // Try to parse JSON, but handle cases where response is not JSON
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('API response error:', errorData);
      } catch (jsonError) {
        // If JSON parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
        console.error('API response error (non-JSON):', response.statusText);
      }
      throw new Error(errorMessage);
    }

    // Parse JSON response
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific fetch errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check if the server is running.');
    }
    
    // Handle JSON parsing errors
    if (error.message.includes('Unexpected end of JSON input')) {
      throw new Error('Server returned invalid response. Please try again.');
    }
    
    throw error;
  }
};

// Authentication API
export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('Attempting login for:', email);
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      console.log('Login response:', data);
      setAuthToken(data.data.token);
      return data.data.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  signup: async (signupData) => {
    const data = await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(signupData)
    });
    setAuthToken(data.data.token);
    return data.data.user;
  },

  logout: () => {
    setAuthToken(null);
  },

  getProfile: async () => {
    const data = await apiRequest('/auth/profile');
    return data.data;
  },

  updateProfile: async (profileData) => {
    const data = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    return data.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    return await apiRequest('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword })
    });
  }
};

// Dashboard API
export const dashboardAPI = {
  getStats: async () => {
    return await apiRequest('/dashboard/stats');
  },

  getAnalytics: async (days = 7) => {
    return await apiRequest(`/dashboard/analytics?days=${days}`);
  },

  getRecentActivities: async () => {
    return await apiRequest('/dashboard/activities');
  },

  getEmployees: async () => {
    return await apiRequest('/dashboard/employees');
  },

  getSalesAnalytics: async () => {
    return await apiRequest('/dashboard/analytics');
  },

  getActivitySummary: async () => {
    return await apiRequest('/dashboard/activity-summary');
  },

  getEmployeeDashboard: async () => {
    return await apiRequest('/dashboard/employee');
  },

  getGreeting: async () => {
    return await apiRequest('/dashboard/greeting');
  }
};

// Employees API
export const employeesAPI = {
  getAll: async (page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'asc') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      sortBy,
      sortOrder
    });
    return await apiRequest(`/employees?${params}`);
  },

  getById: async (id) => {
    return await apiRequest(`/employees/${id}`);
  },

  create: async (employeeData) => {
    return await apiRequest('/employees', {
      method: 'POST',
      body: JSON.stringify(employeeData)
    });
  },

  update: async (id, employeeData) => {
    return await apiRequest(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(employeeData)
    });
  },

  delete: async (id) => {
    return await apiRequest(`/employees/${id}`, {
      method: 'DELETE'
    });
  },

  getActive: async () => {
    return await apiRequest('/employees/active');
  }
};

// Leads API
export const leadsAPI = {
  getAll: async (page = 1, limit = 10, search = '', status = '', type = '', assignedTo = '') => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search,
      status,
      type,
      assignedTo
    });
    return await apiRequest(`/leads?${params}`);
  },

  getById: async (id) => {
    return await apiRequest(`/leads/${id}`);
  },

  create: async (leadData) => {
    return await apiRequest('/leads', {
      method: 'POST',
      body: JSON.stringify(leadData)
    });
  },

  update: async (id, leadData) => {
    return await apiRequest(`/leads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(leadData)
    });
  },

  delete: async (id) => {
    return await apiRequest(`/leads/${id}`, {
      method: 'DELETE'
    });
  },

  assign: async (id, employeeId) => {
    return await apiRequest(`/leads/${id}/assign`, {
      method: 'PUT',
      body: JSON.stringify({ employeeId })
    });
  },

  close: async (id) => {
    return await apiRequest(`/leads/${id}/close`, {
      method: 'PUT'
    });
  },

  uploadCSV: async (file) => {
    const formData = new FormData();
    formData.append('csvFile', file);
    
    const token = getAuthToken();
    return await apiRequest('/leads/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });
  },

  getStats: async () => {
    return await apiRequest('/leads/stats');
  }
};

// Breaks API
export const breaksAPI = {
  startBreak: async (reason = 'Regular break') => {
    return await apiRequest('/breaks/start', {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  },

  endBreak: async () => {
    return await apiRequest('/breaks/end', {
      method: 'POST'
    });
  },

  getActiveBreak: async () => {
    return await apiRequest('/breaks/active');
  },

  getTodaysBreaks: async () => {
    return await apiRequest('/breaks/today');
  },

  getUserBreaks: async (limit = 10, dateFrom = null, dateTo = null) => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo })
    });
    return await apiRequest(`/breaks?${params}`);
  },

  getBreakStats: async (days = 7) => {
    return await apiRequest(`/breaks/stats?days=${days}`);
  }
};

const api = {
  auth: authAPI,
  dashboard: dashboardAPI,
  employees: employeesAPI,
  leads: leadsAPI,
  breaks: breaksAPI
};

export default api;