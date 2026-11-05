<script lang="ts">
	// W07 · Membres et invitations, W07b · un seul membre
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import Mail from '@lucide/svelte/icons/mail';
	import { enhance } from '$app/forms';
	import Avatar from '$lib/components/Avatar.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import EmptyState from '$lib/components/EmptyState.svelte';
	import Field from '$lib/components/Field.svelte';
	import FormError from '$lib/components/FormError.svelte';
	import { roleTone } from '$lib/format';
	import { t } from '$lib/i18n/t';

	let { data, form } = $props();
	const org = $derived(data.org);
	const alone = $derived(data.members.length === 1 && data.invitations.length === 0);
	const summary = $derived(
		[
			t('members.summary_active', { n: org.usage.members }),
			...(org.usage.pendingInvitations > 0 ? [t('members.summary_pending', { n: org.usage.pendingInvitations })] : []),
			...(org.limits.members !== null
				? [t('members.summary_limit', { plan: t(`common.plan.${org.plan}`), max: org.limits.members })]
				: [])
		].join(' · ')
	);
	let role = $state('member');
</script>

<svelte:head><title>{t('common.nav.members')} · {org.name}</title></svelte:head>

<h1 class="title">{t('members.title')}</h1>
<p class="muted intro">{summary}</p>

<div class="layout">
	<div class="main">
		<section class="table" aria-label={t('members.title')}>
			<div class="head" aria-hidden="true">
				<span>{t('members.col_member')}</span><span>{t('members.col_role')}</span><span>{t('members.col_status')}</span><span></span>
			</div>
			<ul>
				{#each data.members as m (m.id)}
					<li class="row">
						<span class="who"><Avatar name={m.name} id={m.id} /><span><strong>{m.name}</strong><small>{m.email}</small></span></span>
						<span><Badge tone={roleTone[m.role]}>{t(`common.role.${m.role}`)}</Badge></span>
						<span><Badge tone="success">{t('common.status.active')}</Badge></span>
						<span class="menu-cell">
							{#if m.role !== 'owner' && (data.isAdmin || m.id === data.user.id)}
								<details class="menu">
									<summary aria-label="{m.name} · actions"><Ellipsis size={20} aria-hidden="true" /></summary>
									<div class="menu-list">
										{#if data.isAdmin}
											<form method="POST" action="?/role" use:enhance>
												<input type="hidden" name="user" value={m.id} />
												<input type="hidden" name="role" value={m.role === 'admin' ? 'member' : 'admin'} />
												<button>{t('members.action.change_role')} · {t(`common.role.${m.role === 'admin' ? 'member' : 'admin'}`)}</button>
											</form>
										{/if}
										<form method="POST" action="?/remove" use:enhance>
											<input type="hidden" name="user" value={m.id} />
											<button class="danger">{t('members.action.remove')}</button>
										</form>
									</div>
								</details>
							{/if}
						</span>
					</li>
				{/each}
				{#each data.invitations as i (i.id)}
					<li class="row">
						<span class="who"><span class="pending-avatar"><Mail size={16} aria-hidden="true" /></span><span><strong>{i.email}</strong></span></span>
						<span><Badge tone={roleTone[i.role]}>{t(`common.role.${i.role}`)}</Badge></span>
						<span><Badge tone="warning">{t('common.status.pending')}</Badge></span>
						<span class="menu-cell">
							<details class="menu">
								<summary aria-label="{i.email} · actions"><Ellipsis size={20} aria-hidden="true" /></summary>
								<div class="menu-list">
									<form method="POST" action="?/resend" use:enhance>
										<input type="hidden" name="invitation" value={i.id} />
										<button>{t('members.action.resend_invite')}</button>
									</form>
									<form method="POST" action="?/cancel" use:enhance>
										<input type="hidden" name="invitation" value={i.id} />
										<button class="danger">{t('members.action.cancel_invite')}</button>
									</form>
								</div>
							</details>
						</span>
					</li>
				{/each}
			</ul>
			{#if alone}
				<EmptyState illustration="membres-vide" framed={false} title={t('members.empty.title')}
					text={t('members.empty.text', { org: org.name })} />
			{/if}
		</section>

		<section class="legend">
			<h2>{t('members.roles_help.title')}</h2>
			<p>{t('members.roles_help.owner')}<br />{t('members.roles_help.admin')}<br />{t('members.roles_help.member')}</p>
		</section>
	</div>

	{#if data.isAdmin}
		<aside class="panel">
			<h2>{t('members.invite.title')}</h2>
			<p class="muted small">{t('members.invite.desc')}</p>
			<form method="POST" action="?/invite" use:enhance class="invite">
				<FormError {form} />
				{#if form?.invited}<p class="ok" role="status">{t('members.toast.invitation_sent', { email: form.invited })}</p>{/if}
				<Field label={t('auth.field.email')} name="email" type="email" icon={Mail} placeholder="yao@demo.test" required
					value={form?.values?.email} error={form?.errors?.email} />
				<fieldset>
					<legend>{t('members.invite.role')}</legend>
					{#each ['admin', 'member'] as r (r)}
						<label class="choice" class:selected={role === r}>
							<input type="radio" name="role" value={r} bind:group={role} />
							<span><strong>{t(`common.role.${r}`)}</strong><small>{t(`common.role.${r}_desc`)}</small></span>
						</label>
					{/each}
				</fieldset>
				<Button type="submit" full>{t('members.invite.submit')}</Button>
			</form>
		</aside>
	{/if}
</div>

<style>
	.title {
		font-size: var(--text-h2);
		font-weight: 700;
	}
	.intro {
		margin-top: 6px;
		font-size: var(--text-small);
	}
	.small {
		font-size: var(--text-small);
	}
	.layout {
		display: grid;
		grid-template-columns: 660fr 412fr;
		gap: 24px;
		margin-top: 28px;
		align-items: start;
	}
	.main {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.table {
		border: 1px solid var(--color-border);
		border-radius: 14px;
		background: var(--color-bg);
	}
	.head,
	.row {
		display: grid;
		grid-template-columns: 1fr 150px 130px 40px;
		align-items: center;
		gap: 12px;
		padding: 0 24px;
	}
	.head {
		height: 46px;
		background: var(--color-surface);
		border-radius: 14px 14px 0 0;
		font-size: var(--text-tiny);
		font-weight: 600;
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.row {
		min-height: 72px;
		border-top: 1px solid var(--color-border);
	}
	.who {
		display: flex;
		align-items: center;
		gap: 12px;
		min-width: 0;
	}
	.who > span:last-child {
		display: flex;
		flex-direction: column;
		min-width: 0;
	}
	.who strong {
		font-size: var(--text-small);
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	small {
		font-size: var(--text-tiny);
		color: var(--color-text-secondary);
	}
	.pending-avatar {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-warning-50);
		color: var(--color-warning-700);
	}
	.menu {
		position: relative;
	}
	.menu summary {
		list-style: none;
		cursor: pointer;
		color: var(--color-text-secondary);
	}
	.menu summary::-webkit-details-marker {
		display: none;
	}
	.menu-list {
		position: absolute;
		right: 0;
		z-index: 10;
		min-width: 220px;
		padding: 6px;
		background: var(--color-bg);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		box-shadow: var(--shadow-modal);
	}
	.menu-list button {
		width: 100%;
		padding: 8px 10px;
		border: none;
		border-radius: var(--radius-md);
		background: none;
		text-align: left;
		font-size: var(--text-small);
		cursor: pointer;
	}
	.menu-list button:hover {
		background: var(--color-surface);
	}
	.menu-list .danger {
		color: var(--color-danger-700);
	}
	.legend {
		padding: 18px 24px;
		border: 1px solid var(--color-border);
		border-radius: 14px;
		background: var(--color-surface);
	}
	.legend h2 {
		font-size: var(--text-control);
		font-weight: 700;
	}
	.legend p {
		margin-top: 8px;
		font-size: var(--text-caption);
		color: var(--color-text-secondary);
		line-height: 1.6;
	}
	.panel {
		padding: 24px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
		background: var(--color-bg);
	}
	.panel h2 {
		font-size: var(--text-h3);
		font-weight: 700;
	}
	.invite {
		display: flex;
		flex-direction: column;
		gap: 18px;
		margin-top: 22px;
	}
	fieldset {
		border: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}
	legend {
		font-size: var(--text-small);
		font-weight: 500;
		margin-bottom: 8px;
	}
	.choice {
		display: flex;
		gap: 12px;
		align-items: center;
		padding: 10px 16px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		cursor: pointer;
	}
	.choice.selected {
		border-color: var(--color-primary-500);
		background: var(--color-primary-50);
	}
	.choice input {
		accent-color: var(--color-primary-500);
	}
	.choice span {
		display: flex;
		flex-direction: column;
	}
	.choice strong {
		font-size: var(--text-small);
		font-weight: 600;
	}
	.ok {
		color: var(--color-success-700);
		font-size: var(--text-small);
		font-weight: 500;
	}
	@media (max-width: 1279px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
	@media (max-width: 1023px) {
		.head {
			display: none;
		}
		.row {
			grid-template-columns: 1fr auto 32px;
			grid-template-areas: 'who who menu' 'role status status';
			padding: 14px 16px;
			row-gap: 8px;
		}
		.row > :nth-child(1) {
			grid-area: who;
		}
		.row > :nth-child(2) {
			grid-area: role;
		}
		.row > :nth-child(3) {
			grid-area: status;
		}
		.row > :nth-child(4) {
			grid-area: menu;
		}
	}
</style>
