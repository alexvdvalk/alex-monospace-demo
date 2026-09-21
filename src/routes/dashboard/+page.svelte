<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/components/Avatar.svelte';
	import Button from '$lib/components/Button.svelte';
	import Chip from '$lib/components/Chip.svelte';
	import Field from '$lib/components/Field.svelte';
	import { inputClass, selectClass } from '$lib/components/ui';
	import { formatPrice, formatDateTime, formatRelativeDay, formatDuration } from '$lib/format';
	import { callOutcomeLabels, callStatusLabels, callStatusOptions } from '$lib/sales';
	import type { SalesCallFormField, SalesCallFormValues } from './+page.server';
	import type { PageData } from './$types';

	type FormState =
		| { success: true }
		| { errors: Partial<Record<SalesCallFormField | 'form', string>>; values: SalesCallFormValues };

	let { data, form }: { data: PageData; form: FormState | null | undefined } = $props();

	let showForm = $state(false);
	let submitting = $state(false);

	/** Pill colouring, keyed by call status. */
	const statusPill: Record<string, string> = {
		scheduled: 'bg-signal/18 text-signal',
		completed: 'bg-pine/16 text-pine',
		no_show: 'bg-danger/14 text-danger',
		cancelled: 'bg-muted/16 text-muted'
	};

	/** Pill colouring, keyed by call outcome. */
	const outcomePill: Record<string, string> = {
		closed_won: 'bg-pine/16 text-pine',
		closed_lost: 'bg-danger/14 text-danger',
		follow_up: 'bg-signal/16 text-signal',
		interested: 'bg-signal/16 text-signal',
		not_interested: 'bg-muted/16 text-muted'
	};

	const pillClass =
		'inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold tracking-[0.04em] uppercase';

	const filters = [
		{ value: 'all', label: 'All' },
		...callStatusOptions.map((value) => ({ value, label: callStatusLabels[value] }))
	];

	let activeFilter = $state<string>('all');

	const visibleCalls = $derived(
		activeFilter === 'all' ? data.calls : data.calls.filter((call) => call.status === activeFilter)
	);

	const stats = $derived([
		{ label: 'Total calls', value: String(data.stats.total), accent: false },
		{ label: 'Upcoming', value: String(data.stats.upcoming), accent: false },
		{ label: 'Completed', value: String(data.stats.completed), accent: false },
		{ label: 'Open pipeline', value: formatPrice(data.stats.pipelineValue), accent: false },
		{ label: 'Won', value: formatPrice(data.stats.wonValue), accent: true }
	]);

	function defaultScheduledAt(): string {
		const date = new Date();
		date.setMinutes(date.getMinutes() + 60 - (date.getMinutes() % 15));
		date.setSeconds(0, 0);
		const pad = (n: number) => String(n).padStart(2, '0');
		return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
	}

	const field = (name: SalesCallFormField) =>
		form && 'values' in form ? (form.values[name] ?? '') : '';

	const fieldError = (name: SalesCallFormField | 'form') =>
		form && 'errors' in form ? (form.errors[name] ?? '') : '';
</script>

<svelte:head>
	<title>Sales dashboard · Atlas</title>
</svelte:head>

