// Server-side client of the LaunchKit API (ADR-0010): only the SvelteKit server talks to the API, with the
// session token taken from the HttpOnly cookie.
import { env } from '$env/dynamic/private';

export class ApiError extends Error {
	constructor(
		readonly status: number,
		readonly code: string,
		readonly detail: string,
		readonly errors: Record<string, string[]> = {}
	) {
		super(`${status} ${code}`);
	}
}

export type ApiOptions = { token?: string; locale?: string };

export function apiUrl(): string {
	return (env.API_URL ?? 'http://localhost:5080').replace(/\/$/, '');
}

export function createApi(fetchFn: typeof fetch, options: ApiOptions = {}) {
	async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
		const headers: Record<string, string> = { Accept: 'application/json' };
		if (body !== undefined) headers['Content-Type'] = 'application/json';
		if (options.token) headers.Authorization = `Bearer ${options.token}`;
		if (options.locale) headers['Accept-Language'] = options.locale;
		const res = await fetchFn(`${apiUrl()}/api/v1${path}`, {
			method,
			headers,
			body: body === undefined ? undefined : JSON.stringify(body)
		});
		if (res.status === 204 || res.status === 202) {
			const text = await res.text();
			return (text ? JSON.parse(text) : null) as T;
		}
		const data = await res.json().catch(() => null);
		if (!res.ok) {
			throw new ApiError(
				res.status,
				data?.code ?? 'server_error',
				data?.detail ?? res.statusText,
				data?.errors ?? {}
			);
		}
		return data as T;
	}

	return {
		get: <T>(path: string) => call<T>('GET', path),
		post: <T>(path: string, body: unknown = {}) => call<T>('POST', path, body),
		patch: <T>(path: string, body: unknown) => call<T>('PATCH', path, body),
		delete: <T = null>(path: string) => call<T>('DELETE', path)
	};
}

export type Api = ReturnType<typeof createApi>;

/** Form values of a failed action, field errors included, for `fail(status, …)`. */
export function formFailure<V extends Record<string, string>>(error: ApiError, values: V = {} as V) {
	return { code: error.code, message: error.detail, errors: error.errors, values };
}
