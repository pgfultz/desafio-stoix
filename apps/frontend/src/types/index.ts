// Re-export API types for better organization
export type { Task } from "../lib/api";

// UI-specific types
export interface DialogState<T> {
  open: boolean;
  data: T | null;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
