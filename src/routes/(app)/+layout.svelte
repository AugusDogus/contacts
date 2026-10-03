<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { styles } from './shell.stylex.ts';
  import { page } from '$app/state';
  import { BookUser, Link, Download, Settings } from '@lucide/svelte';
  import Brand from '#lib/components/Brand.svelte';
  import type { LayoutProps } from './$types';
  let { data, children }: LayoutProps = $props();
  const destinations = [
    { href: '/', label: 'People', icon: BookUser },
    { href: '/invitations', label: 'Invitations', icon: Link },
    { href: '/google', label: 'Export', icon: Download },
    { href: '/settings', label: 'Settings', icon: Settings }
  ] as const;
</script>

<a href="#main" {...stylex.attrs(styles.skipLink)}>Skip to content</a>
<header {...stylex.attrs(styles.header)}>
  <div {...stylex.attrs(styles.headerInner)}>
    <Brand />
    <nav {...stylex.attrs(styles.nav)} aria-label="Main">
      {#each destinations as item (item.href)}{@const current = page.url.pathname === item.href}<a
          href={item.href}
          aria-current={current ? 'page' : undefined}
          {...stylex.attrs(styles.navLink, current && styles.navCurrent)}
          ><item.icon size={18} strokeWidth={1.8} /><span>{item.label}</span></a
        >{/each}
    </nav>
    {#if data.viewer.kind === 'demo'}<p {...stylex.attrs(styles.demo)}>
        <span {...stylex.attrs(styles.demoLabel)}>Sample data.</span>
        <a href="/login">Create an account</a>
      </p>{/if}
  </div>
</header>
<main id="main" {...stylex.attrs(styles.main)}>{@render children()}</main>
