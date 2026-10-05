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
    wide = false
  }: { title: string; onclose: () => void; children: Snippet; wide?: boolean } = $props();
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
  {...stylex.attrs(styles.dialog, wide && styles.wide)}
  {onclose}
  onclick={(event) => {
    if (event.target === dialog) dialog.close();
  }}
  onkeydown={(event) => {
    if (event.key === 'Escape') dialog.close();
  }}
  aria-label={title}
>
  <div {...stylex.attrs(styles.modalBody)}>
    <header {...stylex.attrs(styles.header)}>
      <h2 {...stylex.attrs(styles.title)}>{title}</h2>
      <button
        {...stylex.attrs(ui.iconButton)}
        onclick={() => dialog.close()}
        aria-label="Close dialog"><X size={18} /></button
      >
    </header>
    {@render children()}
  </div>
</dialog>
