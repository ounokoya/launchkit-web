<script lang="ts">
	// Paramètres: profile and language, with the existing components (no dedicated mock-up).
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';
	import FormError from '$lib/components/FormError.svelte';
	import { currentLocale, t } from '$lib/i18n/t';

	let { data, form } = $props();
</script>

<svelte:head><title>{t('common.nav.settings')} · LaunchKit</title></svelte:head>

<h1 class="title">{t('common.nav.profile')}</h1>
<form method="POST" use:enhance class="form">
	<FormError {form} />
	{#if form?.saved}<p class="ok" role="status">{t('projects.toast.saved')}</p>{/if}
	<Field label={t('auth.field.full_name')} name="name" required maxlength={80} value={form?.values?.name ?? data.user.name}
		error={form?.errors?.name} />
	<Field label={t('auth.field.email')} name="email-readonly" value={data.user.email} help={t('auth.signup.email_help')} />
	<label class="select">
		<span>{t('common.language.label')}</span>
		<select name="locale">
			<option value="fr" selected={currentLocale() === 'fr'} lang="fr">{t('common.language.fr')}</option>
			<option value="en" selected={currentLocale() === 'en'} lang="en">{t('common.language.en')}</option>
		</select>
	</label>
	<div><Button type="submit">{t('common.action.save')}</Button></div>
</form>

<style>
	.title {
		font-size: var(--text-h2);
		font-weight: 700;
		margin-bottom: 24px;
	}
	.form {
		display: flex;
		flex-direction: column;
		gap: 20px;
		max-width: 520px;
		padding: 28px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
	}
	.form :global(input[name='email-readonly']) {
		background: var(--color-surface);
		pointer-events: none;
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
	.ok {
		color: var(--color-success-700);
		font-size: var(--text-small);
		font-weight: 500;
	}
</style>
