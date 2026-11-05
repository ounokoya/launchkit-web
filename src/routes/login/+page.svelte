<script lang="ts">
	// W03 · Connexion
	import Lock from '@lucide/svelte/icons/lock';
	import Mail from '@lucide/svelte/icons/mail';
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '$lib/components/Alert.svelte';
	import AuthShell from '$lib/components/AuthShell.svelte';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';
	import FormError from '$lib/components/FormError.svelte';
	import { t } from '$lib/i18n/t';

	let { data, form } = $props();
	const signup = $derived(`/signup${page.url.search}`);
</script>

<svelte:head><title>{t('auth.login.title')} · LaunchKit</title></svelte:head>

<AuthShell
	title={t('auth.side.login_title')}
	points={[t('auth.side.login_point_1'), t('auth.side.login_point_2'), t('auth.side.login_point_3')]}
>
	<h1>{t('auth.login.title')}</h1>
	<p class="lead">{t('auth.login.subtitle')}</p>
	<form method="POST" use:enhance class="stack">
		{#if data.expired && !form}<Alert tone="warning">{t('error.session_expired')}</Alert>{/if}
		<FormError {form} />
		{#if form?.code === 'email_not_verified'}
			<a class="resend" href="/verify-email?email={encodeURIComponent(form.values?.email ?? '')}">{t('auth.verify.resend')}</a>
		{/if}
		<Field label={t('auth.field.email')} name="email" type="email" icon={Mail} placeholder="marie@demo.test"
			autocomplete="email" required value={form?.values?.email} error={form?.errors?.email} />
		<Field label={t('auth.field.password')} name="password" type="password" icon={Lock}
			autocomplete="current-password" required error={form?.errors?.password} />
		<Button type="submit" size="lg" full>{t('auth.login.submit')}</Button>
	</form>
	<p class="switch">{t('auth.login.no_account')} <a href={signup}>{t('auth.login.go_signup')}</a></p>
</AuthShell>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.stack :global(button[type='submit']) {
		margin-top: 12px;
	}
	.resend {
		font-size: var(--text-small);
		font-weight: 600;
	}
	.switch {
		text-align: center;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-primary-500);
		margin-top: 12px;
	}
</style>
