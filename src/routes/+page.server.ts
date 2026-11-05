import { env } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';

// Links that depend on the owner of the demo (GitHub organization, contact): hidden until configured.
export const load: PageServerLoad = () => ({
	sourceUrl: env.PUBLIC_SOURCE_URL || null,
	contactUrl: env.PUBLIC_CONTACT_URL || null,
	androidUrl: env.PUBLIC_ANDROID_URL || null
});
