import { ApiError, formFailure } from '$lib/server/api';
import { rethrow } from '$lib/server/errors';
import { projectBody } from '$lib/server/projects';
import type { Member } from '$lib/types';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	try {
		const { members } = await locals.api.get<{ members: Member[] }>(`/orgs/${encodeURIComponent(params.org)}/members`);
		return { titleKey: 'common.nav.projects', members };
	} catch (e) {
		rethrow(e, url);
	}
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const body = projectBody(await request.formData());
		let created: { project: { id: string } };
		try {
			created = await locals.api.post(`/orgs/${params.org}/projects`, { ...body, leadId: body.leadId || null });
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, formFailure(e, { ...body, dueDate: body.dueDate ?? '' }));
			throw e;
		}
		redirect(303, `/app/${params.org}/projects/${created.project.id}`);
	}
};
