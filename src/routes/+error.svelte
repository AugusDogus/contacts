<script lang="ts">
  import { page } from '$app/state';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from '#lib/components/PublicShell.stylex.ts';
  import Brand from '#lib/components/Brand.svelte';
</script>

<svelte:head
  ><title
    >{page.status === 404 ? 'Page not found' : 'Something went wrong'} | Contacts Exchange</title
  ></svelte:head
>
<div {...stylex.attrs(styles.shell)}>
  <header {...stylex.attrs(styles.header)}><Brand /></header>
  <main {...stylex.attrs(styles.content, styles.card, styles.closed)}>
    <h1 {...stylex.attrs(styles.title)}>
      {page.status === 404 ? 'Page not found' : 'Something went wrong'}
    </h1>
    <p {...stylex.attrs(styles.closedText)}>
      {page.error?.message || 'Check the link and try again. Your contacts are safe.'}
    </p>
    <a {...stylex.attrs(ui.button, ui.primary)} href="/">Go to Contacts Exchange</a>
  </main>
</div>
