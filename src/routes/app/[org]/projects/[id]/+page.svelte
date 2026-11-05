<script lang="ts">
	// W11 · Projet : détail
	import { enhance } from '$app/forms';
	import Alert from '$lib/components/Alert.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import { activityText, longDate, relativeTime, roleTone, statusTone } from '$lib/format';
	import { currentLocale, t } from '$lib/i18n/t';

	let { data, form } = $props();
	const p = $derived(data.project);
	const base = $derived(`/app/${data.org.id}/projects`);
	const canDelete = $derived(data.isAdmin || p.createdBy === data.user.id);
</script>

<svelte:head><title>{p.name} · {data.org.name}</title></svelte:head>

<nav class="crumbs" aria-label="breadcrumb"><a href={base}>{t('projects.title')}</a><span aria-hidden="true">/</span><span aria-current="page">{p.name}</span></nav>

<div class="head">
	<h1>{p.name}</h1>
	<Badge tone={statusTone[p.status]}>{t(`common.status.${p.status}`)}</Badge>
	<span class="spacer"></span>
	<Button href="{base}/{p.id}/edit" variant="secondary">{t('common.action.edit')}</Button>
	{#if canDelete && !form?.confirmDelete}
		<form method="POST" action="?/delete" use:enhance>
			<Button type="submit" variant="danger">{t('common.action.delete')}</Button>
		</form>
	{/if}
</div>

{#if form?.confirmDelete}
	<section class="confirm" aria-labelledby="confirm-title">
		<p id="confirm-title"><strong>{t('projects.confirm_delete.title', { project: p.name })}</strong></p>
		<p class="muted">{t('projects.confirm_delete.text')}</p>
		<form method="POST" action="?/delete" use:enhance class="confirm-buttons">
			<input type="hidden" name="confirmed" value="yes" />
			<Button href="{base}/{p.id}" variant="secondary">{t('common.action.cancel')}</Button>
			<Button type="submit" variant="danger">{t('common.action.delete')}</Button>
		</form>
	</section>
{/if}
{#if form?.message}<Alert tone="danger">{form.message}</Alert>{/if}

<div class="layout">
	<div class="main">
		<section class="card">
			<h2>{t('projects.detail.description')}</h2>
			<p class="text">{p.description || '—'}</p>
		</section>
		<section class="card">
			<h2>{t('projects.detail.history')}</h2>
			<ul class="history">
				{#each data.history as a (a.id)}
					<li>
						<Avatar name={a.actor?.name ?? 'LaunchKit'} id={a.actor?.id ?? 'system'} />
						<span><span class="what">{activityText(a, currentLocale(), data.org.name)}</span>
							<small>{relativeTime(a.createdAt, currentLocale())}</small></span>
					</li>
				{/each}
			</ul>
		</section>
	</div>
	<div class="side">
		<section class="card">
			<h2>{t('projects.detail.details')}</h2>
			<dl>
				<dt>{t('projects.detail.status')}</dt><dd>{t(`common.status.${p.status}`)}</dd>
				<dt>{t('projects.detail.lead')}</dt><dd>{p.leadName ?? '—'}</dd>
				<dt>{t('projects.detail.due')}</dt><dd>{p.dueDate ? longDate(p.dueDate, currentLocale()) : '—'}</dd>
				<dt>{t('projects.detail.created_on')}</dt><dd>{longDate(p.createdAt, currentLocale())}</dd>
			</dl>
		</section>
		<section class="card">
			<h2>{t('projects.detail.members')}</h2>
			<ul class="members">
				{#each data.members as m (m.id)}
					<li><Avatar name={m.name} id={m.id} /><strong>{m.name}</strong><Badge tone={roleTone[m.role]}>{t(`common.role.${m.role}`)}</Badge></li>
				{/each}
			</ul>
		</section>
	</div>
</div>

<style>
	.crumbs {
		display: flex;
		gap: 10px;
		font-size: var(--text-small);
		color: var(--color-text-secondary);
	}
	.crumbs a {
		color: var(--color-text-secondary);
		font-weight: 500;
	}
	.crumbs [aria-current] {
		color: var(--color-text);
		font-weight: 600;
	}
	.head {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 16px;
		margin: 12px 0 28px;
	}
	h1 {
		font-size: 1.75rem;
		font-weight: 700;
	}
	.spacer {
		flex: 1;
	}
	.confirm {
		margin-bottom: 24px;
		padding: 20px 24px;
		border: 1px solid var(--color-danger-500);
		border-radius: var(--radius-card);
		background: var(--color-danger-50);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.confirm-buttons {
		display: flex;
		gap: 12px;
		justify-content: flex-end;
		margin-top: 10px;
	}
	.layout {
		display: grid;
		grid-template-columns: 700fr 372fr;
		gap: 24px;
		align-items: start;
	}
	.main,
	.side {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}
	.card {
		padding: 24px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
	}
	h2 {
		font-size: 1rem;
		font-weight: 700;
		margin-bottom: 14px;
	}
	.text {
		color: var(--color-text-secondary);
		font-size: var(--text-control);
		white-space: pre-line;
	}
	.history,
	.members {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.history li {
		display: flex;
		gap: 12px;
	}
	.history li > span {
		display: flex;
		flex-direction: column;
	}
	.what {
		font-size: var(--text-small);
		font-weight: 500;
	}
	small {
		font-size: var(--text-tiny);
		color: var(--color-text-secondary);
	}
	dl {
		margin: 0;
		display: grid;
		gap: 4px;
	}
	dt {
		font-size: var(--text-caption);
		font-weight: 500;
		color: var(--color-text-secondary);
	}
	dd {
		margin: 0 0 12px;
		font-size: var(--text-control);
		font-weight: 500;
	}
	.members li {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.members strong {
		flex: 1;
		font-size: var(--text-small);
		font-weight: 600;
	}
	@media (max-width: 1023px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
</style>
