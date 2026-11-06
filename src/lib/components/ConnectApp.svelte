<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ArrowUpRight, Check, Copy } from '@lucide/svelte';
  import { ui } from '#lib/ui.stylex.ts';
  import { notify, failure } from '#lib/notice.svelte.ts';
  import { styles } from './ConnectApp.stylex.ts';
  let { url, title }: { url: string; title: string } = $props();

  // None of these apps accepts a link that prefills a connector yet, so each button copies the
  // MCP link and opens the page where it is pasted. Connectors added on the web also reach the
  // desktop apps.
  const targets = [
    {
      id: 'claude',
      name: 'Claude',
      href: 'https://claude.ai/customize/connectors',
      steps: 'choose Add, then Custom, then Web, and paste the link.'
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      href: 'https://chatgpt.com/plugins',
      steps: 'choose +, then Add custom MCP server, and paste the link.'
    },
    {
      id: 'grok',
      name: 'Grok',
      href: 'https://grok.com/connectors',
      steps: 'choose New Connector, then Custom, and paste the link.'
    }
  ] as const;
  type Target = (typeof targets)[number];
  let opened = $state<Target | null>(null);
  let copied = $state(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      copied = true;
      return true;
    } catch (cause) {
      failure(cause);
      return false;
    }
  }
  async function copyLink() {
    if (await copy()) notify('Link copied');
  }
  // The link opens the app itself; copying runs in the same click so the browser allows it.
  async function openTarget(target: Target) {
    opened = (await copy()) ? target : null;
  }
</script>

<div {...stylex.attrs(styles.connect)}>
  <p {...stylex.attrs(styles.title)}>{title}</p>
  <p {...stylex.attrs(styles.detail)}>
    Pick an app to copy your link and open the page where you add it.
  </p>
  <div {...stylex.attrs(styles.targets)}>
    {#each targets as target (target.id)}<a
        {...stylex.attrs(ui.button, ui.small, styles.target)}
        href={target.href}
        target="_blank"
        rel="noopener noreferrer"
        onclick={() => openTarget(target)}>Add to {target.name}<ArrowUpRight size={14} /></a
      >{/each}
  </div>
  {#if opened}<p {...stylex.attrs(styles.steps)} role="status">
      Link copied. In {opened.name}, {opened.steps}
    </p>{/if}
  <p {...stylex.attrs(styles.detail, styles.other)}>
    Using another app? Add this link as an MCP server:
  </p>
  <div {...stylex.attrs(styles.link)}>
    <input
      {...stylex.attrs(styles.url)}
      aria-label="MCP server link"
      readonly
      value={url}
      onfocus={(event) => event.currentTarget.select()}
    />
    <button {...stylex.attrs(ui.button, ui.small)} onclick={copyLink}
      >{#if copied}<Check size={14} />Copied{:else}<Copy size={14} />Copy{/if}</button
    >
  </div>
</div>
