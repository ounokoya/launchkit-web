<script lang="ts">
	// W02 · Inscription
	import Lock from '@lucide/svelte/icons/lock';
	import Mail from '@lucide/svelte/icons/mail';
	import { enhance } from '$app/forms';
	import AuthShell from '$lib/components/AuthShell.svelte';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';
	import FormError from '$lib/components/FormError.svelte';
	import { t } from '$lib/i18n/t';

	let { form } = $props();
</script>

<svelte:head><title>{t('auth.signup.title')} · LaunchKit</title></svelte:head>

<AuthShell
	title={t('auth.side.signup_title')}
	points={[t('auth.side.signup_point_1'), t('auth.side.signup_point_2'), t('auth.side.signup_point_3')]}
>
	<h1>{t('auth.signup.title')}</h1>
	<p class="lead">{t('auth.signup.subtitle')}</p>
	<form method="POST" use:enhance class="stack">
		<FormError {form} />
		<Field label={t('auth.field.full_name')} name="name" placeholder="Marie Koné" autocomplete="name" required
			value={form?.values?.name} error={form?.errors?.name} />
		<Field label={t('auth.field.email')} name="email" type="email" icon={Mail} placeholder="marie@demo.test"
			autocomplete="email" required value={form?.values?.email} error={form?.errors?.email}
			help={t('auth.signup.email_help')} />
		<Field label={t('auth.field.password')} name="password" type="password" icon={Lock} autocomplete="new-password"
			required error={form?.errors?.password} help={t('auth.signup.password_help', { min: 8 })} />
		<Button type="submit" size="lg" full>{t('auth.signup.submit')}</Button>
	</form>
	<p class="switch">{t('auth.signup.have_account')} <a href="/login">{t('auth.signup.go_login')}</a></p>
</AuthShell>

<style>
	.stack {
		display: flex;
		flex-direction: column;
		gap: 18px;
	}
	.stack :global(button[type='submit']) {
		margin-top: 14px;
	}
	.switch {
		text-align: center;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-primary-500);
		margin-top: 12px;
	}
</style>
