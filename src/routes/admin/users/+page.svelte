<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import { shortDate } from '$lib/format';
	import { currentLocale, t } from '$lib/i18n/t';

	let { data } = $props();
</script>

<svelte:head><title>{t('admin.nav_users')} · LaunchKit</title></svelte:head>

<h1 class="title">{t('admin.nav_users')}</h1>
<!-- A table wider than a phone scrolls sideways: the keyboard must be able to reach it (WCAG 2.1.1). -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class="table-wrap" role="region" aria-label={t('admin.nav_users')} tabindex="0">
	<table>
		<thead>
			<tr><th>{t('admin.nav_users')}</th><th>{t('members.col_status')}</th><th>{t('admin.nav_orgs')}</th><th>{t('admin.col_created')}</th></tr>
		</thead>
		<tbody>
			{#each data.users as u (u.id)}
				<tr>
					<td><span class="who"><Avatar name={u.name} id={u.id} /><span><strong>{u.name}</strong><small>{u.email}</small></span></span></td>
					<td><Badge tone={u.emailVerified ? 'success' : 'warning'}>{u.emailVerified ? t('common.status.active') : t('common.status.pending')}</Badge></td>
					<td>{u.organizations}</td>
					<td>{shortDate(u.createdAt, currentLocale())}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.title {
		font-size: var(--text-h2);
		font-weight: 700;
		margin-bottom: 24px;
	}
	.table-wrap {
		border: 1px solid var(--color-border);
		border-radius: 14px;
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-small);
	}
	th {
		height: 46px;
		padding: 0 24px;
		background: var(--color-surface);
		text-align: left;
		font-size: var(--text-tiny);
		font-weight: 600;
		text-transform: uppercase;
		color: var(--color-text-secondary);
	}
	td {
		padding: 14px 24px;
		border-top: 1px solid var(--color-border);
		color: var(--color-text-secondary);
		white-space: nowrap;
	}
	.who {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.who > span {
		display: flex;
		flex-direction: column;
	}
	.who strong {
		color: var(--color-text);
		font-weight: 600;
	}
	small {
		font-size: var(--text-tiny);
	}
</style>
