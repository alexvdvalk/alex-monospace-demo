<script lang="ts">
	import { priorityDotClass, priorityLabels } from '$lib/tracker';

	let { priority }: { priority: string | null | undefined } = $props();

	const key = $derived(priority ?? 'medium');
</script>

<span
	title="{priorityLabels[key]} priority"
	class="size-2 shrink-0 rounded-full {priorityDotClass[key] ?? priorityDotClass.medium}"
></span>
