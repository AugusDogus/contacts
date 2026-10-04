<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { styles } from './shell.stylex.ts';
  import { page } from '$app/state';
  import { Settings } from '@lucide/svelte';
  import Brand from '#lib/components/Brand.svelte';
  import Footer from '#lib/components/Footer.svelte';
  import type { LayoutProps } from './$types';
  let { data, children }: LayoutProps = $props();
</script>

<div {...stylex.attrs(styles.frame)}>
  <a href="#main" {...stylex.attrs(styles.skipLink)}>Skip to content</a>
  <header {...stylex.attrs(styles.header)}>
    <div {...stylex.attrs(styles.headerInner)}>
      <Brand />
      <div {...stylex.attrs(styles.end)}>
        {#if data.viewer.kind === 'demo'}<a href="/login" {...stylex.attrs(styles.demo)}
            >Demo · Sign up</a
          >{/if}
        <a
          href="/settings"
          aria-label="Settings"
          title="Settings"
          aria-current={page.url.pathname === '/settings' ? 'page' : undefined}
          {...stylex.attrs(styles.settings, page.url.pathname === '/settings' && styles.current)}
          ><Settings size={18} strokeWidth={1.8} /></a
        >
      </div>
    </div>
  </header>
  <main id="main" {...stylex.attrs(styles.main)}>{@render children()}</main>
  <div {...stylex.attrs(styles.footer)}><Footer /></div>
</div>
