const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Додаємо токен, якщо є
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `HTTP Error: ${response.status}`);
      }

      return response.json();
    } catch (err: any) {
      // Краща обробка мережевих помилок
      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        throw new Error('Не вдалося підключитися до сервера. Перевірте, чи запущений auth-service на http://localhost:3001');
      }
      throw err;
    }
  }

  // Методи get, post, put, delete — залишаються без змін
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ...
}

export const apiClient = new ApiClient(API_BASE_URL);