import { ApiError, formFailure } from '$lib/server/api';
import { rethrow } from '$lib/server/errors';
import { projectBody } from '$lib/server/projects';
import type { Member, Project } from '$lib/types';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	try {
		const detail = await locals.api.get<{ project: Project; members: Member[] }>(
			`/orgs/${encodeURIComponent(params.org)}/projects/${encodeURIComponent(params.id)}`
		);
		return { titleKey: 'common.nav.projects', project: detail.project, members: detail.members };
	} catch (e) {
		rethrow(e, url);
	}
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const body = projectBody(await request.formData());
		try {
			await locals.api.patch(`/orgs/${params.org}/projects/${params.id}`, { ...body, dueDate: body.dueDate ?? undefined });
		} catch (e) {
			if (e instanceof ApiError) return fail(e.status, formFailure(e, { ...body, dueDate: body.dueDate ?? '' }));
			throw e;
		}
		redirect(303, `/app/${params.org}/projects/${params.id}`);
	}
};
