import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

export type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

interface CsrfTokenResponse {
  token: string;
  header: string;
}

interface CsrfErrorResponse {
  error: string;
  code: string;
  retry?: boolean;
}

class CsrfManager {
  private token: string | null = null;
  private headerName: string = "x-csrf-token";
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(private httpClient: AxiosInstance) {
    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.httpClient.interceptors.request.use(
      async (config) => {
        if (this.shouldIncludeCsrfToken(config)) {
          await this.ensureValidToken();
          if (this.token) {
            config.headers[this.headerName] = this.token;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        if (this.isCsrfError(error) && !originalRequest._csrfRetry) {
          originalRequest._csrfRetry = true;
          
          try {
            await this.refreshToken();
            if (this.token) {
              originalRequest.headers[this.headerName] = this.token;
            }
            return this.httpClient.request(originalRequest);
          } catch (refreshError) {
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  private shouldIncludeCsrfToken(config: AxiosRequestConfig): boolean {
    const method = config.method?.toLowerCase();
    return method !== "get" && method !== "head" && method !== "options";
  }

  private isCsrfError(error: any): boolean {
    const status = error?.response?.status;
    const data = error?.response?.data as CsrfErrorResponse;
    
    return status === 403 && (
      data?.code === "TOKEN_REQUIRED" ||
      data?.code === "TOKEN_MISMATCH" ||
      data?.code === "HEADER_MISSING"
    );
  }

  private async ensureValidToken(): Promise<void> {
    if (!this.token && !this.isRefreshing) {
      await this.refreshToken();
    } else if (this.isRefreshing && this.refreshPromise) {
      await this.refreshPromise;
    }
  }

  private async refreshToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.fetchNewToken();

    try {
      const token = await this.refreshPromise;
      this.token = token;
      return token;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async fetchNewToken(): Promise<string> {
    try {
      const response = await this.httpClient.get<CsrfTokenResponse>("/csrf-token");
      this.headerName = response.data.header;
      return response.data.token;
    } catch (error) {
      throw new Error("Failed to fetch CSRF token");
    }
  }

  public async getToken(): Promise<string> {
    await this.ensureValidToken();
    return this.token || "";
  }

  public clearToken(): void {
    this.token = null;
  }
}

const BASE_URL = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const httpClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

const csrfManager = new CsrfManager(httpClient);

async function handleRequest<T>(requestFn: () => Promise<AxiosResponse<T>>): Promise<T> {
  try {
    const response = await requestFn();
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const message = data?.error || error?.message || "Request failed";
    
    throw new Error(`${status ? `${status} ` : ""}${message}`);
  }
}

export const api = {
  async listTasks(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Task>> {
    return handleRequest(() => 
      httpClient.get<PaginatedResponse<Task>>(`/api/tasks?page=${page}&limit=${limit}`)
    );
  },

  async createTask(input: { title: string; description?: string }): Promise<Task> {
    return handleRequest(() => 
      httpClient.post<Task>("/api/tasks", input)
    );
  },

  async updateTask(
    id: number,
    data: Partial<Pick<Task, "title" | "description" | "completed">>
  ): Promise<Task> {
    return handleRequest(() => 
      httpClient.put<Task>(`/api/tasks/${id}`, data)
    );
  },

  async deleteTask(id: number): Promise<void> {
    return handleRequest(() => 
      httpClient.delete<void>(`/api/tasks/${id}`)
    );
  },
};

export { csrfManager };
