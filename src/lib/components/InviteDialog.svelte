<script lang="ts">
  import { invitationReference } from '#lib/invitation-token.ts';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './InviteDialog.stylex.ts';
  import { page } from '$app/state';
  import { Copy, Check, Plus, Minus, Share } from '@lucide/svelte';
  import Modal from './Modal.svelte';
  import { createInvitations, getAddressBook } from '#lib/contacts.remote.ts';
  import { invitationUrl } from '#lib/links.ts';
  import { notify, failure } from '#lib/notice.svelte.ts';
  let { onclose }: { onclose: () => void } = $props();
  let count = $state(1);
  let label = $state('');
  let busy = $state(false);
  let error = $state('');
  let links = $state<{ id: string; name: string; url: string }[]>([]);
  let copied = $state('');
  async function generate() {
    busy = true;
    error = '';
    try {
      const result = await createInvitations({ count, label });
      if (!result.ok) {
        error = result.message;
        return;
      }
      const { profile } = await getAddressBook();
      links = result.invitations.map((i) => ({
        id: i.id,
        name: i.label ? `${i.label} #${invitationReference(i)}` : `#${invitationReference(i)}`,
        url: invitationUrl(i.token, page.url.origin, profile.slug)
      }));
    } catch (cause) {
      error =
        cause instanceof Error
          ? cause.message
          : 'The link wasn’t created. Check your connection and try again.';
    } finally {
      busy = false;
    }
  }
  async function copy(value: string, id: string) {
    try {
      await navigator.clipboard.writeText(value);
      copied = id;
      notify(id === 'all' ? 'Links copied' : 'Link copied');
    } catch (cause) {
      failure(cause);
    }
  }
  // Opens Messages and similar apps directly on phones. Hidden where unsupported.
  const canShare = typeof navigator !== 'undefined' && 'share' in navigator;
  async function share(url: string) {
    try {
      await navigator.share({ url });
    } catch (cause) {
      if (!(cause instanceof DOMException && cause.name === 'AbortError')) failure(cause);
    }
  }
</script>

<Modal
  title={links.length > 1
    ? `${links.length} links ready`
    : links.length
      ? 'Link ready'
      : 'New invitation'}
  {onclose}
>
  {#if links.length}
    <p {...stylex.attrs(styles.lead)}>
      {links.length > 1 ? 'One per person. Each link works once.' : 'Works once.'} You can copy
      {links.length > 1 ? 'them' : 'it'} again from People.
    </p>
    <ul {...stylex.attrs(styles.links)}>
      {#each links as link (link.id)}<li {...stylex.attrs(styles.link)}>
          <div {...stylex.attrs(styles.linkText)}>
            <strong {...stylex.attrs(styles.linkLabel)}>{link.name}</strong>
            <input
              {...stylex.attrs(styles.linkInput)}
              aria-label="Invitation link {link.name}"
              readonly
              value={link.url}
              onfocus={(event) => event.currentTarget.select()}
            />
          </div>
          <button
            {...stylex.attrs(ui.button, ui.small, links.length === 1 && !canShare && ui.primary)}
            onclick={() => copy(link.url, link.id)}
            aria-label={links.length > 1 ? `Copy link ${link.name}` : undefined}
            >{#if copied === link.id}<Check size={14} />Copied{:else}<Copy
                size={14}
              />Copy{/if}</button
          >
        </li>{/each}
    </ul>
    <div {...stylex.attrs(styles.actions)}>
      {#if links.length > 1}<button
          {...stylex.attrs(ui.button, ui.primary)}
          onclick={() => copy(links.map((link) => `${link.name}: ${link.url}`).join('\n'), 'all')}
          >{#if copied === 'all'}<Check size={15} />{:else}<Copy size={15} />{/if}Copy all</button
        >{:else}<button {...stylex.attrs(ui.button)} onclick={onclose}>Done</button
        >{#if canShare && links[0]}{@const url = links[0].url}<button
            {...stylex.attrs(ui.button, ui.primary)}
            onclick={() => share(url)}><Share size={15} />Share</button
          >{/if}{/if}
    </div>
  {:else}
    <form
      method="POST"
      {...stylex.attrs(styles.form)}
      onsubmit={(event) => {
        event.preventDefault();
        void generate();
      }}
    >
      <label
        >Name <span {...stylex.attrs(styles.optional)}>optional</span
        ><!-- svelte-ignore a11y_autofocus --><input
          {...stylex.attrs(ui.input)}
          bind:value={label}
          maxlength="100"
          placeholder="Who’s it for? Only you see this."
          autofocus
        /></label
      >
      <div {...stylex.attrs(styles.countRow)}>
        <span id="invite-count">Links</span>
        <div {...stylex.attrs(styles.stepper)} role="group" aria-labelledby="invite-count">
          <button
            {...stylex.attrs(styles.step)}
            type="button"
            aria-label="Fewer links"
            disabled={count <= 1}
            onclick={() => count--}><Minus size={14} /></button
          ><input
            {...stylex.attrs(styles.stepInput)}
            type="number"
            aria-labelledby="invite-count"
            min="1"
            max="20"
            bind:value={count}
            required
          /><button
            {...stylex.attrs(styles.step)}
            type="button"
            aria-label="More links"
            disabled={count >= 20}
            onclick={() => count++}><Plus size={14} /></button
          >
        </div>
      </div>
      {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
      <button {...stylex.attrs(ui.button, ui.primary, ui.full)} disabled={busy}
        >{busy ? 'Creating…' : count === 1 ? 'Create link' : `Create ${count} links`}</button
      >
    </form>
  {/if}
</Modal>
