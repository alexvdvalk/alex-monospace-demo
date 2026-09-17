<script lang="ts">
	import { enhance } from '$app/forms';
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

<section class="tracker-home">
	<div class="page-header">
		<div>
			<h1 class="page-title">Projects</h1>
			<p class="page-subtitle">Track issues across your teams</p>
		</div>
		<button class="btn btn-primary" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : 'New project'}
		</button>
	</div>

	{#if showForm || hasError}
		<form
			method="POST"
			action="?/create"
			class="create-form"
			use:enhance={() => {
				return async ({ update, result }) => {
					await update();
					if (result.type === 'success') showForm = false;
				};
			}}
		>
			<h2 class="form-title">Create project</h2>
			{#if fieldError('form')}
				<p class="form-error">{fieldError('form')}</p>
			{/if}
			<div class="form-row">
				<div class="form-group" style="flex: 2">
					<label for="proj-name">Name</label>
					<input id="proj-name" name="name" type="text" value={field('name')} placeholder="Engineering Platform" required />
					{#if fieldError('name')}<span class="field-error">{fieldError('name')}</span>{/if}
				</div>
				<div class="form-group" style="flex: 0 0 6rem">
					<label for="proj-key">Key</label>
					<input id="proj-key" name="key" type="text" value={field('key')} placeholder="ENG" maxlength="10" style="text-transform: uppercase" required />
					{#if fieldError('key')}<span class="field-error">{fieldError('key')}</span>{/if}
				</div>
			</div>
			<div class="form-group">
				<label for="proj-desc">Description <span class="optional">(optional)</span></label>
				<textarea id="proj-desc" name="description" rows="2" placeholder="What is this project about?">{field('description')}</textarea>
			</div>
			<button type="submit" class="btn btn-primary">Create project</button>
		</form>
	{/if}

	{#if data.projects.length === 0}
		<div class="empty-state">
			<p>No projects yet. Create one to get started.</p>
		</div>
	{:else}
		<div class="project-grid">
			{#each data.projects as project (project.id)}
				<a href="/tracker/{project.key}" class="project-card" data-sveltekit-preload-data="hover">
					<div class="card-header">
						<span class="project-key">{project.key}</span>
						<span class="project-date">{formatDateTime(project.created_at)}</span>
					</div>
					<h2 class="project-name">{project.name}</h2>
					{#if project.description}
						<p class="project-desc">{project.description}</p>
					{/if}
					<div class="card-stats">
						<span class="stat" title="Total issues">{project.counts.total} issues</span>
						{#if project.counts.in_progress > 0}
							<span class="stat stat-active">{project.counts.in_progress} active</span>
						{/if}
						{#if project.counts.done > 0}
							<span class="stat stat-done">{project.counts.done} done</span>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</section>

<style>
	.tracker-home {
		max-width: 60rem;
	}

	.page-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.page-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.75rem;
		letter-spacing: -0.02em;
		color: var(--ink);
		margin: 0;
	}

	.page-subtitle {
		margin: 0.25rem 0 0;
		font-size: 0.9rem;
		color: var(--muted);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.55rem 1rem;
		border: 1px solid var(--mist);
		border-radius: 0.5rem;
		font-size: 0.85rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: inherit;
		background: var(--chalk);
		color: var(--ink);
	}

	.btn-primary {
		background: var(--pine);
		border-color: var(--pine);
		color: var(--chalk);
	}

	.btn-primary:hover {
		background: var(--pine-deep);
	}

	.create-form {
		background: var(--chalk);
		border: 1px solid var(--mist);
		border-radius: 0.75rem;
		padding: 1.5rem;
		margin-bottom: 2rem;
	}

	.form-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem;
	}

	.form-error {
		background: color-mix(in srgb, var(--danger) 10%, transparent);
		color: var(--danger);
		padding: 0.5rem 0.75rem;
		border-radius: 0.375rem;
		font-size: 0.85rem;
		margin-bottom: 1rem;
	}

	.form-row {
		display: flex;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		margin-bottom: 1rem;
	}

	.form-group label {
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.optional {
		font-weight: 400;
		text-transform: none;
		letter-spacing: normal;
	}

	.form-group input,
	.form-group textarea {
		padding: 0.5rem 0.65rem;
		border: 1px solid var(--mist);
		border-radius: 0.375rem;
		font-size: 0.9rem;
		font-family: inherit;
		background: white;
		color: var(--ink);
	}

	.form-group input:focus,
	.form-group textarea:focus {
		outline: 2px solid var(--signal);
		outline-offset: 1px;
		border-color: var(--signal);
	}

	.field-error {
		font-size: 0.8rem;
		color: var(--danger);
	}

	.project-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
		gap: 1rem;
	}

	.project-card {
		display: flex;
		flex-direction: column;
		padding: 1.25rem;
		background: var(--chalk);
		border: 1px solid var(--mist);
		border-radius: 0.75rem;
		transition: all 0.2s ease;
	}

	.project-card:hover {
		border-color: var(--pine);
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgb(0 0 0 / 0.06);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.project-key {
		font-family: var(--font-mono);
		font-size: 0.8rem;
		font-weight: 500;
		color: var(--pine);
		background: color-mix(in srgb, var(--pine) 10%, transparent);
		padding: 0.15rem 0.5rem;
		border-radius: 0.25rem;
	}

	.project-date {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.project-name {
		font-size: 1.1rem;
		font-weight: 600;
		margin: 0 0 0.35rem;
		color: var(--ink);
	}

	.project-desc {
		font-size: 0.85rem;
		color: var(--muted);
		margin: 0 0 0.75rem;
		line-height: 1.4;
	}

	.card-stats {
		display: flex;
		gap: 0.75rem;
		margin-top: auto;
		padding-top: 0.75rem;
		border-top: 1px solid color-mix(in srgb, var(--mist) 60%, transparent);
	}

	.stat {
		font-size: 0.8rem;
		color: var(--muted);
		font-weight: 500;
	}

	.stat-active {
		color: var(--signal);
	}

	.stat-done {
		color: var(--pine);
	}

	.empty-state {
		text-align: center;
		padding: 4rem 1rem;
		color: var(--muted);
		font-size: 0.95rem;
	}
</style>
