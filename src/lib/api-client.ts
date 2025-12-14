const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to get token from Redux persist storage
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const persistedAuth = localStorage.getItem('persist:auth');
    if (persistedAuth) {
      const auth = JSON.parse(persistedAuth);
      // Redux persist stores values as JSON strings, so we need to parse twice
      const accessToken = auth.accessToken ? JSON.parse(auth.accessToken) : null;
      return accessToken;
    }
  } catch (error) {
    console.error('Error getting token from persist:auth:', error);
  }

  return null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      error.message || 'API request failed',
      error
    );
  }

  return response.json();
}
