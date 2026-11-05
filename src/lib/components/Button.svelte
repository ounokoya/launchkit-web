<script lang="ts">
	// Bouton of the Penpot design system: primary, secondary, ghost, danger; md (40 px), lg (46 px), sm (33 px).
	import type { Snippet } from 'svelte';

	type Props = {
		variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
		size?: 'sm' | 'md' | 'lg';
		href?: string;
		type?: 'button' | 'submit';
		name?: string;
		value?: string;
		formaction?: string;
		disabled?: boolean;
		full?: boolean;
		external?: boolean;
		children: Snippet;
	};
	let {
		variant = 'primary',
		size = 'md',
		href,
		type = 'button',
		name,
		value,
		formaction,
		disabled = false,
		full = false,
		external = false,
		children
	}: Props = $props();
</script>

{#if href}
	<a
		class="btn {variant} {size}"
		class:full
		{href}
		target={external ? '_blank' : undefined}
		rel={external ? 'noopener noreferrer' : undefined}>{@render children()}</a
	>
{:else}
	<button class="btn {variant} {size}" class:full {type} {name} {value} {formaction} {disabled}
		>{@render children()}</button
	>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		border: 1px solid transparent;
		border-radius: var(--radius-control);
		font-size: var(--text-control);
		font-weight: 600;
		line-height: 1.2;
		cursor: pointer;
		text-decoration: none;
		white-space: nowrap;
		transition: background-color 0.15s;
	}
	.btn:hover {
		text-decoration: none;
	}
	.md {
		padding: 10px 18px;
	}
	.lg {
		padding: 13px 24px;
	}
	.sm {
		padding: 7px 14px;
		font-size: var(--text-small);
	}
	.full {
		width: 100%;
	}
	.primary {
		background: var(--color-primary-500);
		color: #fff;
	}
	.primary:hover {
		background: var(--color-primary-600);
	}
	.secondary {
		background: var(--color-bg);
		border-color: var(--color-border);
		color: var(--color-text);
	}
	.secondary:hover {
		background: var(--color-surface);
	}
	.ghost {
		background: transparent;
		color: var(--color-primary-500);
	}
	.ghost:hover {
		background: var(--color-primary-50);
	}
	.danger {
		background: var(--color-danger-600);
		color: #fff;
	}
	.danger:hover {
		background: var(--color-danger-700);
	}
	button:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
</style>
