<script lang="ts">
  import { page } from '$app/state';
  import type { Snippet } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { styles } from './PublicShell.stylex.ts';
  import { ShieldCheck } from '@lucide/svelte';
  import Brand from './Brand.svelte';
  let { name, message, children }: { name: string; message: string; children: Snippet } = $props();
</script>

<div {...stylex.attrs(styles.shell)}>
  <header {...stylex.attrs(styles.header)}>
    <Brand href={page.data.appUrl || '/'} /><span {...stylex.attrs(styles.label)}
      >A little closer.</span
    >
  </header>
  <main {...stylex.attrs(styles.content)}>
    <div {...stylex.attrs(styles.intro)}>
      <span {...stylex.attrs(styles.avatar)}>{name.slice(0, 1)}</span>
      <p {...stylex.attrs(styles.from)}>An invitation from {name}</p>
      <h1 {...stylex.attrs(styles.title)}>Let’s keep in touch.</h1>
      <p {...stylex.attrs(styles.message)}>{message}</p>
    </div>
    <div {...stylex.attrs(styles.card)}>{@render children()}</div>
    <p {...stylex.attrs(styles.footer)}>
      <ShieldCheck size={14} />Your details are shared only with {name}.
    </p>
  </main>
</div>
