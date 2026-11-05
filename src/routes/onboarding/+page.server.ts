import { ApiError, formFailure } from '$lib/server/api';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	if (!locals.user) redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname)}`);
	return { firstOrg: locals.organizations.length === 0 };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const name = String((await request.formData()).get('name') ?? '');
		let created: { org: { id: string } };
		try {
			created = await locals.api.post('/orgs', { name });
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, formFailure(e, { name }));
			throw e;
		}
		redirect(303, `/app/${created.org.id}`);
	}
};
