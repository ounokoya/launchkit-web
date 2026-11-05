import { clearSession } from '$lib/server/session';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (locals.token) await locals.api.post('/auth/logout').catch(() => undefined);
	clearSession(cookies);
	redirect(303, '/');
};
