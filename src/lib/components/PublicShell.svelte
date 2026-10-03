<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { styles } from './PublicShell.stylex.ts';
  import Brand from './Brand.svelte';
  let {
    name,
    title,
    message = '',
    children
  }: { name: string; title: string; message?: string; children: Snippet } = $props();
</script>

<div {...stylex.attrs(styles.shell)}>
  <header {...stylex.attrs(styles.header)}><Brand href={page.data.appUrl || '/'} /></header>
  <main {...stylex.attrs(styles.content)}>
    <div {...stylex.attrs(styles.intro)}>
      <span {...stylex.attrs(styles.avatar)} aria-hidden="true">{name.slice(0, 1)}</span>
      <h1 {...stylex.attrs(styles.title)}>{title}</h1>
      {#if message}<p {...stylex.attrs(styles.message)}>{message}</p>{/if}
    </div>
    <div {...stylex.attrs(styles.card)}>{@render children()}</div>
    <p {...stylex.attrs(styles.footer)}>
      Shared with {name} for their address book.
      <a href="{page.data.appUrl || ''}/privacy">Privacy</a>
    </p>
  </main>
</div>
