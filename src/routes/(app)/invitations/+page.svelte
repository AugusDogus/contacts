<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './invitations.stylex.ts';
  import { Plus, Link } from '@lucide/svelte';
  import { getAddressBook, revokeInvitation } from '#lib/contacts.remote.ts';
  import InviteDialog from '#lib/components/InviteDialog.svelte';
  import ContactDetail from '#lib/components/ContactDetail.svelte';
  import { Contact } from '#lib/contact.ts';
  import { failure, notify } from '#lib/notice.svelte.ts';
  type Invitation = Awaited<ReturnType<typeof getAddressBook>>['invitations'][number];
  type State = 'pending' | 'used' | 'revoked' | 'expired';
  const labels: Record<State, string> = {
    pending: 'Open',
    used: 'Used',
    revoked: 'Revoked',
    expired: 'Expired'
  };
  let book = $derived(await getAddressBook());
  let inviteOpen = $state(false);
  let filter = $state<State | 'all'>('all');
  let selectedId = $state<string | null>(null);
  let selected = $derived(book.contacts.find((c) => c.id === selectedId));
  let busyId = $state('');
  const stateOf = (invitation: Invitation): State =>
    invitation.status === 'pending' && invitation.expiresAt < Date.now()
      ? 'expired'
      : invitation.status;
  const date = (time: number) =>
    new Date(time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  let present = $derived(
    (['pending', 'used', 'revoked', 'expired'] as const).filter((state) =>
      book.invitations.some((i) => stateOf(i) === state)
    )
  );
  let filterOptions = $derived(['all', ...present] as const);
  let activeFilter = $derived(filter !== 'all' && present.includes(filter) ? filter : 'all');
  let filtered = $derived(
    book.invitations.filter((i) => activeFilter === 'all' || stateOf(i) === activeFilter)
  );
  async function revoke(id: string) {
    busyId = id;
    try {
      await revokeInvitation(id);
      notify('Invitation revoked');
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
    <h1>Invitations</h1>
    <p {...stylex.attrs(ui.subtitle)}>Each link works once and expires after 30 days.</p>
  </div>
  {#if book.invitations.length}<button
      {...stylex.attrs(ui.button, ui.primary)}
      onclick={() => (inviteOpen = true)}><Plus size={17} />Invite someone</button
    >{/if}
</div>
{#if book.invitations.length}
  {#if present.length > 1}<div
      {...stylex.attrs(ui.segmented, styles.filters)}
      role="group"
      aria-label="Show"
    >
      {#each filterOptions as option (option)}<button
          {...stylex.attrs(ui.segment, activeFilter === option && ui.segmentOn)}
          aria-pressed={activeFilter === option}
          onclick={() => (filter = option)}>{option === 'all' ? 'All' : labels[option]}</button
        >{/each}
    </div>{/if}
  <section {...stylex.attrs(ui.panel)} aria-label="Invitations">
    <ul {...stylex.attrs(styles.list)}>
      {#each filtered as invitation (invitation.id)}{@const state =
          stateOf(invitation)}{@const contact = book.contacts.find(
          (c) => c.invitationId === invitation.id
        )}
        <li {...stylex.attrs(styles.row)}>
          <div {...stylex.attrs(styles.details)}>
            <p {...stylex.attrs(styles.label)}>
              {invitation.label || 'Untitled'}
              <span {...stylex.attrs(styles.reference)}>#{invitation.id.slice(0, 8)}</span>
            </p>
            <p {...stylex.attrs(styles.meta)}>
              {#if contact}Added {Contact.name(contact.data)}{:else if state === 'pending'}Expires {date(
                  invitation.expiresAt
                )}{:else}Created {date(invitation.createdAt)}{/if}
            </p>
          </div>
          <span
            {...stylex.attrs(
              ui.badge,
              state === 'pending' && ui.amber,
              state === 'used' && ui.green
            )}>{labels[state]}</span
          >
          {#if state === 'pending'}<button
              {...stylex.attrs(ui.button, ui.small)}
              onclick={() => revoke(invitation.id)}
              disabled={busyId === invitation.id}
              aria-label="Revoke {invitation.label || `invitation #${invitation.id.slice(0, 8)}`}"
              >{busyId === invitation.id ? 'Revoking…' : 'Revoke'}</button
            >{:else if contact}<button
              {...stylex.attrs(ui.button, ui.small)}
              onclick={() => (selectedId = contact.id)}
              aria-label="View {Contact.name(contact.data)}">View</button
            >{/if}
        </li>{/each}
    </ul>
  </section>
  <p {...stylex.attrs(styles.footnote)}>
    Lost a link? Revoke it and create a new one. Each link contains its #reference, so you can
    search your messages for it.
  </p>
{:else}
  <section {...stylex.attrs(ui.panel, ui.emptyState)} aria-labelledby="no-invitations">
    <span {...stylex.attrs(ui.emptyIcon)}><Link size={24} /></span>
    <h2 id="no-invitations">No invitations yet</h2>
    <p {...stylex.attrs(ui.emptyText)}>
      Create a link for one person or several at once. You’ll see here when each one is used.
    </p>
    <button {...stylex.attrs(ui.button, ui.primary)} onclick={() => (inviteOpen = true)}
      ><Plus size={17} />Invite someone</button
    >
  </section>
{/if}
{#if inviteOpen}<InviteDialog onclose={() => (inviteOpen = false)} />{/if}
{#if selected}<ContactDetail contact={selected} onclose={() => (selectedId = null)} />{/if}
