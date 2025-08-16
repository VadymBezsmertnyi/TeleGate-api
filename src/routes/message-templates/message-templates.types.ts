import { z } from "zod";
import {
  createTemplateSchema,
  updateTemplateSchema,
  filterTemplatesSchema,
  templateResponseSchema,
} from "./message-templates.schemas";

// Типи, що генеруються з Zod схем
export type CreateTemplateRequest = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateRequest = z.infer<typeof updateTemplateSchema>;
export type FilterTemplatesRequest = z.infer<typeof filterTemplatesSchema>;
export type TemplateResponse = z.infer<typeof templateResponseSchema>;

// Базові інтерфейси
export interface MessageTemplate {
  _id: string;
  name: string;
  content: string;
  type: "text" | "html" | "markdown";
  description?: string;
  isActive: boolean;
  user: string;
  tags: string[];
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateData {
  name: string;
  content: string;
  type?: "text" | "html" | "markdown";
  description?: string;
  tags?: string[];
}

export interface UpdateTemplateData {
  name?: string;
  content?: string;
  type?: "text" | "html" | "markdown";
  description?: string;
  isActive?: boolean;
  tags?: string[];
}

export interface TemplateFilters {
  search?: string;
  type?: "text" | "html" | "markdown";
  isActive?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface TemplatePagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TemplatesResponse {
  templates: MessageTemplate[];
  pagination: TemplatePagination;
}

export interface TemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  totalUsage: number;
  avgUsage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
