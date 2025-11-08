import { z } from "zod";
import {
  templateSchema,
  templateListSchema,
  templateCreateSchema,
  templateUpdateSchema,
  templateIdParamsSchema,
  templatePasswordQuerySchema,
  templateMessageSchema,
} from "./template.schemas";

export type TemplateT = z.infer<typeof templateSchema>;
export type TemplateListResponseT = z.infer<typeof templateListSchema>;
export type TemplateCreateBodyT = z.infer<typeof templateCreateSchema>;
export type TemplateUpdateBodyT = z.infer<typeof templateUpdateSchema>;
export type TemplateIdParamsT = z.infer<typeof templateIdParamsSchema>;
export type TemplatePasswordQueryT = z.infer<
  typeof templatePasswordQuerySchema
>;
export type TemplateMessageResponseT = z.infer<typeof templateMessageSchema>;
