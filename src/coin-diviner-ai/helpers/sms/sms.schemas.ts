import { z } from "zod";

export const resultSendSmsDuplicate = z.object({
  phone: z.string(),
  message_id: z.string().nullable(),
  response_code: z.number(),
  response_status: z.string(),
});

export const resultSendTurboSMS = z.object({
  message_id: z.string(),
  response_code: z.number(),
  response_status: z.string(),
  recipient: z.string().optional(),
  sent: z.string().optional(),
  updated: z.string().optional(),
  status: z.string().optional(),
  type: z.string().optional(),
  rejected_status: z.string().optional(),
  click_time: z.string().optional(),
});

export const responseSendTurboSMS = z.object({
  response_code: z.number(),
  response_status: z.string(),
  response_result: z
    .array(resultSendTurboSMS.or(resultSendSmsDuplicate))
    .nullable(),
});
