<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status} · Atlas</title>
</svelte:head>

<section class="error-page">
	<p class="code">{page.status}</p>
	<h1>{page.error?.message ?? 'Something went wrong'}</h1>
	<a href="/">Back to catalog</a>
</section>

<style>
	.error-page {
		padding: 3rem 0;
		display: grid;
		gap: 0.75rem;
		max-width: 28rem;
	}

	.code {
		margin: 0;
		font-family: var(--font-mono);
		font-size: 0.85rem;
		color: var(--muted);
	}

	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 700;
		letter-spacing: -0.03em;
	}

	a {
		width: fit-content;
		margin-top: 0.5rem;
		color: var(--pine);
		font-weight: 600;
	}
</style>
