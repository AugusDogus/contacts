<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './Modal.stylex.ts';

  import { X } from '@lucide/svelte';
  import type { Snippet } from 'svelte';
  let {
    title,
    onclose,
    children,
    size = 'default',
    dismissible = true
  }: {
    title: string;
    onclose: () => void;
    children: Snippet;
    size?: 'default' | 'wide' | 'large';
    /** False while work is in progress: no close button, and Escape or outside clicks do nothing. */
    dismissible?: boolean;
  } = $props();
  let dialog: HTMLDialogElement;
  $effect(() => {
    dialog.showModal();
    // Without a field asking for focus, focus the dialog rather than ringing the close button.
    if (!dialog.querySelector('[autofocus]')) dialog.focus();
  });
</script>

<dialog
  bind:this={dialog}
  tabindex="-1"
  {...stylex.attrs(styles.dialog, size === 'wide' && styles.wide, size === 'large' && styles.large)}
  onclose={() => {
    // Browsers may close a dialog on Escape even when that is cancelled, so reopen it.
    if (dismissible) onclose();
    else dialog.showModal();
  }}
  oncancel={(event) => {
    if (!dismissible) event.preventDefault();
  }}
  onclick={(event) => {
    if (dismissible && event.target === dialog) dialog.close();
  }}
  onkeydown={(event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (dismissible) dialog.close();
  }}
  aria-label={title}
>
  <div {...stylex.attrs(styles.modalBody)}>
    <header {...stylex.attrs(styles.header)}>
      <h2 {...stylex.attrs(styles.title)}>{title}</h2>
      {#if dismissible}<button
          {...stylex.attrs(ui.iconButton)}
          onclick={() => dialog.close()}
          aria-label="Close dialog"><X size={18} /></button
        >{/if}
    </header>
    {@render children()}
  </div>
</dialog>
