<script lang="ts">
	import { typeIcon, typeLabels } from '$lib/tracker';

	type Props = {
		type: string | null | undefined;
		size?: 'sm' | 'md';
	};

	let { type, size = 'sm' }: Props = $props();

	const key = $derived(type ?? 'task');

	const backgrounds: Record<string, string> = {
		task: 'bg-mist/50',
		bug: 'bg-flag-critical/12',
		story: 'bg-signal/12',
		epic: 'bg-flag-epic/12'
	};

	const sizes = {
		sm: 'size-[1.4rem] rounded text-[0.72rem]',
		md: 'mt-0.5 size-7 rounded-[0.35rem] text-[0.85rem]'
	};
</script>

<span
	title={typeLabels[key]}
	class="flex shrink-0 items-center justify-center {backgrounds[key] ?? backgrounds.task} {sizes[size]}"
>
	{typeIcon[key]}
</span>
