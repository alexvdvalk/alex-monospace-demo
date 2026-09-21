/** Shared Tailwind class strings for form controls. */
const controlBase =
	'border border-mist bg-white text-ink focus:border-signal focus:outline-2 focus:outline-offset-1 focus:outline-signal';

export const inputClass = `${controlBase} rounded-md px-2.5 py-2 text-sm`;
export const selectClass = `${inputClass} cursor-pointer`;

/** Compact variants used by the board filters and the inline issue editors. */
export const inputSmClass = `${controlBase} rounded px-1.5 py-1 text-[0.82rem]`;
export const selectSmClass = `${controlBase} cursor-pointer rounded-md px-2.5 py-1.5 text-[0.82rem]`;
