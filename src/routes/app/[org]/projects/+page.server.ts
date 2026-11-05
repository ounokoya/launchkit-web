import { rethrow } from '$lib/server/errors';
import type { Project } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	try {
		const projects = await locals.api.get<Project[]>(`/orgs/${encodeURIComponent(params.org)}/projects`);
		const q = url.searchParams.get('q')?.trim() ?? '';
		const shown = q ? projects.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase())) : projects;
		return { titleKey: 'common.nav.projects', projects: shown, total: projects.length, q };
	} catch (e) {
		rethrow(e, url);
	}
};
