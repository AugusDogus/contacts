<script lang="ts">
  import { page } from '$app/state';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from '#lib/components/PublicShell.stylex.ts';
  import Brand from '#lib/components/Brand.svelte';
</script>

<div {...stylex.attrs(styles.shell)}>
  <header {...stylex.attrs(styles.header)}><Brand /></header>
  <main {...stylex.attrs(styles.content, styles.card, styles.closed)}>
    <h1>{page.status === 404 ? 'This page isn’t here.' : 'We couldn’t open this page.'}</h1>
    <p {...stylex.attrs(styles.closedText)}>
      {page.error?.message || 'Check the link and try again. Your saved contacts are unchanged.'}
    </p>
    <a {...stylex.attrs(ui.button, ui.primary)} href="/">Back to Gather</a>
  </main>
</div>
