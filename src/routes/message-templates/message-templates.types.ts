import { z } from "zod";
import {
  createTemplateSchema,
  updateTemplateSchema,
  filterTemplatesSchema,
  templateResponseSchema,
} from "./message-templates.schemas";

// Типи, що генеруються з Zod схем
export type CreateTemplateRequestT = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateRequestT = z.infer<typeof updateTemplateSchema>;
export type FilterTemplatesRequestT = z.infer<typeof filterTemplatesSchema>;
export type TemplateResponseT = z.infer<typeof templateResponseSchema>;

// Базові інтерфейси
export interface MessageTemplateI {
  _id: string;
  name: string;
  content: string;
  description?: string;
  isActive: boolean;
  user: string;
  tags: string[];
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTemplateDataI {
  name: string;
  content: string;
  description?: string;
  tags?: string[];
}

export interface UpdateTemplateDataI {
  name?: string;
  content?: string;
  description?: string;
  isActive?: boolean;
  tags?: string[];
}

export interface TemplateFiltersI {
  search?: string;
  isActive?: boolean;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface TemplatePaginationI {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TemplatesResponseI {
  templates: MessageTemplateI[];
  pagination: TemplatePaginationI;
}

export interface TemplateStatsI {
  totalTemplates: number;
  activeTemplates: number;
  totalUsage: number;
  avgUsage: number;
}

export interface ApiResponseI<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
