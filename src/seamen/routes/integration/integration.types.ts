import { z } from "zod";
import {
  integrationSchema,
  integrationListSchema,
  integrationCreateSchema,
  integrationUpdateSchema,
  integrationIdParamsSchema,
  integrationPasswordQuerySchema,
  integrationMessageSchema,
  integrationDataSchema,
} from "./integration.schemas";

export type IntegrationT = z.infer<typeof integrationSchema>;
export type IntegrationListResponseT = z.infer<typeof integrationListSchema>;
export type IntegrationCreateBodyT = z.infer<typeof integrationCreateSchema>;
export type IntegrationUpdateBodyT = z.infer<typeof integrationUpdateSchema>;
export type IntegrationIdParamsT = z.infer<typeof integrationIdParamsSchema>;
export type IntegrationPasswordQueryT = z.infer<
  typeof integrationPasswordQuerySchema
>;
export type IntegrationMessageResponseT = z.infer<
  typeof integrationMessageSchema
>;
export type IntegrationDataT = z.infer<typeof integrationDataSchema>;

