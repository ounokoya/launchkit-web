<script lang="ts">
	import ProjectForm from '$lib/components/ProjectForm.svelte';
	import { t } from '$lib/i18n/t';

	let { data, form } = $props();
</script>

<svelte:head><title>{t('projects.detail.edit_project')} · {data.project.name}</title></svelte:head>

<h1 class="title">{t('projects.detail.edit_project')}</h1>
<ProjectForm project={data.project} members={data.members} {form} submit={t('common.action.save')}
	cancelHref="/app/{data.org.id}/projects/{data.project.id}" />

<style>
	.title {
		font-size: var(--text-h2);
		font-weight: 700;
		margin-bottom: 24px;
	}
</style>
