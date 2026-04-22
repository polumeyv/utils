export interface HttpStatusError {
	readonly statusCode: number;
}

const EFFECT_TAG_STATUS: Record<string, number> = {
	NoSuchElementException: 404,
	IllegalArgumentException: 400,
	ParseError: 400,
	TimeoutException: 408,
};

export function resolveHttpStatus(err: unknown): number {
	if (typeof err === 'object' && err !== null) {
		if ('statusCode' in err && typeof (err as any).statusCode === 'number') return (err as any).statusCode;
		if ('status' in err && typeof (err as any).status === 'number') return (err as any).status;
		if ('_tag' in err && typeof (err as any)._tag === 'string') return EFFECT_TAG_STATUS[(err as any)._tag] ?? 500;
	}
	return 500;
}
