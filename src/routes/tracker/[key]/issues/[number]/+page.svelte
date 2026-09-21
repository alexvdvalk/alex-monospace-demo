<script lang="ts">
	import type { Snippet } from 'svelte';
	import { enhance } from '$app/forms';
	import Avatar from '$lib/components/Avatar.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';
	import PriorityDot from '$lib/components/PriorityDot.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import { inputClass, inputSmClass, selectSmClass } from '$lib/components/ui';
	import { formatDateTime, formatRelativeDay } from '$lib/format';
	import {
		priorityLabels,
		priorityOptions,
		statusBadgeClass,
		statusLabels,
		statusOptions,
		typeLabels,
		typeOptions
	} from '$lib/tracker';

	let { data, form } = $props();

	type FormResult =
		| { success: true; action: string }
		| { action: string; errors: Record<string, string>; values?: Record<string, string> };

	const result = $derived(form as FormResult | null | undefined);
	const commentErrors = $derived(
		result && 'errors' in result && result.action === 'comment' ? result.errors : {}
	);
	const updateError = $derived(
		result && 'errors' in result && result.action === 'update'
			? (result.errors.form ?? result.errors.title ?? '')
			: ''
	);

	const issue = $derived(data.issue);
	const comments = $derived(issue.comments?.data ?? []);
	const labels = $derived(
		issue.labels ? issue.labels.split(',').map((l: string) => l.trim()).filter(Boolean) : []
	);

	let editingField = $state<string | null>(null);

	const inlineEditClass =
		'w-full cursor-pointer rounded border-none bg-transparent px-0 py-0.5 text-left text-[0.85rem] text-ink transition-colors duration-100 hover:bg-mist/40';
</script>

<svelte:head>
	<title>{data.project.key}-{issue.issue_number} {issue.title} &mdash; Atlas Tracker</title>
</svelte:head>

