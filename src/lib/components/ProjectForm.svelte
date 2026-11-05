<script lang="ts">
	// Create / edit a project: fields of server-api.md (name, description, status, lead, due date).
	import { enhance } from '$app/forms';
	import { t } from '$lib/i18n/t';
	import type { Member, Project } from '$lib/types';
	import Button from './Button.svelte';
	import Field from './Field.svelte';
	import FormError from './FormError.svelte';

	type Form = { message?: string; errors?: Record<string, string[]>; values?: Record<string, string> } | null | undefined;
	let { project, members, form, submit, cancelHref }: { project?: Project; members: Member[]; form: Form; submit: string; cancelHref: string } =
		$props();
	const v = $derived(form?.values ?? {});
	const statuses = ['draft', 'in_progress', 'active'] as const;
</script>

<form method="POST" use:enhance class="form">
	<FormError {form} />
	<Field label={t('projects.form.name')} name="name" required maxlength={80} value={v.name ?? project?.name}
		error={form?.errors?.name} help={t('projects.form.name_help')} />
	<Field label={t('projects.form.description')} name="description" multiline maxlength={2000}
		value={v.description ?? project?.description} error={form?.errors?.description} />
	<div class="pair">
		<label class="select">
			<span>{t('projects.detail.status')}</span>
			<select name="status">
				{#each statuses as s (s)}
					<option value={s} selected={(v.status ?? project?.status ?? 'draft') === s}>{t(`common.status.${s}`)}</option>
				{/each}
			</select>
		</label>
		<label class="select">
			<span>{t('projects.detail.lead')}</span>
			<select name="leadId">
				<option value="">—</option>
				{#each members as m (m.id)}
					<option value={m.id} selected={(v.leadId ?? project?.leadId) === m.id}>{m.name}</option>
				{/each}
			</select>
		</label>
	</div>
	<Field label={t('projects.detail.due')} name="dueDate" type="date" value={v.dueDate ?? project?.dueDate}
		error={form?.errors?.dueDate} />
	<div class="buttons">
		<Button href={cancelHref} variant="secondary">{t('common.action.cancel')}</Button>
		<Button type="submit">{submit}</Button>
	</div>
</form>

<style>
	.form {
		display: flex;
		flex-direction: column;
		gap: 20px;
		max-width: 640px;
		padding: 28px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
	}
	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	.select {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: var(--text-small);
		font-weight: 500;
	}
	select {
		min-height: 44px;
		padding: 0 12px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		background: var(--color-bg);
		font-size: var(--text-control);
	}
	.buttons {
		display: flex;
		justify-content: flex-end;
		gap: 12px;
	}
	@media (max-width: 767px) {
		.form {
			padding: 20px 16px;
		}
		.pair {
			grid-template-columns: 1fr;
		}
	}
</style>
