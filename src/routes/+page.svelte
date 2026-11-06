<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { s } from './landing.stylex.ts';
  import PageMeta from '#lib/components/PageMeta.svelte';
  import LiveDemo from './LiveDemo.svelte';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  let start = $derived(
    data.signedIn
      ? { href: '/people', label: 'Open your address book' }
      : { href: '/login', label: 'Create your address book' }
  );
  let mcpUrl = $derived(`${data.appUrl}/mcp`);
  const description =
    'A private address book your friends fill in. Send one link, they add their own name, email, phone, address and birthday, and you export it to your phone.';
  // Structured data for the site name and logo in search results.
  let structuredData = $derived(
    JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${data.appUrl}/#website`,
          name: 'Contacts Exchange',
          url: `${data.appUrl}/`,
          description,
          publisher: { '@id': `${data.appUrl}/#organization` }
        },
        {
          '@type': 'Organization',
          '@id': `${data.appUrl}/#organization`,
          name: 'Contacts Exchange',
          url: `${data.appUrl}/`,
          logo: `${data.appUrl}/icon-512.png`,
          email: 'support@contacts.exchange'
        }
      ]
    }).replaceAll('<', '\\u003c')
  );
  let copy = $state<'idle' | 'copied' | 'failed'>('idle');
  let copyLabel = $derived({ idle: 'Copy', copied: 'Copied', failed: 'Select to copy' }[copy]);
  async function copyMcpUrl() {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      copy = 'copied';
    } catch {
      copy = 'failed';
    }
  }

  const fields = [
    { name: 'Name', state: 'Required', on: true },
    { name: 'Email or phone', state: 'One required', on: true },
    { name: 'Address', state: 'Optional', on: false },
    { name: 'Birthday', state: 'Optional', on: false },
    { name: 'Photo', state: 'Optional', on: false },
    { name: 'Pronouns', state: 'Optional', on: false },
    { name: 'Company', state: 'Optional', on: false },
    { name: 'Website', state: 'Optional', on: false },
    { name: 'Notes', state: 'Optional', on: false },
    { name: 'Your own questions', state: 'Optional', on: false }
  ];
  const questions = [
    {
      q: 'What happens when a link expires?',
      a: 'Your friend is asked for a new one. Renew it from People for another 30 days.'
    },
    {
      q: 'Who can see the details?',
      a: 'Only you see the cards people send. Your page name and note are public.'
    },
    {
      q: 'Will Google Contacts get duplicates?',
      a: 'No. Export matches people by email, phone, or name, and asks before changing anything.'
    }
  ];
</script>

<PageMeta title="Contacts Exchange: an address book your friends fill in" {description} path="/" />
<svelte:head>
  <!-- Safe: JSON.stringify output with every < escaped. -->
  {@html `<script type="application/ld+json">${structuredData}</script>`}
</svelte:head>

