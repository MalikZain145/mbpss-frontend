const API = process.env.REACT_APP_API_URL;

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${API}${endpoint}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const text = await res.text();

    let json;
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new Error('Invalid JSON response from server');
    }

    if (!res.ok) {
      throw new Error(json.error || `Server error ${res.status}`);
    }

    return json;
  } catch (err) {
    if (err.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server.');
    }
    throw err;
  }
}

export const submitQuoteRequest = (data) =>
  apiCall('/quotes', { method: 'POST', body: data });

export const submitContactForm = (data) =>
  apiCall('/contacts', { method: 'POST', body: data });

export const submitReview = (data) =>
  apiCall('/reviews', { method: 'POST', body: data });

export const getApprovedReviews = () =>
  apiCall('/reviews/approved');

export const getPublicServices = (cat) =>
  apiCall(`/services/public${cat ? `?category=${cat}` : ''}`);

export const getServiceBySlug = (slug) =>
  apiCall(`/services/public/${slug}`);