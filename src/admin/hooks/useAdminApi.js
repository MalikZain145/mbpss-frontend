import { useState, useCallback, useEffect, useRef } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function useAdminApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const request = useCallback(async (endpoint, options = {}) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem('mbpss_admin_token');
    try {
      const res = await fetch(`${API}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...options.headers,
        },
        ...options,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
}

/**
 * usePolling — auto-refreshes data every `intervalMs` milliseconds
 * Returns { data, loading, error, refresh }
 */
export function usePolling(fetchFn, intervalMs = 8000, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const timerRef              = useRef(null);
  const mountedRef            = useRef(true);

  const fetch_ = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      if (mountedRef.current) setData(result);
    } catch (err) {
      if (mountedRef.current) setError(err.message);
    } finally {
      if (mountedRef.current && !silent) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetch_(false); // initial load (show spinner)

    timerRef.current = setInterval(() => {
      fetch_(true); // polling (silent — no spinner)
    }, intervalMs);

    return () => {
      mountedRef.current = false;
      clearInterval(timerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch_, intervalMs]);

  return { data, loading, error, refresh: () => fetch_(false) };
}
