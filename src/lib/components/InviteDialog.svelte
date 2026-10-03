<script lang="ts">
  import { invitationReference } from '#lib/invitation-token.ts';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './InviteDialog.stylex.ts';
  import { page } from '$app/state';
  import { Copy, Check, Download, Plus, Minus } from '@lucide/svelte';
  import Modal from './Modal.svelte';
  import { createInvitations, getAddressBook } from '#lib/contacts.remote.ts';
  import { invitationUrl } from '#lib/links.ts';
  import { notify, failure } from '#lib/notice.svelte.ts';
  let { onclose }: { onclose: () => void } = $props();
  let several = $state(false);
  let count = $state(2);
  let label = $state('');
  let busy = $state(false);
  let error = $state('');
  let links = $state<{ id: string; name: string; url: string }[]>([]);
  let copied = $state('');
  let total = $derived(several ? count : 1);
  async function generate() {
    busy = true;
    error = '';
    try {
      const result = await createInvitations({ count: total, label });
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
  function download() {
    const text = links.map((link) => `${link.name}\n${link.url}`);
    const url = URL.createObjectURL(new Blob([text.join('\n\n')], { type: 'text/plain' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'contacts-exchange-invitations.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }
</script>

<Modal
  title={links.length > 1
    ? `${links.length} links ready`
    : links.length
      ? 'Link ready'
      : 'Invite someone'}
  {onclose}
>
  {#if links.length}
    <p {...stylex.attrs(ui.muted)}>
      {links.length > 1
        ? 'Send each person their own link. Each one works once.'
        : 'Send this link to one person. It works once.'}
      Copy {links.length > 1 ? 'them' : 'it'} now, since full links aren’t shown again.
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
            {...stylex.attrs(ui.button, ui.small, links.length === 1 && ui.primary)}
            onclick={() => copy(link.url, link.id)}
            aria-label={links.length > 1 ? `Copy link ${link.name}` : undefined}
            >{#if copied === link.id}<Check size={15} />Copied{:else}<Copy
                size={15}
              />Copy{/if}</button
          >
        </li>{/each}
    </ul>
    {#if links.length > 1}<div {...stylex.attrs(styles.actions)}>
        <button {...stylex.attrs(ui.button)} onclick={download}
          ><Download size={16} />Download as text</button
        ><button
          {...stylex.attrs(ui.button, ui.primary)}
          onclick={() => copy(links.map((link) => `${link.name}: ${link.url}`).join('\n'), 'all')}
          >{#if copied === 'all'}<Check size={16} />{:else}<Copy size={16} />{/if}Copy all</button
        >
      </div>{:else}<div {...stylex.attrs(styles.actions)}>
        <button {...stylex.attrs(ui.button)} onclick={onclose}>Done</button>
      </div>{/if}
  {:else}
    <p {...stylex.attrs(ui.muted)}>
      Create a private link and send it however you like. When they fill in their details, they’re
      added to your people.
    </p>
    <form
      method="POST"
      {...stylex.attrs(styles.form)}
      onsubmit={(event) => {
        event.preventDefault();
        void generate();
      }}
    >
      <label
        >Who’s it for? <span {...stylex.attrs(styles.optional)}>Optional</span><input
          {...stylex.attrs(ui.input)}
          bind:value={label}
          maxlength="100"
          placeholder="Jamie"
        /><span {...stylex.attrs(ui.help)}>Only you see this. It helps you tell links apart.</span
        ></label
      >
      {#if several}<div {...stylex.attrs(styles.countRow)}>
          <span id="invite-count">How many links?</span>
          <div {...stylex.attrs(styles.stepper)} role="group" aria-labelledby="invite-count">
            <button
              {...stylex.attrs(styles.step)}
              type="button"
              aria-label="Fewer links"
              disabled={count <= 2}
              onclick={() => count--}><Minus size={15} /></button
            ><input
              {...stylex.attrs(styles.stepInput)}
              type="number"
              aria-labelledby="invite-count"
              min="2"
              max="20"
              bind:value={count}
              required
            /><button
              {...stylex.attrs(styles.step)}
              type="button"
              aria-label="More links"
              disabled={count >= 20}
              onclick={() => count++}><Plus size={15} /></button
            >
          </div>
        </div>{:else}<button
          {...stylex.attrs(ui.textButton, styles.severalToggle)}
          type="button"
          onclick={() => (several = true)}>Need links for several people?</button
        >{/if}
      {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
      <button {...stylex.attrs(ui.button, ui.primary, ui.full)} disabled={busy}
        >{busy ? 'Creating…' : total === 1 ? 'Create link' : `Create ${total} links`}</button
      >
      <p {...stylex.attrs(styles.fine)}>Links work once and expire after 30 days.</p>
    </form>
  {/if}
</Modal>
