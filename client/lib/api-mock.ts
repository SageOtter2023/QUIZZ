// Toggle this to switch between mock and real API
export const USE_MOCK_API = true;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface MockResponse {
  status: number;
  ok: boolean;
  json: () => Promise<any>;
}

export async function mockFetch(
  endpoint: string,
  options?: RequestInit
): Promise<MockResponse> {
  // Simulate network delay
  await delay(1000);

  const method = options?.method || 'GET';
  const body = options?.body ? JSON.parse(options.body as string) : null;

  // POST /api/feedback
  if (endpoint === '/api/feedback' && method === 'POST') {
    const rand = Math.random();
    if (rand < 0.8) {
      // 80% success
      return {
        status: 200,
        ok: true,
        json: async () => ({ ok: true, message: 'Feedback submitted' }),
      };
    } else if (rand < 0.9) {
      // 10% rate limit
      return {
        status: 429,
        ok: false,
        json: async () => ({ error: 'Too many requests' }),
      };
    } else {
      // 10% server error
      return {
        status: 500,
        ok: false,
        json: async () => ({ error: 'Internal server error' }),
      };
    }
  }

  // POST /api/auth/login
  if (endpoint === '/api/auth/login' && method === 'POST') {
    const { email, password } = body;
    
    // Accept demo credentials
    if (email === 'demo@example.com' && password === 'Demo1234') {
      return {
        status: 200,
        ok: true,
        json: async () => ({
          token: 'mock_token_' + Date.now(),
          user: {
            id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
          },
        }),
      };
    }

    // Reject invalid credentials
    return {
      status: 401,
      ok: false,
      json: async () => ({ error: 'Invalid credentials' }),
    };
  }

  // POST /api/auth/signup
  if (endpoint === '/api/auth/signup' && method === 'POST') {
    const { email, password, name } = body;
    
    // Accept any valid email/password
    if (email && password && name) {
      return {
        status: 201,
        ok: true,
        json: async () => ({
          token: 'mock_token_' + Date.now(),
          user: {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
          },
        }),
      };
    }

    return {
      status: 400,
      ok: false,
      json: async () => ({ error: 'Invalid input' }),
    };
  }

  // GET /api/user/me
  if (endpoint === '/api/user/me' && method === 'GET') {
    const token = options?.headers ? (options.headers as any)['Authorization'] : null;
    
    if (!token) {
      return {
        status: 401,
        ok: false,
        json: async () => ({ error: 'Unauthorized' }),
      };
    }

    return {
      status: 200,
      ok: true,
      json: async () => ({
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        joined: '2024-01-15',
        bio: 'Web development enthusiast',
        avatar: '👨‍💻',
        stats: {
          totalAttempts: 5,
          avgScore: 78,
          bestScore: 92,
          topicsPracticed: 3,
        },
      }),
    };
  }

  // GET /api/user/me - empty attempts variant (for testing empty state)
  if (endpoint === '/api/user/me?empty=true' && method === 'GET') {
    return {
      status: 200,
      ok: true,
      json: async () => ({
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        joined: '2024-01-20',
        bio: 'Learning web development',
        avatar: '👩‍💻',
        stats: {
          totalAttempts: 0,
          avgScore: 0,
          bestScore: 0,
          topicsPracticed: 0,
        },
      }),
    };
  }

  // GET /api/users/:id/attempts
  if (endpoint.includes('/api/users/') && endpoint.includes('/attempts') && method === 'GET') {
    return {
      status: 200,
      ok: true,
      json: async () => [
        {
          id: '1',
          quizTitle: 'Web Development Basics',
          score: 8,
          total: 10,
          accuracy: 80,
          timeTaken: 15,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        },
        {
          id: '2',
          quizTitle: 'JavaScript Advanced',
          score: 18,
          total: 20,
          accuracy: 90,
          timeTaken: 28,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
          id: '3',
          quizTitle: 'Data Structures',
          score: 13,
          total: 15,
          accuracy: 87,
          timeTaken: 22,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        },
      ],
    };
  }

  // Default 404
  return {
    status: 404,
    ok: false,
    json: async () => ({ error: 'Not found' }),
  };
}

// Wrapper to use mock or real API
export async function fetchWithMock(
  endpoint: string,
  options?: RequestInit
): Promise<Response> {
  if (USE_MOCK_API) {
    const mockResponse = await mockFetch(endpoint, options);
    const jsonData = await mockResponse.json();

    // Create a proper Response object with the JSON data
    // This allows the body to be read multiple times without issues
    return new Response(JSON.stringify(jsonData), {
      status: mockResponse.status,
      statusText: mockResponse.ok ? 'OK' : 'Error',
      headers: {
        'content-type': 'application/json',
      },
    });
  }

  return fetch(endpoint, options);
}
