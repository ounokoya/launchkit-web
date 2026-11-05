import { rethrow } from '$lib/server/errors';
import type { Activity, Org, Project } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals, url }) => {
	try {
		const dashboard = await locals.api.get<{ org: Org; recentProjects: Project[]; activity: Activity[] }>(
			`/orgs/${encodeURIComponent(params.org)}/dashboard`
		);
		return { titleKey: 'common.nav.dashboard', recentProjects: dashboard.recentProjects, activity: dashboard.activity };
	} catch (e) {
		rethrow(e, url);
	}
};
