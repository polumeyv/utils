const reported = new Set<string>();
setInterval(() => reported.clear(), 5 * 60 * 1000);

export function reportError(opts: {
	repo: string;
	token: string;
	error: Error;
	route: string | null;
	url: string;
}) {
	const id = Bun.randomUUIDv7();
	console.error(`[server-error] ${id}`, opts.error);

	const title = `[Production Error] ${opts.error.message.slice(0, 120)}`;
	if (reported.has(title)) return;
	reported.add(title);

	const api = `https://api.github.com/repos/${opts.repo}`;
	const body = [
		`**ID:** \`${id}\``,
		`**Route:** \`${opts.route ?? 'unknown'}\``,
		`**URL:** \`${opts.url}\``,
		'',
		'```',
		opts.error.stack ?? opts.error.message,
		'```',
	].join('\n');

	const headers = {
		Authorization: `token ${opts.token}`,
		Accept: 'application/vnd.github+json',
		'Content-Type': 'application/json',
	};

	fetch(`${api}/issues?state=open&labels=auto-error&per_page=100`, { headers })
		.then((r) => r.json())
		.then((issues: unknown) => {
			if (!Array.isArray(issues)) return;
			const existing = (issues as Array<{ title: string; number: number }>).find((i) => i.title === title);
			return existing
				? fetch(`${api}/issues/${existing.number}/comments`, {
						method: 'POST',
						headers,
						body: JSON.stringify({ body: `**Re-occurrence**\n\n${body}` }),
					})
				: fetch(`${api}/issues`, {
						method: 'POST',
						headers,
						body: JSON.stringify({ title, body, labels: ['auto-error'] }),
					});
		})
		.catch((e) => console.error('[error-reporter]', e));
}
