<script lang="ts">
	// Champ of the design system: label above, 44 px input, optional icon, help or error below.
	// `defaultValue`, not `value`: what the person typed is never overwritten (hydration, re-render).
	import type { Component } from 'svelte';

	type Props = {
		label: string;
		name: string;
		type?: string;
		value?: string | null;
		placeholder?: string;
		help?: string;
		error?: string | string[];
		icon?: Component;
		required?: boolean;
		autocomplete?: HTMLInputElement['autocomplete'];
		multiline?: boolean;
		maxlength?: number;
	};
	let {
		label,
		name,
		type = 'text',
		value = '',
		placeholder,
		help,
		error,
		icon: Icon,
		required = false,
		autocomplete,
		multiline = false,
		maxlength
	}: Props = $props();

	const id = $derived(`field-${name}`);
	const message = $derived(Array.isArray(error) ? error.join(' ') : error);
</script>

<div class="field">
	<label for={id}>{label}</label>
	<div class="control" class:invalid={!!message} class:with-icon={!!Icon}>
		{#if Icon}<span class="icon"><Icon size={18} aria-hidden="true" /></span>{/if}
		{#if multiline}
			<textarea {id} {name} {placeholder} {required} {maxlength} rows="4" defaultValue={value ?? ''}
				aria-invalid={!!message} aria-describedby={message || help ? `${id}-note` : undefined}></textarea>
		{:else}
			<input
				{id}
				{name}
				{type}
				defaultValue={value ?? ''}
				{placeholder}
				{required}
				{autocomplete}
				{maxlength}
				aria-invalid={!!message}
				aria-describedby={message || help ? `${id}-note` : undefined}
			/>
		{/if}
	</div>
	{#if message}
		<p class="note error" id="{id}-note">{message}</p>
	{:else if help}
		<p class="note" id="{id}-note">{help}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	label {
		font-size: var(--text-small);
		font-weight: 500;
	}
	.control {
		position: relative;
	}
	input,
	textarea {
		width: 100%;
		min-height: 44px;
		padding: 11px 14px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-control);
		background: var(--color-bg);
		font-size: var(--text-control);
	}
	textarea {
		resize: vertical;
	}
	.with-icon input {
		padding-left: 46px;
	}
	.icon {
		position: absolute;
		left: 14px;
		top: 13px;
		color: var(--color-text-secondary);
	}
	input::placeholder,
	textarea::placeholder {
		color: var(--color-text-muted);
	}
	.invalid input,
	.invalid textarea {
		border-color: var(--color-danger-500);
	}
	.note {
		font-size: var(--text-tiny);
		color: var(--color-text-secondary);
	}
	.note.error {
		color: var(--color-danger-700);
	}
</style>