<div {...stylex.attrs(s.page)}>
  <a {...stylex.attrs(s.skip)} href="#main">Skip to content</a>
  <div {...stylex.attrs(s.navWrap)}>
    <nav {...stylex.attrs(s.nav)} aria-label="Main">
      <a {...stylex.attrs(s.brand)} href="/"
        ><img src="/favicon.svg" alt="" width="28" height="28" />Contacts Exchange</a
      >
      <ul {...stylex.attrs(s.navLinks)}>
        <li><a {...stylex.attrs(s.navLink)} href="#try">Try it</a></li>
        <li><a {...stylex.attrs(s.navLink)} href="#questions">Questions</a></li>
      </ul>
      {#if !data.signedIn}<a {...stylex.attrs(s.navLink, s.navSignIn)} href="/login?signin"
          >Sign in</a
        >{/if}
      <a {...stylex.attrs(s.button, s.buttonSmall)} href={start.href}
        >{data.signedIn ? 'Open' : 'Sign up'}</a
      >
    </nav>
  </div>

  <main id="main">
    <section {...stylex.attrs(s.hero, s.container)} aria-labelledby="hero-title">
      <div {...stylex.attrs(s.heroInner)}>
        <h1 id="hero-title" {...stylex.attrs(s.h1)}>An address book your friends fill in.</h1>
        <p {...stylex.attrs(s.lead)}>
          Send one link. They add their own details, and you keep them.
        </p>
        <div {...stylex.attrs(s.heroAction)}>
          <a {...stylex.attrs(s.button)} href={start.href}>{start.label}</a>
          <p {...stylex.attrs(s.terms)}>Friends don’t need an account. Each link works once.</p>
        </div>
      </div>
    </section>

    <section id="try" {...stylex.attrs(s.section, s.sectionAfterHero)} aria-labelledby="try-title">
      <div {...stylex.attrs(s.container, s.tryIt)}>
        <div {...stylex.attrs(s.tryHead)}>
          <h2 id="try-title" {...stylex.attrs(s.h2)}>Try it here</h2>
          <p {...stylex.attrs(s.body)}>
            This is the real app with pretend people. Nothing you type leaves this page.
          </p>
          <ol {...stylex.attrs(s.trySteps)}>
            <li>Press Invite and name a link.</li>
            <li>Fill in your friend’s side.</li>
            <li>Open their card in People.</li>
          </ol>
        </div>
        <LiveDemo origin={data.appUrl} />
      </div>
    </section>

    <section id="fields" {...stylex.attrs(s.section, s.band)} aria-labelledby="fields-title">
      <div {...stylex.attrs(s.container, s.split)}>
        <div {...stylex.attrs(s.splitHead)}>
          <h2 id="fields-title" {...stylex.attrs(s.h2)}>You choose what they share</h2>
          <p {...stylex.attrs(s.body)}>
            Mark any field required, or add your own question. Changes reach links you’ve already
            sent.
          </p>
        </div>
        <ul {...stylex.attrs(s.ruled)} aria-label="Fields friends can fill in">
          {#each fields as field (field.name)}<li {...stylex.attrs(s.row)}>
              {field.name}<span {...stylex.attrs(s.tag, field.on ? s.tagOn : s.tagOut)}
                >{field.state}</span
              >
            </li>{/each}
        </ul>
      </div>
    </section>

    <section id="questions" {...stylex.attrs(s.section)} aria-labelledby="questions-title">
      <div {...stylex.attrs(s.container)}>
        <h2 id="questions-title" {...stylex.attrs(s.h2)}>Before you send a link</h2>
        <dl {...stylex.attrs(s.questions)}>
          {#each questions as item (item.q)}<div {...stylex.attrs(s.question)}>
              <dt {...stylex.attrs(s.q)}>{item.q}</dt>
              <dd {...stylex.attrs(s.a)}>{item.a}</dd>
            </div>{/each}
        </dl>
      </div>
    </section>

    <section {...stylex.attrs(s.section, s.close)} aria-labelledby="ai-title">
      <div {...stylex.attrs(s.container, s.split)}>
        <div {...stylex.attrs(s.splitHead)}>
          <h2 id="ai-title" {...stylex.attrs(s.h2, s.closeH2)}>Ask your AI for an address</h2>
          <p {...stylex.attrs(s.body, s.closeBody)}>
            Add this address to Claude, ChatGPT, or another AI app, then look people up or make
            invitation links from a chat.
          </p>
        </div>
        <div {...stylex.attrs(s.closeSide)}>
          <div {...stylex.attrs(s.code)}>
            <code {...stylex.attrs(s.codeText)}>{mcpUrl}</code><button
              type="button"
              {...stylex.attrs(s.copy)}
              onclick={copyMcpUrl}>{copyLabel}</button
            >
          </div>
          <a {...stylex.attrs(s.button, s.buttonOnInk)} href={start.href}>{start.label}</a>
        </div>
      </div>
    </section>
  </main>

  <footer {...stylex.attrs(s.container, s.footer)}>
    <p {...stylex.attrs(s.mast)}>
      <img {...stylex.attrs(s.mastIcon)} src="/favicon.svg" alt="" width="96" height="96" />Contacts
      Exchange
    </p>
    <div {...stylex.attrs(s.footerRow)}>
      <p {...stylex.attrs(s.fine)}>A private address book your friends fill in.</p>
      <nav aria-label="Footer">
        <ul {...stylex.attrs(s.footerLinks)}>
          <li><a {...stylex.attrs(s.footerLink)} href="/about">About</a></li>
          <li><a {...stylex.attrs(s.footerLink)} href="/privacy">Privacy</a></li>
          <li>
            <a {...stylex.attrs(s.footerLink)} href="mailto:support@contacts.exchange">Contact</a>
          </li>
        </ul>
      </nav>
    </div>
  </footer>
</div>
