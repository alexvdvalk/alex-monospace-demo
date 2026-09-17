<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatRelativeDay } from '$lib/format';

	let { data, form } = $props();

	let showForm = $state(false);
	let filterType = $state('all');
	let filterPriority = $state('all');
	let filterAssignee = $state('all');

	const columns = [
		{ key: 'todo', label: 'To Do' },
		{ key: 'in_progress', label: 'In Progress' },
		{ key: 'in_review', label: 'In Review' },
		{ key: 'done', label: 'Done' }
	] as const;

	const typeOptions = ['task', 'bug', 'story', 'epic'] as const;
	const priorityOptions = ['critical', 'high', 'medium', 'low'] as const;

	const typeLabels: Record<string, string> = { task: 'Task', bug: 'Bug', story: 'Story', epic: 'Epic' };
	const priorityLabels: Record<string, string> = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

	const filteredIssues = $derived(
		data.issues.filter((issue) => {
			if (filterType !== 'all' && issue.type !== filterType) return false;
			if (filterPriority !== 'all' && issue.priority !== filterPriority) return false;
			if (filterAssignee !== 'all') {
				if (filterAssignee === 'unassigned') return !issue.assignee;
				return issue.assignee === filterAssignee;
			}
			return true;
		})
	);

	const columnIssues = $derived(
		Object.fromEntries(columns.map((col) => [col.key, filteredIssues.filter((i) => i.status === col.key)]))
	);

	const assignees = $derived(
		[...new Set(data.issues.map((i) => i.assignee).filter(Boolean) as string[])].sort()
	);

	function initials(name: string | null | undefined): string {
		if (!name) return '?';
		return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
	}

	const priorityDot: Record<string, string> = {
		critical: '#dc2626',
		high: '#ea580c',
		medium: '#ca8a04',
		low: '#6b7280'
	};

	const typeIcon: Record<string, string> = {
		bug: '\u{1F41B}',
		task: '\u2713',
		story: '\u{1F4D6}',
		epic: '\u26A1'
	};
</script>

<svelte:head>
	<title>{data.project.key} Board &mdash; Atlas Tracker</title>
</svelte:head>

