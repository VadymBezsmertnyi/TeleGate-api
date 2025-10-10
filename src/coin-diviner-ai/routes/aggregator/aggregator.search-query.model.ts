import { Schema, model } from "mongoose";

const searchQuerySchema = new Schema(
  {
    query: { type: String, required: true, unique: true },
    lastSearched: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

searchQuerySchema.index({ query: 1 });
searchQuerySchema.index({ lastSearched: 1 });

const SearchQueryModel = model(
  "coinDivinerAI-search-queries",
  searchQuerySchema
);

export default SearchQueryModel;
