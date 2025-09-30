import axios from "axios";

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

const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const CSRF_HEADER = "x-csrf-token";
let csrfToken: string | null = null;

const http = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

async function request<T>(
  method: "get" | "post" | "put" | "delete",
  path: string,
  data?: any,
  headers?: Record<string, string>
): Promise<T> {
  try {
    const res = await http.request<T>({ method, url: path, data, headers });
    return res.data;
  } catch (e: any) {
    const status = e?.response?.status;
    const msg = e?.response?.data?.error || e?.message || "Erro";
    throw new Error(`${status ?? ""} ${msg}`.trim());
  }
}

export async function getCsrfToken(): Promise<string> {
  const data = await request<{ csrfToken: string; header: string }>(
    "get",
    `/csrf-token`
  );
  csrfToken = data.csrfToken;
  return csrfToken;
}

async function ensureCsrf() {
  if (!csrfToken) await getCsrfToken();
}

export const api = {
  async listTasks(
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResponse<Task>> {
    return request<PaginatedResponse<Task>>(
      "get",
      `/api/tasks?page=${page}&limit=${limit}`
    );
  },
  async createTask(input: {
    title: string;
    description?: string;
  }): Promise<Task> {
    await ensureCsrf();
    return request<Task>("post", `/api/tasks`, input, {
      [CSRF_HEADER]: csrfToken as string,
    });
  },
  async updateTask(
    id: number,
    data: Partial<Pick<Task, "title" | "description" | "completed">>
  ): Promise<Task> {
    await ensureCsrf();
    return request<Task>("put", `/api/tasks/${id}`, data, {
      [CSRF_HEADER]: csrfToken as string,
    });
  },
  async deleteTask(id: number): Promise<void> {
    await ensureCsrf();
    await request("delete", `/api/tasks/${id}`, undefined, {
      [CSRF_HEADER]: csrfToken as string,
    });
  },
};
