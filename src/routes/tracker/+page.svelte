<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';
	import { inputClass } from '$lib/components/ui';
	import { formatDateTime } from '$lib/format';

	let { data, form } = $props();

	let showForm = $state(false);

	type FormResult = { success: true } | { errors: Record<string, string>; values: Record<string, string> };

	const formResult = $derived(form as FormResult | null | undefined);
	const hasError = $derived(formResult && 'errors' in formResult);

	function field(name: string): string {
		if (formResult && 'values' in formResult) return formResult.values[name] ?? '';
		return '';
	}

	function fieldError(name: string): string {
		if (formResult && 'errors' in formResult) return formResult.errors[name] ?? '';
		return '';
	}
</script>

<svelte:head>
	<title>Tracker &mdash; Atlas</title>
</svelte:head>

<section class="max-w-5xl">
	<div class="mb-8 flex items-start justify-between gap-4">
		<div>
			<h1 class="m-0 font-display text-[1.75rem] font-bold tracking-[-0.02em] text-ink">Projects</h1>
			<p class="mt-1 mb-0 text-[0.9rem] text-muted">Track issues across your teams</p>
		</div>
		<Button variant="primary" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : 'New project'}
		</Button>
	</div>

	{#if showForm || hasError}
		<form
			method="POST"
			action="?/create"
			class="mb-8 rounded-xl border border-mist bg-chalk p-6"
			use:enhance={() => {
				return async ({ update, result }) => {
					await update();
					if (result.type === 'success') showForm = false;
				};
			}}
		>
			<h2 class="mt-0 mb-4 text-base font-semibold">Create project</h2>
			{#if fieldError('form')}
				<p class="mb-4 rounded-md bg-danger/10 px-3 py-2 text-[0.85rem] text-danger">
					{fieldError('form')}
				</p>
			{/if}
			<div class="flex gap-4">
				<Field label="Name" error={fieldError('name')} class="mb-4 flex-[2]">
					<input
						name="name"
						type="text"
						value={field('name')}
						placeholder="Engineering Platform"
						required
						class={inputClass}
					/>
				</Field>
				<Field label="Key" error={fieldError('key')} class="mb-4 flex-none basis-24">
					<input
						name="key"
						type="text"
						value={field('key')}
						placeholder="ENG"
						maxlength="10"
						required
						class="{inputClass} uppercase"
					/>
				</Field>
			</div>
			<Field label="Description" hint="(optional)" class="mb-4">
				<textarea name="description" rows="2" placeholder="What is this project about?" class={inputClass}
					>{field('description')}</textarea
				>
			</Field>
			<Button type="submit" variant="primary">Create project</Button>
		</form>
	{/if}

	{#if data.projects.length === 0}
		<div class="px-4 py-16 text-center text-[0.95rem] text-muted">
			<p>No projects yet. Create one to get started.</p>
		</div>
	{:else}
		<div class="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-4">
			{#each data.projects as project (project.id)}
				<a
					href="/tracker/{project.key}"
					data-sveltekit-preload-data="hover"
					class="flex flex-col rounded-xl border border-mist bg-chalk p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-pine hover:shadow-[0_4px_12px_rgb(0_0_0/0.06)]"
				>
					<div class="mb-2 flex items-center justify-between">
						<span class="rounded bg-pine/10 px-2 py-0.5 font-mono text-[0.8rem] font-medium text-pine">
							{project.key}
						</span>
						<span class="text-xs text-muted">{formatDateTime(project.created_at)}</span>
					</div>
					<h2 class="mt-0 mb-1.5 text-[1.1rem] font-semibold text-ink">{project.name}</h2>
					{#if project.description}
						<p class="mt-0 mb-3 text-[0.85rem] leading-[1.4] text-muted">{project.description}</p>
					{/if}
					<div class="mt-auto flex gap-3 border-t border-mist/60 pt-3 text-[0.8rem] font-medium">
						<span class="text-muted" title="Total issues">{project.counts.total} issues</span>
						{#if project.counts.in_progress > 0}
							<span class="text-signal">{project.counts.in_progress} active</span>
						{/if}
						{#if project.counts.done > 0}
							<span class="text-pine">{project.counts.done} done</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>