{#snippet detailRow(label: string, value: Snippet)}
	<div class="flex flex-col gap-0.5 border-b border-mist/50 py-2 last:border-b-0">
		<span class="text-[0.72rem] font-semibold tracking-[0.04em] text-muted uppercase">{label}</span>
		<div class="text-[0.85rem] text-ink">{@render value()}</div>
	</div>
{/snippet}

<section class="max-w-6xl">
	<Breadcrumb
		class="mb-5"
		items={[
			{ label: 'Tracker', href: '/tracker' },
			{ label: data.project.key, href: `/tracker/${data.project.key}` },
			{ label: `${data.project.key}-${issue.issue_number}` }
		]}
	/>

	<div class="grid items-start gap-8 md:grid-cols-[1fr_16rem]">
		<div>
			<div class="mb-5 flex items-start gap-3">
				<TypeBadge type={issue.type} size="md" />
				<h1 class="m-0 font-display text-[1.4rem] leading-[1.3] font-bold tracking-[-0.01em] text-ink">
					{issue.title}
				</h1>
			</div>

			<div
				class="mb-8 rounded-lg border border-mist bg-chalk px-5 py-4 text-[0.92rem] leading-[1.6] {issue.description
					? 'text-ink'
					: 'text-muted italic'}"
			>
				<p class="m-0">{issue.description || 'No description provided.'}</p>
			</div>

			<div class="border-t border-mist pt-6">
				<h2 class="mt-0 mb-4 flex items-center gap-2 text-base font-bold text-ink">
					Activity
					<span class="rounded-full bg-mist/60 px-1.5 py-px text-xs font-semibold text-muted">
						{comments.length}
					</span>
				</h2>

				{#if comments.length === 0}
					<p class="mb-6 text-[0.9rem] text-muted">No comments yet.</p>
				{:else}
					<div class="mb-6 flex flex-col gap-4">
						{#each comments as comment (comment.id)}
							<div class="flex gap-3">
								<Avatar name={comment.AUTHOR ?? 'Unknown'} size="md" />
								<div class="flex-1 rounded-lg border border-mist bg-chalk px-4 py-3">
									<div class="mb-1.5 flex items-center gap-2">
										<span class="text-[0.85rem] font-semibold text-ink">{comment.AUTHOR}</span>
										<span class="text-xs text-muted">{formatDateTime(comment.created_at)}</span>
									</div>
									<p class="m-0 text-[0.9rem] leading-[1.5] text-ink">{comment.BODY}</p>
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<form
					method="POST"
					action="?/comment"
					class="rounded-lg border border-mist bg-chalk p-4"
					use:enhance
				>
					{#if commentErrors.form}
						<p class="mt-0 mb-3 rounded-md bg-danger/10 px-3 py-2 text-[0.85rem] text-danger" role="alert">
							{commentErrors.form}
						</p>
					{/if}
					<Field label="Your name" class="mb-3" error={commentErrors.author ?? ''}>
						<input
							name="author"
							type="text"
							placeholder="Name"
							required
							value={result && 'values' in result ? (result.values?.author ?? '') : ''}
							class={inputClass}
						/>
					</Field>
					<Field label="Comment" class="mb-3" error={commentErrors.body ?? ''}>
						<textarea name="body" rows="3" placeholder="Add a comment..." required class={inputClass}
							>{result && 'values' in result ? (result.values?.body ?? '') : ''}</textarea
						>
					</Field>
					<Button type="submit" variant="primary">Add comment</Button>
				</form>
			</div>
		</div>

		<aside class="order-first rounded-[0.65rem] border border-mist bg-chalk p-5 md:order-none">
			<h2 class="mt-0 mb-4 text-[0.85rem] font-bold tracking-[0.04em] text-muted uppercase">Details</h2>

			{#if updateError}
				<p class="mt-0 mb-3 rounded-md bg-danger/10 px-2.5 py-2 text-xs text-danger" role="alert">
					{updateError}
				</p>
			{/if}

			<form method="POST" action="?/update" use:enhance class="contents">
				{#snippet statusValue()}
					{#if editingField === 'status'}
						<select
							name="status"
							class={selectSmClass}
							onchange={(e) => {
								e.currentTarget.form?.requestSubmit();
								editingField = null;
							}}
						>
							{#each statusOptions as s (s)}
								<option value={s} selected={issue.status === s}>{statusLabels[s]}</option>
							{/each}
						</select>
					{:else}
						<button type="button" class={inlineEditClass} onclick={() => (editingField = 'status')}>
							<span
								class="inline-block rounded-full border-[1.5px] px-2 py-0.5 text-[0.78rem] font-semibold {statusBadgeClass[
									issue.status ?? 'todo'
								]}"
							>
								{statusLabels[issue.status ?? 'todo']}
							</span>
						</button>
					{/if}
				{/snippet}
				{@render detailRow('Status', statusValue)}

				{#snippet priorityValue()}
					{#if editingField === 'priority'}
						<select
							name="priority"
							class={selectSmClass}
							onchange={(e) => {
								e.currentTarget.form?.requestSubmit();
								editingField = null;
							}}
						>
							{#each priorityOptions as p (p)}
								<option value={p} selected={issue.priority === p}>{priorityLabels[p]}</option>
							{/each}
						</select>
					{:else}
						<button type="button" class={inlineEditClass} onclick={() => (editingField = 'priority')}>
							<span class="inline-flex items-center gap-1.5">
								<PriorityDot priority={issue.priority} />
								{priorityLabels[issue.priority ?? 'medium']}
							</span>
						</button>
					{/if}
				{/snippet}
				{@render detailRow('Priority', priorityValue)}

				{#snippet typeValue()}
					{#if editingField === 'type'}
						<select
							name="type"
							class={selectSmClass}
							onchange={(e) => {
								e.currentTarget.form?.requestSubmit();
								editingField = null;
							}}
						>
							{#each typeOptions as t (t)}
								<option value={t} selected={issue.type === t}>{typeLabels[t]}</option>
							{/each}
						</select>
					{:else}
						<button type="button" class={inlineEditClass} onclick={() => (editingField = 'type')}>
							{typeLabels[issue.type ?? 'task']}
						</button>
					{/if}
				{/snippet}
				{@render detailRow('Type', typeValue)}

				{#snippet assigneeValue()}
					{#if editingField === 'assignee'}
						<div class="flex items-center gap-1.5">
							<input
								name="assignee"
								type="text"
								value={issue.assignee ?? ''}
								placeholder="Unassigned"
								class="{inputSmClass} flex-1"
							/>
							<Button type="submit" size="sm">Save</Button>
							<Button size="sm" onclick={() => (editingField = null)}>Cancel</Button>
						</div>
					{:else}
						<button type="button" class={inlineEditClass} onclick={() => (editingField = 'assignee')}>
							{#if issue.assignee}
								<span class="inline-flex items-center gap-1.5">
									<Avatar name={issue.assignee} size="xs" />
									{issue.assignee}
								</span>
							{:else}
								<span class="text-muted italic">Unassigned</span>
							{/if}
						</button>
					{/if}
				{/snippet}
				{@render detailRow('Assignee', assigneeValue)}
			</form>

			{#snippet reporterValue()}{issue.reporter ?? '—'}{/snippet}
			{@render detailRow('Reporter', reporterValue)}

			{#if labels.length > 0}
				{#snippet labelsValue()}
					<span class="flex flex-wrap gap-1">
						{#each labels as label (label)}
							<span class="rounded bg-signal/12 px-1.5 py-px text-xs font-medium text-signal">
								{label}
							</span>
						{/each}
					</span>
				{/snippet}
				{@render detailRow('Labels', labelsValue)}
			{/if}

			{#if issue.due_date}
				{#snippet dueValue()}
					{issue.due_date}
					<span class="text-[0.8rem] text-muted">({formatRelativeDay(issue.due_date)})</span>
				{/snippet}
				{@render detailRow('Due date', dueValue)}
			{/if}

			{#snippet createdValue()}{formatDateTime(issue.created_at)}{/snippet}
			{@render detailRow('Created', createdValue)}

			{#snippet updatedValue()}{formatDateTime(issue.updated_at)}{/snippet}
			{@render detailRow('Updated', updatedValue)}
		</aside>
	</div>
</section>