<section aria-labelledby="dash-heading">
	<div class="mb-6 flex items-end justify-between gap-4">
		<div>
			<h1
				id="dash-heading"
				class="m-0 font-display text-[clamp(1.5rem,3vw,2rem)] font-bold tracking-[-0.03em]"
			>
				Sales calls
			</h1>
			<p class="mt-1 mb-0 text-[0.95rem] text-muted">Latest activity across your pipeline</p>
		</div>
		<Button variant="primary" pill class="hover:-translate-y-px" onclick={() => (showForm = !showForm)}>
			{showForm ? 'Close form' : 'New call'}
		</Button>
	</div>

	{#if form && 'success' in form}
		<p class="-mt-2 mb-4 rounded-sm bg-pine/12 px-3 py-2.5 font-semibold text-pine" role="status">
			Call saved.
		</p>
	{/if}

	{#if showForm || (form && 'errors' in form)}
		<form
			class="mb-7 rounded-lg border border-mist/80 bg-chalk/80 p-5"
			method="POST"
			action="?/create"
			use:enhance={() => {
				submitting = true;
				return async ({ update, result }) => {
					submitting = false;
					if (result.type === 'success') {
						showForm = false;
					}
					await update();
				};
			}}
		>
			<h2 class="mt-0 mb-4 font-display text-[1.15rem] font-bold tracking-[-0.02em]">
				Log a sales call
			</h2>

			{#if fieldError('form')}
				<p class="mt-0 mb-4 rounded-sm bg-danger/10 px-3 py-2.5 text-[0.8rem] text-danger" role="alert">
					{fieldError('form')}
				</p>
			{/if}

			<div class="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
				<Field label="Contact name" tone="plain" error={fieldError('contact_name')}>
					<input name="contact_name" type="text" required value={field('contact_name')} class={inputClass} />
				</Field>

				<Field label="Company" tone="plain">
					<input name="company" type="text" value={field('company')} class={inputClass} />
				</Field>

				<Field label="Phone" tone="plain">
					<input name="phone" type="tel" autocomplete="tel" value={field('phone')} class={inputClass} />
				</Field>

				<Field label="Email" tone="plain" error={fieldError('email')}>
					<input name="email" type="email" autocomplete="email" value={field('email')} class={inputClass} />
				</Field>

				<Field label="Subject" tone="plain" error={fieldError('subject')} class="sm:col-span-2">
					<input name="subject" type="text" required value={field('subject')} class={inputClass} />
				</Field>

				<Field label="Scheduled at" tone="plain" error={fieldError('scheduled_at')}>
					<input
						name="scheduled_at"
						type="datetime-local"
						required
						value={field('scheduled_at') || defaultScheduledAt()}
						class={inputClass}
					/>
				</Field>

				<Field label="Status" tone="plain" error={fieldError('status')}>
					<select name="status" value={field('status') || 'scheduled'} class={selectClass}>
						{#each callStatusOptions as status (status)}
							<option value={status}>{callStatusLabels[status]}</option>
						{/each}
					</select>
				</Field>

				<Field label="Duration (minutes)" tone="plain" error={fieldError('duration_minutes')}>
					<input
						name="duration_minutes"
						type="number"
						min="0"
						step="5"
						value={field('duration_minutes')}
						class={inputClass}
					/>
				</Field>

				<Field label="Deal value (USD)" tone="plain" error={fieldError('deal_value')}>
					<input
						name="deal_value"
						type="number"
						min="0"
						step="0.01"
						inputmode="decimal"
						value={field('deal_value')}
						class={inputClass}
					/>
				</Field>

				<Field label="Notes" tone="plain" class="sm:col-span-2">
					<textarea name="notes" rows="3" class={inputClass}>{field('notes')}</textarea>
				</Field>
			</div>

			<div class="mt-4 flex justify-end gap-3">
				<Button variant="ghost" pill onclick={() => (showForm = false)}>Cancel</Button>
				<Button
					type="submit"
					variant="primary"
					pill
					class="hover:-translate-y-px"
					disabled={submitting}
				>
					{submitting ? 'Saving…' : 'Save call'}
				</Button>
			</div>
		</form>
	{/if}

	<div class="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-5" role="list">
		{#each stats as stat (stat.label)}
			<div
				class="flex flex-col gap-1.5 rounded-lg p-4 {stat.accent
					? 'border border-transparent bg-linear-150 from-pine to-pine-deep text-chalk'
					: 'border border-mist/75 bg-chalk/70'}"
				role="listitem"
			>
				<span
					class="text-xs tracking-[0.06em] uppercase {stat.accent ? 'text-chalk/80' : 'text-muted'}"
				>
					{stat.label}
				</span>
				<span class="font-display text-[1.6rem] font-bold tracking-[-0.02em] tabular-nums">
					{stat.value}
				</span>
			</div>
		{/each}
	</div>

	<div class="mb-5 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by status">
		{#each filters as filter (filter.value)}
			<Chip
				aria-pressed={activeFilter === filter.value}
				active={activeFilter === filter.value}
				onclick={() => (activeFilter = filter.value)}
			>
				{filter.label}
			</Chip>
		{/each}
		<span class="ml-auto font-mono text-xs text-muted">{visibleCalls.length} shown</span>
	</div>

	{#if visibleCalls.length === 0}
		<p class="py-10 text-muted">No calls match this filter.</p>
	{:else}
		<ul class="m-0 flex list-none flex-col gap-2 p-0">
			{#each visibleCalls as call, i (call.id)}
				<li class="animate-row-in [animation-delay:calc(var(--i)*24ms)]" style="--i: {i}">
					<article
						class="grid grid-cols-[auto_1fr] items-center gap-x-3.5 gap-y-2.5 rounded-[0.4rem] border border-transparent bg-chalk/55 px-4 py-3.5 transition-all duration-200 hover:translate-x-[3px] hover:border-mist-pine hover:bg-chalk wide:grid-cols-[auto_minmax(0,1.1fr)_minmax(0,1.4fr)_auto_auto_auto_auto] wide:gap-5"
					>
						<Avatar name={call.contact_name} size="lg" gradient />
						<div class="flex min-w-0 flex-col">
							<span class="font-semibold tracking-[-0.01em]">{call.contact_name}</span>
							<span class="text-[0.85rem] text-muted">{call.company ?? 'Independent'}</span>
						</div>
						<div class="col-start-2 flex flex-wrap items-center gap-2 wide:col-auto">
							<span class="text-[0.9rem]">{call.subject}</span>
							{#if call.outcome}
								<span class="{pillClass} {outcomePill[call.outcome] ?? ''}">
									{callOutcomeLabels[call.outcome] ?? call.outcome}
								</span>
							{/if}
						</div>
						<div
							class="col-start-2 flex flex-wrap items-baseline gap-2 wide:col-auto wide:flex-col wide:items-start wide:gap-0.5"
						>
							<span class="text-[0.85rem] text-muted">{formatDateTime(call.scheduled_at)}</span>
							<span class="text-xs font-semibold text-pine">{formatRelativeDay(call.scheduled_at)}</span>
						</div>
						<span class="col-start-2 font-mono text-[0.85rem] text-muted wide:col-auto">
							{formatDuration(call.duration_minutes)}
						</span>
						<span class="col-start-2 font-bold tabular-nums wide:col-auto wide:min-w-20 wide:text-right">
							{call.deal_value ? formatPrice(call.deal_value) : '—'}
						</span>
						<span
							class="col-start-2 {pillClass} {statusPill[call.status ?? ''] ??
								''} wide:col-auto wide:min-w-24 wide:justify-center wide:justify-self-end"
						>
							{callStatusLabels[call.status ?? ''] ?? call.status}
						</span>
					</article>
				</li>
			{/each}
		</ul>
	{/if}
</section>
