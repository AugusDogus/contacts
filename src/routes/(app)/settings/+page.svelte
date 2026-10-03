<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './settings.stylex.ts';
  import { UserRound, Check, ArrowUpRight, LogOut } from '@lucide/svelte';
  import { getAddressBook, claimCard, saveMyCard } from '#lib/contacts.remote.ts';
  import ContactForm from '#lib/components/ContactForm.svelte';
  import Modal from '#lib/components/Modal.svelte';
  import Avatar from '#lib/components/Avatar.svelte';
  import { authClient } from '#lib/auth-client.ts';
  import { Contact } from '#lib/contact.ts';
  import { notify, failure } from '#lib/notice.svelte.ts';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  let book = $derived(await getAddressBook());
  let editing = $state(false);
  let claimed = $state(false);
  let busy = $state(false);
  async function claim() {
    busy = true;
    try {
      const result = await claimCard();
      if (result.ok) {
        claimed = true;
        notify('Your card is saved to your account');
      } else notify(result.message, 'error');
    } catch (cause) {
      failure(cause);
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Settings | Gather</title></svelte:head>
<div {...stylex.attrs(ui.pageHeading)}>
  <div>
    <h1>Make yourself at home.</h1>
    <p {...stylex.attrs(ui.subtitle)}>Your account and your own little contact card.</p>
  </div>
</div>
<div {...stylex.attrs(styles.container)}>
  {#if data.canClaim && !claimed && book.viewer.kind === 'account'}<section
      {...stylex.attrs(styles.claim)}
    >
      <h2 {...stylex.attrs(styles.sectionTitle)}>Keep the card you just shared.</h2>
      <p {...stylex.attrs(styles.description)}>
        Save it to your account to fill future invitations faster. Your friend’s copy stays exactly
        as you sent it.
      </p>
      <button {...stylex.attrs(ui.button, ui.primary)} disabled={busy} onclick={claim}
        ><Check size={16} />{busy ? 'Saving…' : 'Save my submitted card'}</button
      >
    </section>{/if}
  <section {...stylex.attrs(ui.panel, styles.section)}>
    <h2 {...stylex.attrs(styles.sectionTitle)}>My contact card</h2>
    <p {...stylex.attrs(styles.description)}>
      Save your own details once. They’ll be ready the next time a friend invites you to their
      address book.
    </p>
    {#if book.savedCard}<div {...stylex.attrs(styles.row)}>
        <Avatar person={book.savedCard} size={52} />
        <div>
          <p {...stylex.attrs(styles.contactName)}>{Contact.name(book.savedCard)}</p>
          <p {...stylex.attrs(styles.email)}>{book.savedCard.email || book.savedCard.phone}</p>
        </div>
      </div>{/if}{#if book.viewer.kind === 'demo'}<a
        {...stylex.attrs(ui.button, ui.primary)}
        href="/login">Create an account to save your card <ArrowUpRight size={16} /></a
      >{:else}<button {...stylex.attrs(ui.button)} onclick={() => (editing = true)}
        ><UserRound size={16} />{book.savedCard ? 'Edit my card' : 'Create my card'}</button
      >{/if}
    <p {...stylex.attrs(styles.note)}>
      Editing your saved card doesn’t change copies you’ve already shared.
    </p>
  </section>
  <section {...stylex.attrs(ui.panel, styles.section)}>
    <h2 {...stylex.attrs(styles.sectionTitle)}>Your account</h2>
    <p {...stylex.attrs(styles.description)}>
      {book.viewer.kind === 'demo'
        ? 'You’re exploring a local demo with sample contacts. Create an account for your own private address book.'
        : `Signed in as ${book.viewer.email}`}
    </p>
    <div {...stylex.attrs(styles.actions)}>
      <a {...stylex.attrs(ui.button)} href="/page"
        >Edit my contact page <ArrowUpRight size={15} /></a
      >{#if book.viewer.kind === 'account'}<button
          {...stylex.attrs(ui.button)}
          onclick={async () => {
            await authClient.signOut();
            window.location.href = '/login';
          }}><LogOut size={15} />Sign out</button
        >{/if}
    </div>
  </section>
</div>
{#if editing}<Modal title="Your contact card" wide onclose={() => (editing = false)}
    ><ContactForm
      initial={book.savedCard ?? undefined}
      buttonLabel="Save my card"
      onsave={async (contact) => {
        const result = await saveMyCard(contact);
        if (result.ok) {
          editing = false;
          notify('Your contact card is saved');
        }
        return result;
      }}
    /></Modal
  >{/if}
