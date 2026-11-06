<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ArrowUpRight, Check, Copy } from '@lucide/svelte';
  import { ui } from '#lib/ui.stylex.ts';
  import { notify, failure } from '#lib/notice.svelte.ts';
  import { styles } from './ConnectApp.stylex.ts';
  let { url, title }: { url: string; title: string } = $props();

  // None of these apps accepts a link that prefills a connector yet, so picking one copies the
  // MCP link and shows the steps here first. The person opens the app from step 2, and the steps
  // stay on this page when they switch back. Connectors added on the web also reach the desktop
  // apps.
  const targets = [
    {
      id: 'claude',
      name: 'Claude',
      href: 'https://claude.ai/customize/connectors',
      steps: 'Choose Add, then Custom, then Web. Paste the link and approve access.'
    },
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      href: 'https://chatgpt.com/plugins',
      steps: 'Choose +, then Add custom MCP server. Paste the link and approve access.'
    },
    {
      id: 'grok',
      name: 'Grok',
      href: 'https://grok.com/connectors',
      steps: 'Choose New Connector, then Custom. Paste the link and approve access.'
    }
  ] as const;
  type Target = (typeof targets)[number];
  let selected = $state<{ target: Target; copied: boolean } | null>(null);
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
  async function select(target: Target) {
    selected = { target, copied: await copy() };
  }
</script>

<div {...stylex.attrs(styles.connect)}>
  <p {...stylex.attrs(styles.title)}>{title}</p>
  <p {...stylex.attrs(styles.detail)}>Pick the app you use to see how to add it.</p>
  <div {...stylex.attrs(styles.targets)}>
    {#each targets as target (target.id)}<button
        {...stylex.attrs(ui.button, ui.small, selected?.target.id === target.id && styles.targetOn)}
        aria-pressed={selected?.target.id === target.id}
        onclick={() => select(target)}>{target.name}</button
      >{/each}
  </div>
  {#if selected}<ol
      {...stylex.attrs(styles.steps)}
      aria-label="How to add it to {selected.target.name}"
    >
      <li>{selected.copied ? 'Your link is copied.' : 'Copy your link below.'}</li>
      <li>
        <a href={selected.target.href} target="_blank" rel="noopener noreferrer"
          >Open {selected.target.name}’s connector settings<ArrowUpRight
            size={13}
            {...stylex.attrs(styles.external)}
          /></a
        >
      </li>
      <li>{selected.target.steps}</li>
    </ol>{/if}
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
