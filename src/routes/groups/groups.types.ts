import { z } from "zod";
import { groupsQuerySchema, groupPublicSchema } from "./groups.schemas";

export type GroupsQueryT = z.infer<typeof groupsQuerySchema>;
export type GroupPublicT = z.infer<typeof groupPublicSchema>;

export interface GroupsFilterI {
  $or?: Array<{
    [key: string]: { $regex: string; $options: string };
  }>;
  botStatus?: string | { $in: string[] };
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  updatedAt?: {
    $gte?: Date;
    $lte?: Date;
  };
  addedBy?: any;
  _id?: { $in: any[] };
}

export interface SortQueryI {
  [key: string]: 1 | -1;
}
