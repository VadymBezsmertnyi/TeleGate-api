import { z } from "zod";
import {
  companySchema,
  companyListSchema,
  companyCreateSchema,
  companyUpdateSchema,
  companyIdParamsSchema,
  companyPasswordQuerySchema,
  companyMessageSchema,
  companyContactSummarySchema,
  companyStatisticsSchema,
} from "./company.schemas";

export type CompanyT = z.infer<typeof companySchema>;
export type CompanyListResponseT = z.infer<typeof companyListSchema>;
export type CompanyCreateBodyT = z.infer<typeof companyCreateSchema>;
export type CompanyUpdateBodyT = z.infer<typeof companyUpdateSchema>;
export type CompanyIdParamsT = z.infer<typeof companyIdParamsSchema>;
export type CompanyPasswordQueryT = z.infer<typeof companyPasswordQuerySchema>;
export type CompanyMessageResponseT = z.infer<typeof companyMessageSchema>;
export type CompanyContactSummaryT = z.infer<typeof companyContactSummarySchema>;
export type CompanyStatisticsT = z.infer<typeof companyStatisticsSchema>;

