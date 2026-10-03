<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';

  import '@fontsource/instrument-sans/400.css';
  import '@fontsource/instrument-sans/500.css';
  import '@fontsource/instrument-sans/600.css';
  import '@fontsource/instrument-sans/700.css';
  import '@fontsource/bricolage-grotesque/500.css';
  import '@fontsource/bricolage-grotesque/600.css';
  import '@fontsource/bricolage-grotesque/700.css';
  import '../app.css';
  if (import.meta.env.DEV) {
    $effect(() => {
      void import('virtual:stylex:runtime');
    });
  }
  import { notice } from '#lib/notice.svelte.ts';
  import { Check, CircleAlert, X } from '@lucide/svelte';
  import type { LayoutProps } from './$types';
  let { children }: LayoutProps = $props();
</script>

<svelte:head
  >{#if import.meta.env.DEV}<link rel="stylesheet" href="/virtual:stylex.css" />{/if}<title
    >Contacts Exchange | Your people, in one place</title
  ><meta
    name="description"
    content="A private address book, filled in by the people you know. Share an invitation, collect the details, and keep in touch."
  /></svelte:head
>
{@render children()}
<div {...stylex.attrs(ui.toastRegion)} aria-live="polite" aria-atomic="true">
  {#if notice.message}<div {...stylex.attrs(ui.toast)}>
      {#if notice.tone === 'success'}<Check size={18} />{:else}<CircleAlert size={18} />{/if}<span
        >{notice.message}</span
      ><button
        aria-label="Dismiss notification"
        {...stylex.attrs(ui.iconButton)}
        onclick={() => (notice.message = '')}><X size={16} /></button
      >
    </div>{/if}
</div>
