<script lang="ts">
	// Fenêtre (W09b): a native <dialog>, so focus, Escape and the backdrop come from the browser.
	import type { Snippet } from 'svelte';

	let { open = false, label, onclose, children }: { open?: boolean; label: string; onclose?: () => void; children: Snippet } =
		$props();
	let dialog: HTMLDialogElement | undefined = $state();

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) dialog.showModal?.();
		if (!open && dialog.open) dialog.close();
	});
</script>

<dialog bind:this={dialog} aria-label={label} onclose={() => onclose?.()}>
	{@render children()}
</dialog>

<style>
	dialog {
		width: min(480px, calc(100vw - 32px));
		padding: 40px;
		border: none;
		border-radius: var(--radius-card);
		box-shadow: var(--shadow-modal);
		text-align: center;
	}
	dialog::backdrop {
		background: rgb(15 23 42 / 0.5);
	}
	@media (max-width: 480px) {
		dialog {
			padding: 28px 20px;
		}
	}
</style>
