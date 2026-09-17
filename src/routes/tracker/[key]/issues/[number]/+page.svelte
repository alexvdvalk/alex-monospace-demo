<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatDateTime, formatRelativeDay } from '$lib/format';

	let { data, form } = $props();

	const statusOptions = ['todo', 'in_progress', 'in_review', 'done'] as const;
	const priorityOptions = ['critical', 'high', 'medium', 'low'] as const;
	const typeOptions = ['task', 'bug', 'story', 'epic'] as const;

	const statusLabels: Record<string, string> = {
		todo: 'To Do',
		in_progress: 'In Progress',
		in_review: 'In Review',
		done: 'Done'
	};

	const priorityLabels: Record<string, string> = {
		critical: 'Critical',
		high: 'High',
		medium: 'Medium',
		low: 'Low'
	};

	const typeLabels: Record<string, string> = { task: 'Task', bug: 'Bug', story: 'Story', epic: 'Epic' };

	const typeIcon: Record<string, string> = {
		bug: '\u{1F41B}',
		task: '\u2713',
		story: '\u{1F4D6}',
		epic: '\u26A1'
	};

	const priorityColor: Record<string, string> = {
		critical: '#dc2626',
		high: '#ea580c',
		medium: '#ca8a04',
		low: '#6b7280'
	};

	const statusColor: Record<string, string> = {
		todo: 'var(--muted)',
		in_progress: 'var(--signal)',
		in_review: '#9333ea',
		done: 'var(--pine)'
	};

	const issue = $derived(data.issue);
	const comments = $derived(issue.comments?.data ?? []);
	const labels = $derived(
		issue.labels ? issue.labels.split(',').map((l: string) => l.trim()).filter(Boolean) : []
	);

	function initials(name: string): string {
		return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
	}

	let editingField = $state<string | null>(null);
</script>

<svelte:head>
	<title>{data.project.key}-{issue.issue_number} {issue.title} &mdash; Atlas Tracker</title>
</svelte:head>

