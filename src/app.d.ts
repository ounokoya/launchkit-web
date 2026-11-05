import type { Locale } from '$lib/i18n';
import type { Api } from '$lib/server/api';
import type { MyOrganization, User } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			locale: Locale;
			token?: string;
			user?: User;
			organizations: MyOrganization[];
			api: Api;
		}
		interface PageData {
			locale: Locale;
			user?: User;
		}
		interface Error {
			message: string;
			code?: string;
		}
	}
}

export {};
