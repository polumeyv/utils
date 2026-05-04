/**
 * AES-256-GCM envelope encryption for secrets at rest.
 *
 * Caller supplies a passphrase (e.g. CRYPTO_KEY env); we derive a 32-byte key
 * via SHA-256 and encrypt each value with a fresh random IV. Output is a
 * tagged string `enc:v1:<base64 iv>.<base64 ciphertext+tag>`.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';

const VERSION = 'enc:v1:';
const IV_LEN = 12;
const TAG_LEN = 16;

const deriveKey = (passphrase: string) => createHash('sha256').update(passphrase).digest();

export const encryptSecret = (plaintext: string, passphrase: string): string => {
	const key = deriveKey(passphrase);
	const iv = randomBytes(IV_LEN);
	const cipher = createCipheriv('aes-256-gcm', key, iv);
	const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const tag = cipher.getAuthTag();
	return `${VERSION}${iv.toString('base64')}.${Buffer.concat([encrypted, tag]).toString('base64')}`;
};

export const decryptSecret = (value: string, passphrase: string): string => {
	if (!value.startsWith(VERSION)) throw new Error('Missing encryption version prefix');
	const [ivB64, payloadB64] = value.slice(VERSION.length).split('.');
	if (!ivB64 || !payloadB64) throw new Error('Malformed encrypted value');
	const key = deriveKey(passphrase);
	const iv = Buffer.from(ivB64, 'base64');
	const combined = Buffer.from(payloadB64, 'base64');
	const ciphertext = combined.subarray(0, combined.length - TAG_LEN);
	const tag = combined.subarray(combined.length - TAG_LEN);
	const decipher = createDecipheriv('aes-256-gcm', key, iv);
	decipher.setAuthTag(tag);
	return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
};
