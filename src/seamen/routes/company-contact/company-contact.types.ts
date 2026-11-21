import { z } from "zod";
import {
  companyContactSchema,
  companyContactListSchema,
  companyContactCreateSchema,
  companyContactUpdateSchema,
  companyContactIdParamsSchema,
  companyContactPasswordQuerySchema,
  companyContactMessageSchema,
  companyContactSendHistorySchema,
  companyContactSendHistoryInputSchema,
  companyContactCompanySchema,
  companyContactStatisticsSchema,
} from "./company-contact.schemas";

export type CompanyContactT = z.infer<typeof companyContactSchema>;
export type CompanyContactListResponseT = z.infer<
  typeof companyContactListSchema
>;
export type CompanyContactCreateBodyT = z.infer<
  typeof companyContactCreateSchema
>;
export type CompanyContactUpdateBodyT = z.infer<
  typeof companyContactUpdateSchema
>;
export type CompanyContactIdParamsT = z.infer<
  typeof companyContactIdParamsSchema
>;
export type CompanyContactPasswordQueryT = z.infer<
  typeof companyContactPasswordQuerySchema
>;
export type CompanyContactMessageResponseT = z.infer<
  typeof companyContactMessageSchema
>;
export type CompanyContactSendHistoryT = z.infer<
  typeof companyContactSendHistorySchema
>;
export type CompanyContactSendHistoryInputT = z.infer<
  typeof companyContactSendHistoryInputSchema
>;
export type CompanyContactCompanyT = z.infer<
  typeof companyContactCompanySchema
>;
export type CompanyContactStatisticsT = z.infer<
  typeof companyContactStatisticsSchema
>;

