import { Schema } from 'effect';

// Enums (match lookup table values)
export const ADDRESS_TYPE = Schema.Literal('current', 'user_home', 'user_billing', 'user_shipping', 'pro_home', 'pro_billing', 'pro_shipping', 'business');
export type AddressType = typeof ADDRESS_TYPE.Type;

export const TIMEZONE = Schema.Literal('America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Phoenix', 'America/Anchorage', 'Pacific/Honolulu', 'America/Puerto_Rico');

const name = Schema.String.pipe(
	Schema.minLength(1),
	Schema.maxLength(50),
	Schema.pattern(/^[\p{L}\s'\-]+$/u),
);

// Table schemas
export const AccountProfiles = Schema.Struct({
	sub: Schema.String,
	f_name: name,
	l_name: name,
	pref_email: Schema.Boolean,
	pref_sms: Schema.Boolean,
	privacy_visible: Schema.Boolean,
	privacy_email: Schema.Boolean,
	privacy_phone: Schema.Boolean,
	privacy_loc: Schema.Boolean,
	tz: TIMEZONE,
	military: Schema.Boolean,
	start_of_week: Schema.Boolean, // true = Monday, false = Sunday (default)
	// Membership
	stripe_customer_id: Schema.NullOr(Schema.String),
	stripe_subscription_id: Schema.NullOr(Schema.String),
	membership_interval: Schema.NullOr(Schema.Literal('month', 'year')),
	membership_period_end: Schema.NullOr(Schema.DateFromSelf),
	membership_will_renew: Schema.Boolean,
	// Setup
	is_uga_student: Schema.Boolean,
	dob: Schema.NullOr(Schema.DateFromSelf),
	grad_date: Schema.NullOr(Schema.DateFromSelf),
	updated: Schema.DateFromSelf,
});
export type AccountProfilesType = typeof AccountProfiles.Type;

export const AccountAddresses = Schema.Struct({
	owner_id: Schema.String,
	address_type: ADDRESS_TYPE,
	street: Schema.String,
	unit: Schema.optional(Schema.String),
	city: Schema.String,
	state: Schema.String,
	zip: Schema.String.pipe(Schema.pattern(/^\d{5}(-\d{4})?$/)),
	country: Schema.optional(Schema.String),
	name: Schema.optional(Schema.String),
	is_default: Schema.Boolean,
	coord: Schema.NullOr(Schema.Tuple(Schema.Number, Schema.Number)), // [lat, lng]
	updated: Schema.DateFromSelf,
});
export type AccountAddressesType = typeof AccountAddresses.Type;
