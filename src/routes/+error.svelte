<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} · Atlas</title>
</svelte:head>

<section class="grid max-w-md gap-3 py-12">
	<p class="m-0 font-mono text-[0.85rem] text-muted">{page.status}</p>
	<h1 class="m-0 font-display text-3xl font-bold tracking-[-0.03em]">
		{page.error?.message ?? 'Something went wrong'}
	</h1>
	<a href="/" class="mt-2 w-fit font-semibold text-pine">Back to catalog</a>
</section>
