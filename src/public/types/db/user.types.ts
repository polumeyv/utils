import { Schema } from 'effect';

export const UserSearchHistory = Schema.Struct({
	id: Schema.String,
	sub: Schema.String,
	query: Schema.String,
	filters: Schema.NullOr(Schema.Record({ key: Schema.String, value: Schema.Unknown })),
	results_count: Schema.NullOr(Schema.Number),
});
export type UserSearchHistoryType = typeof UserSearchHistory.Type;

export const UserFavorites = Schema.Struct({
	sub: Schema.String,
	b_id: Schema.String,
});
export type UserFavoritesType = typeof UserFavorites.Type;
