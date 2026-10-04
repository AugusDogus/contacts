<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './PendingInvitations.stylex.ts';
  import { page } from '$app/state';
  import { Check, Copy, Pencil, Trash2 } from '@lucide/svelte';
  import {
    deleteInvitation,
    getAddressBook,
    renameInvitation,
    renewInvitation
  } from '#lib/contacts.remote.ts';
  import { invitationReference } from '#lib/invitation-token.ts';
  import { invitationUrl } from '#lib/links.ts';
  import { failure, notify } from '#lib/notice.svelte.ts';
  type Invitation = Awaited<ReturnType<typeof getAddressBook>>['invitations'][number];
  type Result = { ok: true } | { ok: false; message: string };
  let { invitations, slug }: { invitations: Invitation[]; slug: string } = $props();
  const DAY = 86_400_000;
  const COLLAPSED = 5;
  let expanded = $state(false);
  let copiedId = $state('');
  let confirmingId = $state('');
  let editingId = $state('');
  let draft = $state('');
  let busyId = $state('');
  let sorted = $derived(
    invitations.toSorted(
      (a, b) =>
        Number(a.expiresAt <= Date.now()) - Number(b.expiresAt <= Date.now()) ||
        b.createdAt - a.createdAt
    )
  );
  let visible = $derived(expanded ? sorted : sorted.slice(0, COLLAPSED));
  const left = (invitation: Invitation) => {
    const days = Math.ceil((invitation.expiresAt - Date.now()) / DAY);
    return days <= 1 ? 'Expires today' : `${days} days left`;
  };
  async function run(id: string, action: () => Promise<Result>, done?: string) {
    busyId = id;
    try {
      const result = await action();
      if (!result.ok) notify(result.message, 'error');
      else if (done) notify(done);
    } catch (cause) {
      failure(cause);
    } finally {
      busyId = '';
    }
  }
  async function copy(invitation: Invitation, token: string) {
    try {
      await navigator.clipboard.writeText(invitationUrl(token, page.url.origin, slug));
      copiedId = invitation.id;
      setTimeout(() => {
        if (copiedId === invitation.id) copiedId = '';
      }, 2000);
    } catch (cause) {
      failure(cause);
    }
  }
  function askToDelete(id: string) {
    confirmingId = id;
    setTimeout(() => {
      if (confirmingId === id) confirmingId = '';
    }, 3000);
  }
  function startEditing(invitation: Invitation) {
    editingId = invitation.id;
    draft = invitation.label;
  }
  function finishEditing(invitation: Invitation) {
    if (editingId !== invitation.id) return;
    editingId = '';
    if (draft.trim() === invitation.label) return;
    void run(invitation.id, () => renameInvitation({ id: invitation.id, label: draft }));
  }
</script>

<section {...stylex.attrs(styles.section)} aria-labelledby="waiting-title">
  <h2 id="waiting-title" {...stylex.attrs(styles.title)}>
    Waiting on {invitations.length}
  </h2>
  <ul {...stylex.attrs(ui.panel, styles.list)}>
    {#each visible as invitation (invitation.id)}{@const expired =
        invitation.expiresAt <= Date.now()}{@const reference = invitationReference(invitation)}
      <li {...stylex.attrs(styles.row)}>
        <div {...stylex.attrs(styles.text)}>
          {#if editingId === invitation.id}<input
              {...stylex.attrs(styles.rename)}
              aria-label="Name for link #{reference}"
              placeholder="Who’s it for?"
              maxlength="100"
              bind:value={draft}
              {@attach (node) => node.focus()}
              onblur={() => finishEditing(invitation)}
              onkeydown={(event) => {
                if (event.key === 'Enter') finishEditing(invitation);
                if (event.key === 'Escape') editingId = '';
              }}
            />{:else}<button
              {...stylex.attrs(styles.label)}
              title="Rename"
              onclick={() => startEditing(invitation)}
              >{#if invitation.label}{invitation.label}<span {...stylex.attrs(styles.reference)}
                  >#{reference}</span
                >{:else}<span {...stylex.attrs(styles.unnamed)}>#{reference}</span>{/if}<span
                {...stylex.attrs(styles.pencil)}><Pencil size={12} /></span
              ></button
            >{/if}
          <p {...stylex.attrs(styles.meta, expired && styles.expired)}>
            {expired ? 'Expired' : left(invitation)}
          </p>
        </div>
        <div {...stylex.attrs(styles.actions)}>
          {#if expired}<button
              {...stylex.attrs(ui.button, ui.small)}
              disabled={busyId === invitation.id}
              onclick={() =>
                run(
                  invitation.id,
                  () => renewInvitation(invitation.id),
                  'Link works for 30 more days'
                )}>Renew</button
            >{:else if invitation.token}{@const token = invitation.token}<button
              {...stylex.attrs(ui.button, ui.small)}
              onclick={() => copy(invitation, token)}
              aria-label="Copy link {invitation.label || `#${reference}`}"
              >{#if copiedId === invitation.id}<Check size={14} />Copied{:else}<Copy
                  size={14}
                />Copy{/if}</button
            >{/if}
          {#if confirmingId === invitation.id}<button
              {...stylex.attrs(ui.button, ui.small, ui.danger)}
              disabled={busyId === invitation.id}
              onclick={() => run(invitation.id, () => deleteInvitation(invitation.id))}
              >Delete</button
            >{:else}<button
              {...stylex.attrs(ui.iconButton)}
              title="Delete link"
              aria-label="Delete link {invitation.label || `#${reference}`}"
              onclick={() => askToDelete(invitation.id)}><Trash2 size={15} /></button
            >{/if}
        </div>
      </li>{/each}
  </ul>
  {#if sorted.length > COLLAPSED}<button
      {...stylex.attrs(ui.textButton, styles.more)}
      onclick={() => (expanded = !expanded)}
      >{expanded ? 'Show fewer' : `Show all ${sorted.length}`}</button
    >{/if}
</section>
