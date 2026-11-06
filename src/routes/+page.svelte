<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { s } from './landing.stylex.ts';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  let start = $derived(
    data.signedIn
      ? { href: '/people', label: 'Open your address book' }
      : { href: '/login', label: 'Create your address book' }
  );
  let mcpUrl = $derived(`${data.appUrl}/mcp`);
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

  const steps = [
    {
      image: 'invite',
      title: 'Name a link',
      text: 'Make one for each person. It works once and expires after 30 days.',
      alt: 'The New invitation dialog, with the name Maya typed in above a Create link button.'
    },
    {
      image: 'friend',
      title: 'They fill in their card',
      text: 'No account or app. They add a photo, an address, a birthday.',
      alt: 'The form a friend sees, titled Share your details with Robin, with fields for a photo, name, email and phone.'
    },
    {
      image: 'people',
      title: 'It lands in People',
      text: 'Search everyone who replied, and see who you’re still waiting on.',
      alt: 'The People page, with three links still waiting and new contacts listed with their cities.'
    },
    {
      image: 'export',
      title: 'Take it with you',
      text: 'Download a vCard, or add to Google Contacts without making duplicates.',
      alt: 'The Export page, offering Google Contacts or a vCard file for Apple Contacts and Outlook.'
    }
  ];
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
      q: 'Does my friend need an account?',
      a: 'No. They open your link, fill in their card, and send it.'
    },
    {
      q: 'What if a link gets forwarded?',
      a: 'Each link works once, so only the first person to open it can reply.'
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

<div {...stylex.attrs(s.page)}>
  <a {...stylex.attrs(s.skip)} href="#main">Skip to content</a>
  <div {...stylex.attrs(s.navWrap)}>
    <nav {...stylex.attrs(s.nav)} aria-label="Main">
      <a {...stylex.attrs(s.brand)} href="/"
        ><img src="/favicon.svg" alt="" width="28" height="28" />Contacts Exchange</a
      >
      <ul {...stylex.attrs(s.navLinks)}>
        <li><a {...stylex.attrs(s.navLink)} href="#how">How it works</a></li>
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

    <section id="how" {...stylex.attrs(s.section)} aria-labelledby="how-title">
      <div {...stylex.attrs(s.container, s.stack)}>
        <div {...stylex.attrs(s.pane)}>
          <h2 id="how-title" {...stylex.attrs(s.h2)}>From one link to your phone</h2>
          <p {...stylex.attrs(s.body)}>
            No more copying addresses out of texts. Each person fills in their own card.
          </p>
          <a {...stylex.attrs(s.button)} href={start.href}>{start.label}</a>
        </div>
        <ol {...stylex.attrs(s.captures)}>
          {#each steps as step, index (step.image)}<li>
              <figure {...stylex.attrs(s.figure)}>
                <div {...stylex.attrs(s.shot)}>
                  <img
                    {...stylex.attrs(s.shotImg)}
                    src="/landing/{step.image}.webp"
                    alt={step.alt}
                    width="1600"
                    height="1000"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                  />
                </div>
                <figcaption {...stylex.attrs(s.caption)}>
                  <h3 {...stylex.attrs(s.h3)}>{step.title}</h3>
                  <p {...stylex.attrs(s.body)}>{step.text}</p>
                </figcaption>
              </figure>
            </li>{/each}
        </ol>
      </div>
    </section>

    <section {...stylex.attrs(s.section, s.band)} aria-labelledby="fields-title">
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
        <h2 id="questions-title" {...stylex.attrs(s.h2)}>Questions</h2>
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
            Add this address to Claude, ChatGPT, or another AI app. Then look someone up or make
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
          <p {...stylex.attrs(s.apps)}>Sign in once when your AI app asks.</p>
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
