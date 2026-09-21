<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		label: string;
		/** Extra hint rendered next to the label, e.g. "(optional)". */
		hint?: string;
		error?: string;
		/** `caps` matches the tracker forms, `plain` the dashboard form. */
		tone?: 'caps' | 'plain';
		class?: string;
		children: Snippet;
	};

	let { label, hint = '', error = '', tone = 'caps', class: className = '', children }: Props = $props();
</script>

<label class="flex flex-col gap-1 {className}">
	<span
		class={tone === 'caps'
			? 'text-xs font-semibold tracking-[0.04em] text-muted uppercase'
			: 'text-[0.85rem] text-muted'}
	>
		{label}
		{#if hint}
			<span class="font-normal tracking-normal normal-case">{hint}</span>
		{/if}
	</span>
	{@render children()}
	{#if error}
		<span class="text-xs text-danger">{error}</span>
	{/if}
</label>
