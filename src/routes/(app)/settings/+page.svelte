<script lang="ts">
  import { untrack } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './settings.stylex.ts';
  import { page } from '$app/state';
  import { PUBLIC_CONTACTS_DOMAIN } from '$app/env/public';
  import { Copy } from '@lucide/svelte';
  import { getAddressBook, claimCard, saveMyCard, saveProfile } from '#lib/contacts.remote.ts';
  import ContactForm from '#lib/components/ContactForm.svelte';
  import Modal from '#lib/components/Modal.svelte';
  import Avatar from '#lib/components/Avatar.svelte';
  import { authClient } from '#lib/auth-client.ts';
  import { Contact } from '#lib/contact.ts';
  import { contactPageUrl } from '#lib/links.ts';
  import { notify, failure } from '#lib/notice.svelte.ts';
  import type { PageProps } from './$types';
  let { data }: PageProps = $props();
  let book = $derived(await getAddressBook());
  let name = $state(untrack(() => book.profile.name));
  let slug = $state(untrack(() => book.profile.slug));
  let message = $state(untrack(() => book.profile.message));
  $effect(() => {
    name = book.profile.name;
    slug = book.profile.slug;
    message = book.profile.message;
  });
  let url = $derived(contactPageUrl(book.profile.slug, page.url.origin));
  let saving = $state(false);
  let error = $state('');
  let editing = $state(false);
  let claimed = $state(false);
  let claiming = $state(false);
  async function save() {
    if (
      slug !== book.profile.slug &&
      book.invitations.some((i) => i.status === 'pending') &&
      !confirm(
        'Older invitation links that include your page address will stop working. Newer short links are not affected. Change it?'
      )
    )
      return;
    saving = true;
    error = '';
    try {
      const result = await saveProfile({ name, slug, message });
      if (result.ok) notify('Page saved');
      else error = result.message;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'Your page wasn’t saved. Try again.';
    } finally {
      saving = false;
    }
  }
  async function claim() {
    claiming = true;
    try {
      const result = await claimCard();
      if (result.ok) {
        claimed = true;
        notify('Card saved');
      } else notify(result.message, 'error');
    } catch (cause) {
      failure(cause);
    } finally {
      claiming = false;
    }
  }
</script>

<svelte:head><title>Settings | Contacts Exchange</title></svelte:head>
<div {...stylex.attrs(ui.pageHeading)}><h1>Settings</h1></div>
<div {...stylex.attrs(styles.stack)}>
  {#if data.canClaim && !claimed && book.viewer.kind === 'account'}<section
      {...stylex.attrs(styles.claim)}
      aria-labelledby="claim-title"
    >
      <h2 id="claim-title" {...stylex.attrs(styles.title)}>Keep the card you just sent?</h2>
      <p {...stylex.attrs(styles.text)}>
        Save it to your account so it’s ready next time someone invites you.
      </p>
      <button {...stylex.attrs(ui.button, ui.primary)} disabled={claiming} onclick={claim}
        >{claiming ? 'Saving…' : 'Save card'}</button
      >
    </section>{/if}

  <section {...stylex.attrs(ui.panel, styles.section)} aria-labelledby="page-title">
    <h2 id="page-title" {...stylex.attrs(styles.title)}>Your page</h2>
    <p {...stylex.attrs(styles.text)}>
      People see your name and note when they open one of your invitations.
    </p>
    <form
      method="POST"
      {...stylex.attrs(ui.formStack)}
      onsubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <label
        >Name<input
          {...stylex.attrs(ui.input)}
          bind:value={name}
          required
          maxlength="80"
          autocomplete="name"
        /></label
      ><label
        >Page address
        <span {...stylex.attrs(styles.address)}
          ><input
            {...stylex.attrs(styles.slugInput)}
            bind:value={slug}
            aria-label="Page address"
            required
            minlength="3"
            maxlength="40"
            pattern="[a-z0-9]([a-z0-9]|-)*[a-z0-9]"
            spellcheck="false"
            autocapitalize="none"
          /><span {...stylex.attrs(styles.suffix)}>.{PUBLIC_CONTACTS_DOMAIN}</span></span
        ><span {...stylex.attrs(ui.help)}>Lowercase letters, numbers, and hyphens.</span></label
      ><label
        >Note<textarea
          {...stylex.attrs(ui.input)}
          bind:value={message}
          required
          maxlength="500"
          rows="3"></textarea></label
      >
      {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
      <div {...stylex.attrs(styles.formFooter)}>
        <button {...stylex.attrs(ui.button, ui.primary)} disabled={saving}
          >{saving ? 'Saving…' : 'Save'}</button
        >
        <span {...stylex.attrs(styles.share)}
          ><a href={url} target="_blank" rel="noopener noreferrer">View page</a><button
            {...stylex.attrs(ui.textButton, styles.copy)}
            type="button"
            onclick={async () => {
              try {
                await navigator.clipboard.writeText(url);
                notify('Page address copied');
              } catch (cause) {
                failure(cause);
              }
            }}><Copy size={14} />Copy address</button
          ></span
        >
      </div>
    </form>
  </section>

  <section {...stylex.attrs(ui.panel, styles.section)} aria-labelledby="card-title">
    <h2 id="card-title" {...stylex.attrs(styles.title)}>Your card</h2>
    <p {...stylex.attrs(styles.text)}>
      Save your own details to fill in other people’s invitations faster.
    </p>
    {#if book.savedCard}<div {...stylex.attrs(styles.card)}>
        <Avatar person={book.savedCard} size={44} />
        <div>
          <p {...stylex.attrs(styles.cardName)}>{Contact.name(book.savedCard)}</p>
          <p {...stylex.attrs(ui.muted)}>{book.savedCard.email || book.savedCard.phone}</p>
        </div>
      </div>{/if}
    {#if book.viewer.kind === 'demo'}<a {...stylex.attrs(ui.button)} href="/login"
        >Create an account to save a card</a
      >{:else}<button {...stylex.attrs(ui.button)} onclick={() => (editing = true)}
        >{book.savedCard ? 'Edit card' : 'Create card'}</button
      >{#if book.savedCard}<p {...stylex.attrs(styles.fine)}>
          Edits don’t change cards you’ve already sent.
        </p>{/if}{/if}
  </section>

  <section {...stylex.attrs(ui.panel, styles.section)} aria-labelledby="account-title">
    <h2 id="account-title" {...stylex.attrs(styles.title)}>Account</h2>
    {#if book.viewer.kind === 'account'}<p {...stylex.attrs(styles.text)}>
        Signed in as {book.viewer.email}
      </p>
      <button
        {...stylex.attrs(ui.button)}
        onclick={async () => {
          await authClient.signOut();
          window.location.href = '/login';
        }}>Sign out</button
      >{:else}<p {...stylex.attrs(styles.text)}>You’re looking at sample data on this device.</p>
      <a {...stylex.attrs(ui.button, ui.primary)} href="/login">Create an account</a>{/if}
    <p {...stylex.attrs(styles.fine)}><a href="/privacy">Privacy policy</a></p>
  </section>
</div>
{#if editing}<Modal title="Your card" wide onclose={() => (editing = false)}
    ><ContactForm
      initial={book.savedCard ?? undefined}
      buttonLabel="Save card"
      onsave={async (contact) => {
        const result = await saveMyCard(contact);
        if (result.ok) {
          editing = false;
          notify('Card saved');
        }
        return result;
      }}
    /></Modal
  >{/if}
