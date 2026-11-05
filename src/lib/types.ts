// Shapes returned by the API (server/docs/api_usage.md).
export type User = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	isSuperAdmin: boolean;
	locale: 'fr' | 'en';
};

export type Role = 'owner' | 'admin' | 'member';

export type MyOrganization = { id: string; name: string; plan: 'free' | 'pro'; role: Role; members: number };

export type Usage = { projects: number; members: number; pendingInvitations: number };
export type Limits = { projects: number | null; members: number | null };

export type Org = {
	id: string;
	name: string;
	plan: 'free' | 'pro';
	usage: Usage;
	limits: Limits;
	createdAt: string;
};

export type Project = {
	id: string;
	name: string;
	description: string;
	status: 'active' | 'in_progress' | 'draft';
	leadId: string | null;
	leadName: string | null;
	dueDate: string | null;
	createdBy: string;
	createdAt: string;
	updatedAt: string;
};

export type Activity = {
	id: string;
	type: string;
	data: Record<string, string>;
	projectId: string | null;
	actor: { id: string; name: string } | null;
	createdAt: string;
};

export type Member = { id: string; name: string; email: string; role: Role; joinedAt: string };
export type Invitation = { id: string; email: string; role: Role; createdAt: string; expiresAt: string; expired: boolean };
