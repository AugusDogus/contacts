<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './shell.stylex.ts';

  import { page } from '$app/state';
  import {
    BookUser,
    Link,
    SquareUserRound,
    Settings,
    ArrowUpRight,
    Menu,
    X,
    ShieldCheck,
    LogOut,
    ChevronsUpDown
  } from '@lucide/svelte';
  import Brand from '#lib/components/Brand.svelte';
  import { getAddressBook } from '#lib/contacts.remote.ts';
  import { authClient } from '#lib/auth-client.ts';
  import type { LayoutProps } from './$types';
  let { data, children }: LayoutProps = $props();
  let book = $derived(await getAddressBook());
  let mobileOpen = $state(false);
  let pending = $derived(
    book.invitations.filter((i) => i.status === 'pending' && i.expiresAt > Date.now()).length
  );
  let title = $derived(
    page.url.pathname === '/'
      ? 'Address book'
      : page.url.pathname === '/invitations'
        ? 'Invitations'
        : page.url.pathname === '/page'
          ? 'My contact page'
          : page.url.pathname === '/google'
            ? 'Google Contacts'
            : 'Settings'
  );
</script>

<a href="#main" {...stylex.attrs(styles.skipLink)}>Skip to content</a>
<div {...stylex.attrs(styles.appShell)}>
  {#if mobileOpen}<button
      {...stylex.attrs(styles.mobileScrim)}
      onclick={() => (mobileOpen = false)}
      aria-label="Close navigation"
    ></button>{/if}
  <aside {...stylex.attrs(styles.sidebar, mobileOpen && styles.mobileOpen)}>
    <div {...stylex.attrs(styles.brandRow)}>
      <Brand /><button
        {...stylex.attrs(ui.iconButton, styles.mobileButton)}
        onclick={() => (mobileOpen = false)}
        aria-label="Close navigation"><X size={20} /></button
      >
    </div>
    <a href="/page" {...stylex.attrs(styles.workspace)} onclick={() => (mobileOpen = false)}
      ><span {...stylex.attrs(styles.workspaceAvatar)}>{book.profile.name.slice(0, 1)}</span><span
        {...stylex.attrs(styles.flexText)}
        ><strong {...stylex.attrs(styles.workspaceTitle)}>{book.profile.name}'s space</strong><small
          {...stylex.attrs(styles.workspaceSubtitle)}>Personal address book</small
        ></span
      ><ChevronsUpDown size={14} /></a
    >
    <nav {...stylex.attrs(styles.nav)} aria-label="Main navigation">
      <a
        href="/"
        {...stylex.attrs(styles.navLink, page.url.pathname === '/' && styles.active)}
        onclick={() => (mobileOpen = false)}
        ><BookUser size={18} strokeWidth={1.7} /><span {...stylex.attrs(styles.flexText)}
          >People</span
        ><span {...stylex.attrs(styles.navCount)}>{book.contacts.length}</span></a
      >
      <a
        href="/invitations"
        {...stylex.attrs(styles.navLink, page.url.pathname === '/invitations' && styles.active)}
        onclick={() => (mobileOpen = false)}
        ><Link size={18} strokeWidth={1.7} /><span {...stylex.attrs(styles.flexText)}
          >Invitations</span
        >{#if pending}<span {...stylex.attrs(styles.navCount)}>{pending}</span>{/if}</a
      >
      <a
        href="/page"
        {...stylex.attrs(styles.navLink, page.url.pathname === '/page' && styles.active)}
        onclick={() => (mobileOpen = false)}
        ><SquareUserRound size={18} strokeWidth={1.7} /><span {...stylex.attrs(styles.flexText)}
          >My contact page</span
        ></a
      >
      <div {...stylex.attrs(styles.navDivider)}></div>
      <a
        href="/google"
        {...stylex.attrs(styles.navLink, page.url.pathname === '/google' && styles.active)}
        onclick={() => (mobileOpen = false)}
        ><span {...stylex.attrs(styles.googleMark)}>G</span><span {...stylex.attrs(styles.flexText)}
          >Google Contacts</span
        ></a
      >
      <a
        href="/settings"
        {...stylex.attrs(styles.navLink, page.url.pathname === '/settings' && styles.active)}
        onclick={() => (mobileOpen = false)}
        ><Settings size={18} strokeWidth={1.7} /><span {...stylex.attrs(styles.flexText)}
          >Settings</span
        ></a
      >
    </nav>
    <div {...stylex.attrs(styles.sidebarBottom)}>
      <div {...stylex.attrs(styles.privateNote)}>
        <span {...stylex.attrs(styles.shield)}><ShieldCheck size={20} strokeWidth={1.5} /></span
        ><strong {...stylex.attrs(styles.privateTitle)}>Good company. Just yours.</strong>
        <p {...stylex.attrs(styles.privateText)}>
          Your address book is private.<br />Only invited friends can add a card.
        </p>
        <a href="/invitations" {...stylex.attrs(styles.privateLink)}
          >How invitations work <ArrowUpRight size={13} /></a
        >
      </div>
      {#if data.viewer.kind === 'demo'}<a href="/login" {...stylex.attrs(styles.accountRow)}
          ><span {...stylex.attrs(styles.accountAvatar)}>A</span><span
            {...stylex.attrs(styles.flexText)}
            ><strong {...stylex.attrs(styles.workspaceTitle)}>Augie</strong><small
              {...stylex.attrs(styles.accountSmall)}>Demo workspace</small
            ></span
          ><ArrowUpRight size={16} /></a
        >{:else}<div {...stylex.attrs(styles.accountRow)}>
          <span {...stylex.attrs(styles.accountAvatar)}>{book.profile.name.slice(0, 1)}</span><span
            {...stylex.attrs(styles.flexText)}
            ><strong {...stylex.attrs(styles.workspaceTitle)}>{book.profile.name}</strong><small
              {...stylex.attrs(styles.accountSmall)}>{data.viewer.email}</small
            ></span
          ><button
            {...stylex.attrs(ui.iconButton)}
            aria-label="Sign out"
            onclick={async () => {
              await authClient.signOut();
              window.location.href = '/login';
            }}><LogOut size={16} /></button
          >
        </div>{/if}
    </div>
  </aside>
  <div {...stylex.attrs(styles.mainShell)} inert={mobileOpen}>
    <header {...stylex.attrs(styles.topbar)}>
      <div {...stylex.attrs(styles.topbarGroup)}>
        <button
          {...stylex.attrs(ui.iconButton, styles.mobileButton)}
          aria-label="Open navigation"
          onclick={() => (mobileOpen = true)}><Menu size={20} /></button
        ><span {...stylex.attrs(styles.breadcrumb)}>My space</span><span
          {...stylex.attrs(styles.slash)}>/</span
        ><span>{title}</span>
      </div>
      <div {...stylex.attrs(styles.topbarGroup)}>
        {#if data.viewer.kind === 'demo'}<span {...stylex.attrs(styles.demoPill)}
            ><span {...stylex.attrs(styles.demoDot)}></span>Sample address book</span
          ><a href="/login" {...stylex.attrs(styles.topLink)}
            >Make it yours <ArrowUpRight size={13} /></a
          >{:else}<span {...stylex.attrs(styles.privateLabel)}
            ><ShieldCheck size={14} /> Private to you</span
          >{/if}
      </div>
    </header>
    <main id="main" {...stylex.attrs(styles.main)}>{@render children()}</main>
    <footer {...stylex.attrs(styles.appFooter)}>
      <span>A little closer to your people.</span><span {...stylex.attrs(styles.footerEnd)}
        >Made for keeping in touch <span {...stylex.attrs(styles.footerSpark)}>✳</span></span
      >
    </footer>
  </div>
</div>