<section class="issue-page">
	<div class="breadcrumb">
		<a href="/tracker">Tracker</a>
		<span class="sep">/</span>
		<a href="/tracker/{data.project.key}">{data.project.key}</a>
		<span class="sep">/</span>
		<span class="current">{data.project.key}-{issue.issue_number}</span>
	</div>

	<div class="issue-layout">
		<div class="issue-main">
			<div class="issue-header">
				<span class="type-badge type-{issue.type}" title={typeLabels[issue.type ?? 'task']}>{typeIcon[issue.type ?? 'task']}</span>
				<h1 class="issue-title">{issue.title}</h1>
			</div>

			{#if issue.description}
				<div class="issue-description">
					<p>{issue.description}</p>
				</div>
			{:else}
				<div class="issue-description empty">
					<p>No description provided.</p>
				</div>
			{/if}

			<div class="comments-section">
				<h2 class="section-title">Activity <span class="comment-count">{comments.length}</span></h2>

				{#if comments.length === 0}
					<p class="no-comments">No comments yet.</p>
				{:else}
					<div class="comment-list">
						{#each comments as comment (comment.id)}
							<div class="comment">
								<div class="comment-avatar">{initials(comment.author ?? 'Unknown')}</div>
								<div class="comment-body">
									<div class="comment-meta">
										<span class="comment-author">{comment.author}</span>
										<span class="comment-time">{formatDateTime(comment.created_at)}</span>
									</div>
									<p class="comment-text">{comment.body}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<form
					method="POST"
					action="?/comment"
					class="comment-form"
					use:enhance
				>
					<div class="form-group">
						<label for="comment-author">Your name</label>
						<input id="comment-author" name="author" type="text" placeholder="Name" required />
					</div>
					<div class="form-group">
						<label for="comment-body">Comment</label>
						<textarea id="comment-body" name="body" rows="3" placeholder="Add a comment..." required></textarea>
					</div>
					<button type="submit" class="btn btn-primary">Add comment</button>
				</form>
			</div>
		</div>

		<aside class="issue-sidebar">
			<h2 class="sidebar-title">Details</h2>

			<form method="POST" action="?/update" use:enhance class="detail-form">
				<div class="detail-row">
					<span class="detail-label">Status</span>
					<div class="detail-value">
						{#if editingField === 'status'}
							<select name="status" onchange={(e) => { editingField = null; e.currentTarget.form?.requestSubmit(); }}>
								{#each statusOptions as s}
									<option value={s} selected={issue.status === s}>{statusLabels[s]}</option>
								{/each}
							</select>
						{:else}
							<button type="button" class="inline-edit" onclick={() => (editingField = 'status')}>
								<span class="status-badge" style="border-color: {statusColor[issue.status ?? 'todo']}; color: {statusColor[issue.status ?? 'todo']}">{statusLabels[issue.status ?? 'todo']}</span>
							</button>
						{/if}
					</div>
				</div>

				<div class="detail-row">
					<span class="detail-label">Priority</span>
					<div class="detail-value">
						{#if editingField === 'priority'}
							<select name="priority" onchange={(e) => { editingField = null; e.currentTarget.form?.requestSubmit(); }}>
								{#each priorityOptions as p}
									<option value={p} selected={issue.priority === p}>{priorityLabels[p]}</option>
								{/each}
							</select>
						{:else}
							<button type="button" class="inline-edit" onclick={() => (editingField = 'priority')}>
								<span class="priority-indicator">
									<span class="priority-dot" style="background: {priorityColor[issue.priority ?? 'medium']}"></span>
									{priorityLabels[issue.priority ?? 'medium']}
								</span>
							</button>
						{/if}
					</div>
				</div>

				<div class="detail-row">
					<span class="detail-label">Type</span>
					<div class="detail-value">
						{#if editingField === 'type'}
							<select name="type" onchange={(e) => { editingField = null; e.currentTarget.form?.requestSubmit(); }}>
								{#each typeOptions as t}
									<option value={t} selected={issue.type === t}>{typeLabels[t]}</option>
								{/each}
							</select>
						{:else}
							<button type="button" class="inline-edit" onclick={() => (editingField = 'type')}>
								{typeLabels[issue.type ?? 'task']}
							</button>
						{/if}
					</div>
				</div>

				<div class="detail-row">
					<span class="detail-label">Assignee</span>
					<div class="detail-value">
						{#if editingField === 'assignee'}
							<div class="inline-input-group">
								<input name="assignee" type="text" value={issue.assignee ?? ''} placeholder="Unassigned" />
								<button type="submit" class="btn-sm">Save</button>
								<button type="button" class="btn-sm" onclick={() => (editingField = null)}>Cancel</button>
							</div>
						{:else}
							<button type="button" class="inline-edit" onclick={() => (editingField = 'assignee')}>
								{#if issue.assignee}
									<span class="assignee-row">
										<span class="avatar-xs">{initials(issue.assignee)}</span>
										{issue.assignee}
									</span>
								{:else}
									<span class="unset">Unassigned</span>
								{/if}
							</button>
						{/if}
					</div>
				</div>
			</form>

			<div class="detail-row">
				<span class="detail-label">Reporter</span>
				<div class="detail-value">{issue.reporter ?? '—'}</div>
			</div>

			{#if labels.length > 0}
				<div class="detail-row">
					<span class="detail-label">Labels</span>
					<div class="detail-value label-list">
						{#each labels as label}
							<span class="label-chip">{label}</span>
						{/each}
					</div>
				</div>
			{/if}

			{#if issue.due_date}
				<div class="detail-row">
					<span class="detail-label">Due date</span>
					<div class="detail-value">{issue.due_date} <span class="due-rel">({formatRelativeDay(issue.due_date)})</span></div>
				</div>
			{/if}

			<div class="detail-row">
				<span class="detail-label">Created</span>
				<div class="detail-value">{formatDateTime(issue.created_at)}</div>
			</div>

			<div class="detail-row">
				<span class="detail-label">Updated</span>
				<div class="detail-value">{formatDateTime(issue.updated_at)}</div>
			</div>
		</aside>
	</div>
</section>

<style>
	.issue-page {
		max-width: 72rem;
	}

	.breadcrumb {
		font-size: 0.8rem;
		color: var(--muted);
		margin-bottom: 1.25rem;
	}

	.breadcrumb a {
		color: var(--signal);
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

	.issue-layout {
		display: grid;
		grid-template-columns: 1fr 16rem;
		gap: 2rem;
		align-items: start;
	}

	/* Main content */
	.issue-header {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.type-badge {
		font-size: 0.85rem;
		width: 1.75rem;
		height: 1.75rem;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.35rem;
		background: color-mix(in srgb, var(--mist) 50%, transparent);
		flex-shrink: 0;
		margin-top: 0.2rem;
	}

	.type-bug { background: color-mix(in srgb, #dc2626 12%, transparent); }
	.type-story { background: color-mix(in srgb, var(--signal) 12%, transparent); }
	.type-epic { background: color-mix(in srgb, #9333ea 12%, transparent); }

	.issue-title {
		font-family: var(--font-display);
		font-weight: 700;
		font-size: 1.4rem;
		letter-spacing: -0.01em;
		color: var(--ink);
		margin: 0;
		line-height: 1.3;
	}

	.issue-description {
		padding: 1rem 1.25rem;
		background: var(--chalk);
		border: 1px solid var(--mist);
		border-radius: 0.5rem;
		margin-bottom: 2rem;
		line-height: 1.6;
		font-size: 0.92rem;
		color: var(--ink);
	}

	.issue-description.empty {
		color: var(--muted);
		font-style: italic;
	}

	.issue-description p {
		margin: 0;
	}

	/* Comments */
	.comments-section {
		border-top: 1px solid var(--mist);
		padding-top: 1.5rem;
	}

	.section-title {
		font-size: 1rem;
		font-weight: 700;
		color: var(--ink);
		margin: 0 0 1rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.comment-count {
		font-size: 0.75rem;
		font-weight: 600;
		background: color-mix(in srgb, var(--mist) 60%, transparent);
		padding: 0.1rem 0.45rem;
		border-radius: 999px;
		color: var(--muted);
	}

	.no-comments {
		color: var(--muted);
		font-size: 0.9rem;
		margin-bottom: 1.5rem;
	}

	.comment-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.comment {
		display: flex;
		gap: 0.75rem;
	}

	.comment-avatar {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background: var(--pine);
		color: var(--chalk);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.7rem;
		font-weight: 700;
		flex-shrink: 0;
	}

	.comment-body {
		flex: 1;
		background: var(--chalk);
		border: 1px solid var(--mist);
		border-radius: 0.5rem;
		padding: 0.75rem 1rem;
	}

	.comment-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.35rem;
	}

	.comment-author {
		font-weight: 600;
		font-size: 0.85rem;
		color: var(--ink);
	}

	.comment-time {
		font-size: 0.75rem;
		color: var(--muted);
	}

	.comment-text {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--ink);
	}

	.comment-form {
		background: var(--chalk);
		border: 1px solid var(--mist);
		border-radius: 0.5rem;
		padding: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
	}

	.form-group label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.form-group input,
	.form-group textarea {
		padding: 0.45rem 0.6rem;
		border: 1px solid var(--mist);
		border-radius: 0.375rem;
		font-size: 0.85rem;
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

	.btn {
		display: inline-flex;
		align-items: center;
		padding: 0.45rem 0.85rem;
		border: 1px solid var(--mist);
		border-radius: 0.5rem;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		background: var(--chalk);
		color: var(--ink);
		transition: all 0.15s ease;
	}

	.btn-primary {
		background: var(--pine);
		border-color: var(--pine);
		color: var(--chalk);
	}

	.btn-primary:hover {
		background: var(--pine-deep);
	}

	.btn-sm {
		padding: 0.25rem 0.5rem;
		border: 1px solid var(--mist);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
		background: var(--chalk);
		color: var(--ink);
	}

	/* Sidebar */
	.issue-sidebar {
		background: var(--chalk);
		border: 1px solid var(--mist);
		border-radius: 0.65rem;
		padding: 1.25rem;
	}

	.sidebar-title {
		font-size: 0.85rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
		margin: 0 0 1rem;
	}

	.detail-form {
		display: contents;
	}

	.detail-row {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid color-mix(in srgb, var(--mist) 50%, transparent);
	}

	.detail-row:last-child {
		border-bottom: none;
	}

	.detail-label {
		font-size: 0.72rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--muted);
	}

	.detail-value {
		font-size: 0.85rem;
		color: var(--ink);
	}

	.inline-edit {
		background: none;
		border: none;
		padding: 0.15rem 0;
		font-size: 0.85rem;
		font-family: inherit;
		color: var(--ink);
		cursor: pointer;
		text-align: left;
		width: 100%;
		border-radius: 0.25rem;
		transition: background 0.1s ease;
	}

	.inline-edit:hover {
		background: color-mix(in srgb, var(--mist) 40%, transparent);
	}

	.inline-input-group {
		display: flex;
		gap: 0.35rem;
		align-items: center;
	}

	.inline-input-group input {
		flex: 1;
		padding: 0.25rem 0.4rem;
		border: 1px solid var(--mist);
		border-radius: 0.25rem;
		font-size: 0.82rem;
		font-family: inherit;
	}

	.status-badge {
		display: inline-block;
		padding: 0.15rem 0.5rem;
		border: 1.5px solid;
		border-radius: 999px;
		font-size: 0.78rem;
		font-weight: 600;
	}

	.priority-indicator {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.priority-dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
	}

	.assignee-row {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}

	.avatar-xs {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.3rem;
		height: 1.3rem;
		border-radius: 50%;
		background: var(--pine);
		color: var(--chalk);
		font-size: 0.55rem;
		font-weight: 700;
	}

	.unset {
		color: var(--muted);
		font-style: italic;
	}

	.label-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}

	.label-chip {
		padding: 0.1rem 0.45rem;
		background: color-mix(in srgb, var(--signal) 12%, transparent);
		color: var(--signal);
		border-radius: 0.25rem;
		font-size: 0.75rem;
		font-weight: 500;
	}

	.due-rel {
		color: var(--muted);
		font-size: 0.8rem;
	}

	@media (max-width: 768px) {
		.issue-layout {
			grid-template-columns: 1fr;
		}

		.issue-sidebar {
			order: -1;
		}
	}
</style>
