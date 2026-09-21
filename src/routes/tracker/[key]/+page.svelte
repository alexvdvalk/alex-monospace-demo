<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/components/Avatar.svelte';
	import Breadcrumb from '$lib/components/Breadcrumb.svelte';
	import Button from '$lib/components/Button.svelte';
	import Field from '$lib/components/Field.svelte';
	import PriorityDot from '$lib/components/PriorityDot.svelte';
	import TypeBadge from '$lib/components/TypeBadge.svelte';
	import { inputClass, selectClass, selectSmClass } from '$lib/components/ui';
	import { formatRelativeDay } from '$lib/format';
	import { priorityLabels, priorityOptions, typeLabels, typeOptions } from '$lib/tracker';

	let { data, form } = $props();

	type FormResult =
		| { success: true; action: string }
		| { action: string; errors: Record<string, string>; values?: Record<string, string | null> };

	const result = $derived(form as FormResult | null | undefined);
	const createErrors = $derived(
		result && 'errors' in result && result.action === 'create' ? result.errors : {}
	);
	const hasCreateError = $derived(Object.keys(createErrors).length > 0);

	function field(name: string): string {
		if (result && 'values' in result && result.action === 'create') {
			return result.values?.[name] ?? '';
		}
		return '';
	}

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

</script>

<svelte:head>
	<title>{data.project.key} Board &mdash; Atlas Tracker</title>
</svelte:head>

<section>
	<div class="mb-6">
		<Breadcrumb
			class="mb-2"
			items={[{ label: 'Tracker', href: '/tracker' }, { label: data.project.key }]}
		/>
		<h1 class="m-0 font-display text-2xl font-bold tracking-[-0.02em] text-ink">{data.project.name}</h1>
		{#if data.project.description}
			<p class="mt-1 mb-0 text-[0.85rem] text-muted">{data.project.description}</p>
		{/if}
	</div>

	<div class="mb-5 flex flex-wrap items-center justify-between gap-4">
		<div class="flex flex-wrap gap-2">
			<select bind:value={filterType} class={selectSmClass} aria-label="Filter by type">
				<option value="all">All types</option>
				{#each typeOptions as t (t)}
					<option value={t}>{typeLabels[t]}</option>
				{/each}
			</select>
			<select bind:value={filterPriority} class={selectSmClass} aria-label="Filter by priority">
				<option value="all">All priorities</option>
				{#each priorityOptions as p (p)}
					<option value={p}>{priorityLabels[p]}</option>
				{/each}
			</select>
			<select bind:value={filterAssignee} class={selectSmClass} aria-label="Filter by assignee">
				<option value="all">All assignees</option>
				<option value="unassigned">Unassigned</option>
				{#each assignees as a (a)}
					<option value={a}>{a}</option>
				{/each}
			</select>
		</div>
		<Button variant="primary" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Cancel' : 'New issue'}
		</Button>
	</div>

	{#if showForm || hasCreateError}
		<form
			method="POST"
			action="?/create"
			class="mb-6 rounded-xl border border-mist bg-chalk p-5"
			use:enhance={() => {
				return async ({ update, result }) => {
					await update();
					if (result.type === 'success') showForm = false;
				};
			}}
		>
			<h2 class="mt-0 mb-4 text-base font-semibold">New issue in {data.project.key}</h2>
			{#if createErrors.form}
				<p class="mb-4 rounded-md bg-danger/10 px-3 py-2 text-[0.85rem] text-danger" role="alert">
					{createErrors.form}
				</p>
			{/if}
			<Field label="Title" class="mb-3.5" error={createErrors.title ?? ''}>
				<input
					name="title"
					type="text"
					placeholder="What needs to be done?"
					required
					value={field('title')}
					class={inputClass}
				/>
			</Field>
			<Field label="Description" hint="(optional)" class="mb-3.5">
				<textarea name="description" rows="3" placeholder="Add details..." class={inputClass}
					>{field('description')}</textarea
				>
			</Field>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-3">
				<Field label="Type" class="mb-3.5" error={createErrors.type ?? ''}>
					<select name="type" value={field('type') || 'task'} class={selectClass}>
						{#each typeOptions as t (t)}
							<option value={t}>{typeLabels[t]}</option>
						{/each}
					</select>
				</Field>
				<Field label="Priority" class="mb-3.5" error={createErrors.priority ?? ''}>
					<select name="priority" value={field('priority') || 'medium'} class={selectClass}>
						{#each priorityOptions as p (p)}
							<option value={p}>{priorityLabels[p]}</option>
						{/each}
					</select>
				</Field>
				<Field label="Assignee" hint="(opt)" class="mb-3.5">
					<input name="assignee" type="text" placeholder="Name" value={field('assignee')} class={inputClass} />
				</Field>
				<Field label="Reporter" class="mb-3.5">
					<input name="reporter" type="text" value={field('reporter') || 'System'} class={inputClass} />
				</Field>
			</div>
			<div class="grid grid-cols-[repeat(auto-fit,minmax(8rem,1fr))] gap-3">
				<Field label="Labels" hint="(opt)" class="mb-3.5">
					<input
						name="labels"
						type="text"
						placeholder="frontend, backend"
						value={field('labels')}
						class={inputClass}
					/>
				</Field>
				<Field label="Due date" hint="(opt)" class="mb-3.5">
					<input name="due_date" type="date" value={field('due_date')} class={inputClass} />
				</Field>
			</div>
			<Button type="submit" variant="primary">Create issue</Button>
		</form>
	{/if}

	<div class="grid items-start gap-3 xs:grid-cols-2 wide:grid-cols-4">
		{#each columns as column (column.key)}
			{@const issues = columnIssues[column.key] ?? []}
			<div class="min-h-48 rounded-[0.65rem] bg-mist/25 p-2.5">
				<div class="flex items-center gap-2 px-1.5 pt-1.5 pb-2.5">
					<span class="text-[0.8rem] font-bold tracking-[0.05em] text-muted uppercase">
						{column.label}
					</span>
					<span class="rounded-full bg-mist/60 px-1.5 py-px text-[0.7rem] font-semibold text-muted">
						{issues.length}
					</span>
				</div>
				<div class="flex flex-col gap-2">
					{#each issues as issue (issue.id)}
						<a
							href="/tracker/{data.project.key}/issues/{issue.issue_number}"
							data-sveltekit-preload-data="hover"
							class="flex cursor-pointer flex-col gap-1.5 rounded-lg border border-mist bg-chalk px-3.5 py-3 transition-all duration-150 hover:-translate-y-px hover:border-pine hover:shadow-[0_2px_8px_rgb(0_0_0/0.06)]"
						>
							<div class="flex items-center justify-between">
								<span class="font-mono text-[0.72rem] font-medium text-muted">
									{data.project.key}-{issue.issue_number}
								</span>
								<TypeBadge type={issue.type} />
							</div>
							<p class="m-0 text-[0.85rem] leading-[1.35] font-medium text-ink">{issue.title}</p>
							<div class="mt-0.5 flex items-center gap-2">
								<PriorityDot priority={issue.priority} />
								{#if issue.due_date}
									<span class="text-[0.72rem] text-muted" title="Due {issue.due_date}">
										{formatRelativeDay(issue.due_date)}
									</span>
								{/if}
								<span class="flex-1"></span>
								{#if issue.assignee}
									<Avatar name={issue.assignee} title={issue.assignee} />
								{/if}
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</section>
