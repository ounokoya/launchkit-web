<script lang="ts">
	import ProjectForm from '$lib/components/ProjectForm.svelte';
	import { t } from '$lib/i18n/t';

	let { data, form } = $props();
</script>

<svelte:head><title>{t('projects.new')} · {data.org.name}</title></svelte:head>

<h1 class="title">{t('projects.new')}</h1>
<ProjectForm members={data.members} {form} submit={t('projects.form.create')} cancelHref="/app/{data.org.id}/projects" />

<style>
	.title {
		font-size: var(--text-h2);
		font-weight: 700;
		margin-bottom: 24px;
	}
</style>
