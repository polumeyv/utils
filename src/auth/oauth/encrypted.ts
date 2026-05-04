import { Effect, ParseResult, Schema } from 'effect';
import { encryptSecret, decryptSecret } from '@polumeyv/lib/server';

/**
 * Schema codec applying AES-256-GCM at-rest encryption to a string column.
 *
 * Decoded form (in memory): plaintext.
 * Encoded form (on disk):   `enc:v1:<base64 iv>.<base64 ciphertext+tag>`.
 *
 * The single seam where encryption is enforced for `oidc_accounts.access_token`
 * and `oidc_accounts.refresh_token`. Compose with row schemas in
 * `OAuthAccountStore`; callers never touch ciphertext.
 */
export const makeEncryptedString = (passphrase: string) =>
	Schema.transformOrFail(Schema.String, Schema.String, {
		strict: true,
		decode: (ciphertext, _, ast) =>
			Effect.try({
				try: () => decryptSecret(ciphertext, passphrase),
				catch: () => new ParseResult.Type(ast, ciphertext, 'Decryption failed'),
			}),
		encode: (plaintext, _, ast) =>
			Effect.try({
				try: () => encryptSecret(plaintext, passphrase),
				catch: () => new ParseResult.Type(ast, plaintext, 'Encryption failed'),
			}),
	});
