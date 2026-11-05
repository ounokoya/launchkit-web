// API errors met while loading a page become SvelteKit errors (W13 404, W14 403…) or a sign-in redirect.
import { error, redirect } from '@sveltejs/kit';
import { ApiError } from './api';

export function rethrow(e: unknown, url?: URL): never {
	if (e instanceof ApiError) {
		if (e.status === 401) redirect(303, `/login?redirectTo=${encodeURIComponent(url ? url.pathname + url.search : '/app')}`);
		error(e.status, { message: e.detail, code: e.code });
	}
	throw e;
}

/** Runs an API call; on a refused request (4xx) returns the ApiError instead of throwing. */
export async function attempt<T>(call: () => Promise<T>): Promise<T | ApiError> {
	try {
		return await call();
	} catch (e) {
		if (e instanceof ApiError && e.status < 500) return e;
		throw e;
	}
}
