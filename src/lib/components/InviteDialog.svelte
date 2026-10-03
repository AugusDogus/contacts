<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './InviteDialog.stylex.ts';

  import { page } from '$app/state';
  import { Link, Copy, Check, Download, ShieldCheck, Plus, Minus } from '@lucide/svelte';
  import Modal from './Modal.svelte';
  import { createInvitations } from '#lib/contacts.remote.ts';
  import { contactPageUrl } from '#lib/links.ts';
  import { notify, failure } from '#lib/notice.svelte.ts';
  let { slug, onclose }: { slug: string; onclose: () => void } = $props();
  let count = $state(1);
  let label = $state('');
  let busy = $state(false);
  let error = $state('');
  let links = $state<{ id: string; label: string; url: string }[]>([]);
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
      links = result.invitations.map((i) => ({
        id: i.id,
        label: i.label || `Invitation ${i.id.slice(0, 8)}`,
        url: `${contactPageUrl(slug, page.url.origin)}/i/${i.token}?ref=${i.id.slice(0, 8)}`
      }));
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'The links could not be created. Try again.';
    } finally {
      busy = false;
    }
  }
  async function copy(value: string, id: string) {
    try {
      await navigator.clipboard.writeText(value);
      copied = id;
      notify('Copied to clipboard');
    } catch (cause) {
      failure(cause);
    }
  }
  function download() {
    const blob = new Blob([links.map((link) => `${link.label}\n${link.url}`).join('\n\n')], {
      type: 'text/plain'
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'gather-invitations.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }
</script>

<Modal title={links.length ? 'Your invitations are ready' : 'Make room for your people'} {onclose}>
  {#if links.length}
    <p {...stylex.attrs(ui.muted)}>
      Send a different link to each friend. Each link accepts one contact card.
    </p>
    <div {...stylex.attrs(styles.generatedLinks)}>
      {#each links as link}<div {...stylex.attrs(styles.generatedLink)}>
          <div {...stylex.attrs(styles.generatedContent)}>
            <strong {...stylex.attrs(styles.generatedLabel)}>{link.label}</strong><input
              {...stylex.attrs(ui.input, styles.linkInput)}
              aria-label="Invitation link for {link.label}"
              readonly
              value={link.url}
              onclick={(event) => event.currentTarget.select()}
            />
          </div>
          <button
            {...stylex.attrs(ui.iconButton)}
            onclick={() => copy(link.url, link.id)}
            aria-label="Copy {link.label}"
            >{#if copied === link.id}<Check size={17} />{:else}<Copy size={17} />{/if}</button
          >
        </div>{/each}
    </div>
    <p {...stylex.attrs(styles.saveNote)}>
      Links are shown once. Copy or download them before closing.
    </p>
    <div {...stylex.attrs(styles.dialogActions)}>
      <button {...stylex.attrs(ui.button)} onclick={download}
        ><Download size={16} />Download links</button
      ><button
        {...stylex.attrs(ui.button, ui.primary)}
        onclick={() => copy(links.map((link) => `${link.label}: ${link.url}`).join('\n'), 'all')}
        ><Copy size={16} />Copy {links.length > 1 ? 'all links' : 'link'}</button
      >
    </div>
  {:else}
    <p {...stylex.attrs(ui.muted)}>
      A little link, a lot less asking for addresses. Your friends fill in their details, and you
      get their contact cards.
    </p>
    <form
      onsubmit={(event) => {
        event.preventDefault();
        void generate();
      }}
      {...stylex.attrs(styles.inviteForm)}
    >
      <label
        >Who is it for? <span {...stylex.attrs(ui.muted)}>(optional)</span><input
          {...stylex.attrs(ui.input)}
          bind:value={label}
          maxlength="100"
          placeholder="e.g. Jamie, or the book club"
        /></label
      >
      <div {...stylex.attrs(styles.countRow)}>
        <div>
          <strong {...stylex.attrs(styles.countLabel)}>Number of invitations</strong>
          <p {...stylex.attrs(ui.help)}>One unique link for each friend.</p>
        </div>
        <div {...stylex.attrs(styles.stepper)}>
          <button
            {...stylex.attrs(styles.stepButton)}
            type="button"
            aria-label="Fewer invitations"
            disabled={count <= 1}
            onclick={() => count--}><Minus size={15} /></button
          ><input
            {...stylex.attrs(ui.input, styles.stepInput)}
            type="number"
            aria-label="Number of invitations"
            min="1"
            max="20"
            bind:value={count}
            required
          /><button
            {...stylex.attrs(styles.stepButton)}
            type="button"
            aria-label="More invitations"
            disabled={count >= 20}
            onclick={() => count++}><Plus size={15} /></button
          >
        </div>
      </div>
      <div {...stylex.attrs(styles.privacyNote)}>
        <ShieldCheck size={20} />
        <p {...stylex.attrs(styles.privacyText)}>
          Single use. Private by default.<br /><span {...stylex.attrs(styles.privacyHelp)}
            >Links expire in 30 days. You can revoke them anytime.</span
          >
        </p>
      </div>
      {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
      <button {...stylex.attrs(ui.button, ui.primary, ui.full)} disabled={busy}
        ><Link size={16} />{busy
          ? 'Creating invitations…'
          : `Create ${count === 1 ? 'invitation' : `${count} invitations`}`}</button
      >
    </form>
  {/if}
</Modal>
