import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// /app: the first organization of the account, or creating one (W05).
export const load: PageServerLoad = ({ locals }) => {
	const first = locals.organizations[0];
	redirect(303, first ? `/app/${first.id}` : '/onboarding');
};