<section class="board-page">
	<div class="board-header">
		<div class="breadcrumb">
			<a href="/tracker">Tracker</a>
			<span class="sep">/</span>
			<span class="current">{data.project.key}</span>
		</div>
		<h1 class="board-title">{data.project.name}</h1>
		{#if data.project.description}
			<p class="board-desc">{data.project.description}</p>
		{/if}
	</div>

	<div class="toolbar">
		<div class="filters">
			<select bind:value={filterType} class="filter-select">
				<option value="all">All types</option>
				{#each typeOptions as t}
					<option value={t}>{typeLabels[t]}</option>
				{/each}
			</select>
			<select bind:value={filterPriority} class="filter-select">
				<option value="all">All priorities</option>
				{#each priorityOptions as p}
					<option value={p}>{priorityLabels[p]}</option>
				{/each}
			</select>
			<select bind:value={filterAssignee} class="filter-select">
				<option value="all">All assignees</option>
				<option value="unassigned">Unassigned</option>
				{#each assignees as a}
					<option value={a}>{a}</option>
				{/each}
			</select>
		</div>
		<button class="btn btn-primary" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : 'New issue'}
		</button>
	</div>

	{#if showForm}
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
			<h2 class="form-heading">New issue in {data.project.key}</h2>
			<div class="form-group">
				<label for="issue-title">Title</label>
				<input id="issue-title" name="title" type="text" placeholder="What needs to be done?" required />
			</div>
			<div class="form-group">
				<label for="issue-desc">Description <span class="optional">(optional)</span></label>
				<textarea id="issue-desc" name="description" rows="3" placeholder="Add details..."></textarea>
			</div>
			<div class="form-row-4">
				<div class="form-group">
					<label for="issue-type">Type</label>
					<select id="issue-type" name="type">
						{#each typeOptions as t}
							<option value={t}>{typeLabels[t]}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="issue-priority">Priority</label>
					<select id="issue-priority" name="priority">
						{#each priorityOptions as p}
							<option value={p} selected={p === 'medium'}>{priorityLabels[p]}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="issue-assignee">Assignee <span class="optional">(opt)</span></label>
					<input id="issue-assignee" name="assignee" type="text" placeholder="Name" />
				</div>
				<div class="form-group">
					<label for="issue-reporter">Reporter</label>
					<input id="issue-reporter" name="reporter" type="text" value="System" />
				</div>
			</div>
			<div class="form-row-4">
				<div class="form-group">
					<label for="issue-labels">Labels <span class="optional">(opt)</span></label>
					<input id="issue-labels" name="labels" type="text" placeholder="frontend, backend" />
				</div>
				<div class="form-group">
					<label for="issue-due">Due date <span class="optional">(opt)</span></label>
					<input id="issue-due" name="due_date" type="date" />
				</div>
			</div>
			<button type="submit" class="btn btn-primary">Create issue</button>
		</form>
	{/if}

	<div class="board">
		{#each columns as column (column.key)}
			{@const issues = columnIssues[column.key] ?? []}
			<div class="column">
				<div class="column-header">
					<span class="column-title">{column.label}</span>
					<span class="column-count">{issues.length}</span>
				</div>
				<div class="column-body">
					{#each issues as issue (issue.id)}
						<a href="/tracker/{data.project.key}/issues/{issue.issue_number}" class="issue-card" data-sveltekit-preload-data="hover">
							<div class="card-top">
								<span class="issue-key">{data.project.key}-{issue.issue_number}</span>
								<span class="type-badge type-{issue.type}" title={typeLabels[issue.type ?? 'task']}>{typeIcon[issue.type ?? 'task']}</span>
							</div>
							<p class="issue-title">{issue.title}</p>
							<div class="card-bottom">
								<span class="priority-dot" style="background: {priorityDot[issue.priority ?? 'medium']}" title="{priorityLabels[issue.priority ?? 'medium']} priority"></span>
								{#if issue.due_date}
									<span class="issue-due" title="Due {issue.due_date}">{formatRelativeDay(issue.due_date)}</span>
								{/if}
								<span class="card-spacer"></span>
								{#if issue.assignee}
									<span class="avatar-sm" title={issue.assignee}>{initials(issue.assignee)}</span>
								{/if}
							</div>
						</a>
					{/each}

					{#if column.key !== 'done'}
						<form method="POST" action="?/updateStatus" use:enhance class="move-drop-zone">
							{#each (columns.filter(c => c.key !== column.key)) as target}
								<!-- Quick-move buttons shown on each card could go here -->
							{/each}
						</form>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</section>

<style>
	.board-page {
		max-width: 100%;
	}

	.board-header {
		margin-bottom: 1.5rem;
	}

	.breadcrumb {
		font-size: 0.8rem;
		color: var(--muted);
		margin-bottom: 0.5rem;
	}

	.breadcrumb a {
		color: var(--signal);
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	.sep {
		margin: 0 0.35rem;
		opacity: 0.5;
	}

	.current {
		font-weight: 600;
		color: var(--ink);
	}

	.board-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.5rem;
		letter-spacing: -0.02em;
		color: var(--ink);
		margin: 0;
	}

	.board-desc {
		margin: 0.25rem 0 0;
		font-size: 0.85rem;
		color: var(--muted);
	}

	.toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.25rem;
		flex-wrap: wrap;
	}

	.filters {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.filter-select {
		padding: 0.4rem 0.6rem;
		border: 1px solid var(--mist);
		border-radius: 0.375rem;
		font-size: 0.82rem;
		font-family: inherit;
		background: var(--chalk);
		color: var(--ink);
		cursor: pointer;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.9rem;
		border: 1px solid var(--mist);
		border-radius: 0.5rem;
		font-size: 0.82rem;
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
		padding: 1.25rem;
		margin-bottom: 1.5rem;
	}

	.form-heading {
		font-size: 1rem;
		font-weight: 600;
		margin: 0 0 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.85rem;
	}

	.form-group label {
		font-size: 0.75rem;
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
	.form-group textarea,
	.form-group select {
		padding: 0.45rem 0.6rem;
		border: 1px solid var(--mist);
		border-radius: 0.375rem;
		font-size: 0.85rem;
		font-family: inherit;
		background: white;
		color: var(--ink);
	}

	.form-group input:focus,
	.form-group textarea:focus,
	.form-group select:focus {
		outline: 2px solid var(--signal);
		outline-offset: 1px;
		border-color: var(--signal);
	}

	.form-row-4 {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
		gap: 0.75rem;
	}

	/* Kanban Board */
	.board {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
		align-items: start;
	}

	.column {
		background: color-mix(in srgb, var(--mist) 25%, transparent);
		border-radius: 0.65rem;
		padding: 0.6rem;
		min-height: 12rem;
	}

	.column-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.35rem 0.4rem 0.65rem;
	}

	.column-title {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
	}

	.column-count {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--muted);
		background: color-mix(in srgb, var(--mist) 60%, transparent);
		padding: 0.1rem 0.4rem;
		border-radius: 999px;
	}

	.column-body {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.issue-card {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 0.75rem 0.85rem;
		background: var(--chalk);
		border: 1px solid var(--mist);
		border-radius: 0.5rem;
		transition: all 0.15s ease;
		cursor: pointer;
	}

	.issue-card:hover {
		border-color: var(--pine);
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.06);
		transform: translateY(-1px);
	}

	.card-top {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.issue-key {
		font-family: var(--font-mono);
		font-size: 0.72rem;
		font-weight: 500;
		color: var(--muted);
	}

	.type-badge {
		font-size: 0.72rem;
		width: 1.4rem;
		height: 1.4rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.25rem;
		background: color-mix(in srgb, var(--mist) 50%, transparent);
	}

	.type-bug {
		background: color-mix(in srgb, #dc2626 12%, transparent);
	}

	.type-story {
		background: color-mix(in srgb, var(--signal) 12%, transparent);
	}

	.type-epic {
		background: color-mix(in srgb, #9333ea 12%, transparent);
	}

	.issue-title {
		margin: 0;
		font-size: 0.85rem;
		font-weight: 500;
		color: var(--ink);
		line-height: 1.35;
	}

	.card-bottom {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-top: 0.15rem;
	}

	.priority-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.issue-due {
		font-size: 0.72rem;
		color: var(--muted);
	}

	.card-spacer {
		flex: 1;
	}

	.avatar-sm {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.5rem;
		height: 1.5rem;
		border-radius: 50%;
		background: var(--pine);
		color: var(--chalk);
		font-size: 0.6rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		flex-shrink: 0;
	}

	.move-drop-zone {
		display: none;
	}

	@media (max-width: 900px) {
		.board {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 550px) {
		.board {
			grid-template-columns: 1fr;
		}
	}
</style>
