import { Schema, model } from "mongoose";

const searchQuerySM = new Schema(
  {
    query: { type: String, required: true, unique: true },
    lastSearched: { type: Date, required: true },
    isDeepSearch: { type: Boolean, default: false },
    lastDeepSearch: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

searchQuerySM.index({ query: 1 });
searchQuerySM.index({ lastSearched: 1 });

const SearchQueryModel = model("coinDivinerAI-search-queries", searchQuerySM);

export default SearchQueryModel;
