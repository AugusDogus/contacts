<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './invitations.stylex.ts';
  import { Plus, Link, ShieldCheck, ArrowUpRight } from '@lucide/svelte';
  import { getAddressBook, revokeInvitation } from '#lib/contacts.remote.ts';
  import InviteDialog from '#lib/components/InviteDialog.svelte';
  import ContactDetail from '#lib/components/ContactDetail.svelte';
  import { failure, notify } from '#lib/notice.svelte.ts';
  let book = $derived(await getAddressBook());
  let inviteOpen = $state(false);
  let filter = $state('all');
  let selectedId = $state<string | null>(null);
  let selected = $derived(book.contacts.find((c) => c.id === selectedId));
  let busyId = $state('');
  const invitationState = (invitation: (typeof book.invitations)[number]) =>
    invitation.status === 'pending' && invitation.expiresAt < Date.now()
      ? 'expired'
      : invitation.status;
  let filtered = $derived(
    book.invitations.filter((i) => filter === 'all' || invitationState(i) === filter)
  );
  async function revoke(id: string) {
    busyId = id;
    try {
      await revokeInvitation(id);
      notify('Invitation revoked. This link can no longer be used.');
    } catch (cause) {
      failure(cause);
    } finally {
      busyId = '';
    }
  }
</script>

<svelte:head><title>Invitations | Contacts Exchange</title></svelte:head>
<div {...stylex.attrs(ui.pageHeading)}>
  <div>
    <h1>Bring your people along.</h1>
    <p {...stylex.attrs(ui.subtitle)}>
      One private link for each friend. A warm welcome for everyone.
    </p>
  </div>
  <button {...stylex.attrs(ui.button, ui.primary)} onclick={() => (inviteOpen = true)}
    ><Plus size={17} />Create invitations</button
  >
</div>
<div {...stylex.attrs(styles.explanation)}>
  <ShieldCheck size={22} />
  <p {...stylex.attrs(styles.explanationText)}>
    Each invitation accepts just one contact card, then closes. Links expire after 30 days. Only the
    friends you send a link to can add their details.
  </p>
</div>
<section {...stylex.attrs(ui.panel)}>
  <div {...stylex.attrs(styles.toolbar)}>
    <h3>Your invitations <span {...stylex.attrs(ui.muted)}>({book.invitations.length})</span></h3>
    <select
      {...stylex.attrs(ui.input, styles.filter)}
      aria-label="Filter invitations"
      bind:value={filter}
      ><option value="all">All invitations</option><option value="pending"
        >Waiting for a friend</option
      ><option value="used">Completed</option><option value="revoked">Revoked</option><option
        value="expired">Expired</option
      ></select
    >
  </div>
  <div {...stylex.attrs(styles.list)}>
    {#each filtered as invitation}{@const contact = book.contacts.find(
        (c) => c.invitationId === invitation.id
      )}
      <div {...stylex.attrs(styles.row)}>
        <span {...stylex.attrs(styles.icon)}><Link size={18} /></span>
        <div {...stylex.attrs(styles.details)}>
          <strong {...stylex.attrs(styles.label)}
            >{invitation.label || `Invitation ${invitation.id.slice(0, 8)}`}</strong
          >
          <p {...stylex.attrs(styles.meta)}>
            #{invitation.id.slice(0, 8)} · Created {new Date(
              invitation.createdAt
            ).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}{#if contact}
              · Filled in by {contact.data.firstName} {contact.data.lastName}{/if}
          </p>
        </div>
        <div {...stylex.attrs(styles.state)}>
          <span
            {...stylex.attrs(
              ui.badge,
              invitationState(invitation) === 'pending' && ui.amber,
              invitationState(invitation) === 'used' && ui.green
            )}
            >{invitationState(invitation) === 'pending'
              ? 'Waiting for a friend'
              : invitationState(invitation) === 'used'
                ? 'Completed'
                : invitationState(invitation) === 'revoked'
                  ? 'Revoked'
                  : 'Expired'}</span
          >{#if invitationState(invitation) === 'pending'}<button
              {...stylex.attrs(ui.button, ui.small)}
              onclick={() => revoke(invitation.id)}
              disabled={busyId === invitation.id}>Revoke</button
            >{:else if contact}<button
              {...stylex.attrs(ui.iconButton)}
              onclick={() => (selectedId = contact.id)}
              aria-label="View {contact.data.firstName}'s card"><ArrowUpRight size={17} /></button
            >{/if}
        </div>
      </div>{:else}<div {...stylex.attrs(ui.emptyState)}>
        <span {...stylex.attrs(ui.emptyIcon)}><Link size={24} /></span>
        <h3>No invitations here yet</h3>
        <p {...stylex.attrs(ui.emptyText)}>
          Create a link for one friend, or a batch for your whole circle.
        </p>
        <button {...stylex.attrs(ui.button, ui.primary)} onclick={() => (inviteOpen = true)}
          >Create invitations</button
        >
      </div>{/each}
  </div>
</section>
<p {...stylex.attrs(styles.footnote)}>
  Full links are shown only when you create them. Lost a link? Revoke it and make another.<br />The
  invitation number is included in each shared URL, so you can find it in your messages later.
</p>
{#if inviteOpen}<InviteDialog slug={book.profile.slug} onclose={() => (inviteOpen = false)} />{/if}
{#if selected}<ContactDetail contact={selected} onclose={() => (selectedId = null)} />{/if}
