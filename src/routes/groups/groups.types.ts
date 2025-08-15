import { z } from "zod";
import { groupsQuerySchema, groupPublicSchema } from "./groups.schemas";

export type GroupsQuery = z.infer<typeof groupsQuerySchema>;
export type GroupPublic = z.infer<typeof groupPublicSchema>;

export interface GroupsFilter {
  $or?: Array<{
    [key: string]: { $regex: string; $options: string };
  }>;
  botStatus?: string | { $in: string[] };
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  addedBy?: any;
  _id?: { $in: any[] };
}

export interface SortQuery {
  [key: string]: 1 | -1;
}
