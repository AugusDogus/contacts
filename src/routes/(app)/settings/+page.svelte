<script lang="ts">
  import { untrack } from 'svelte';
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './settings.stylex.ts';
  import { PUBLIC_CONTACTS_DOMAIN } from '$app/env/public';
  import { ArrowLeft } from '@lucide/svelte';
  import { getAddressBook, claimCard, saveMyCard, saveProfile } from '#lib/contacts.remote.ts';
  import ContactForm from '#lib/components/ContactForm.svelte';
  import Modal from '#lib/components/Modal.svelte';
  import Avatar from '#lib/components/Avatar.svelte';
  import FormFieldsEditor from '#lib/components/FormFieldsEditor.svelte';
  import { authClient } from '#lib/auth-client.ts';
  import { Contact } from '#lib/contact.ts';
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
  let saving = $state(false);
  let error = $state('');
  let editing = $state(false);
  let claimed = $state(false);
  let claiming = $state(false);
  async function save() {
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
<a href="/" {...stylex.attrs(ui.back)}><ArrowLeft size={15} />People</a>
<div {...stylex.attrs(ui.pageHeading)}><h1>Settings</h1></div>
<div {...stylex.attrs(styles.stack)}>
  {#if data.canClaim && !claimed && book.viewer.kind === 'account'}<section
      {...stylex.attrs(styles.claim)}
      aria-labelledby="claim-title"
    >
      <h2 id="claim-title" {...stylex.attrs(styles.claimTitle)}>Keep the card you just sent?</h2>
      <button {...stylex.attrs(ui.button, ui.small, ui.primary)} disabled={claiming} onclick={claim}
        >{claiming ? 'Saving…' : 'Save card'}</button
      >
    </section>{/if}

  <section {...stylex.attrs(styles.section)} aria-labelledby="page-title">
    <div {...stylex.attrs(styles.sectionHead)}>
      <h2 id="page-title" {...stylex.attrs(styles.title)}>What friends see</h2>
      <p {...stylex.attrs(styles.hint)}>Your name and note on every invitation.</p>
    </div>
    <form
      method="POST"
      {...stylex.attrs(ui.panel, styles.body, ui.formStack)}
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
        >Page link
        <span {...stylex.attrs(styles.address)}
          ><input
            {...stylex.attrs(styles.slugInput)}
            bind:value={slug}
            aria-label="Page link"
            required
            minlength="3"
            maxlength="40"
            pattern="[a-z0-9]([a-z0-9]|-)*[a-z0-9]"
            title="Lowercase letters, numbers, and hyphens"
            spellcheck="false"
            autocapitalize="none"
          /><span {...stylex.attrs(styles.suffix)}>.{PUBLIC_CONTACTS_DOMAIN}</span></span
        ></label
      ><label
        >Message<textarea
          {...stylex.attrs(ui.input)}
          bind:value={message}
          required
          maxlength="500"
          rows="2"
          placeholder="Shown to people you invite"></textarea></label
      >
      {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
      <div>
        <button {...stylex.attrs(ui.button, ui.primary)} disabled={saving}
          >{saving ? 'Saving…' : 'Save'}</button
        >
      </div>
    </form>
  </section>

  <section {...stylex.attrs(styles.section)} id="form" aria-labelledby="form-title">
    <div {...stylex.attrs(styles.sectionHead)}>
      <h2 id="form-title" {...stylex.attrs(styles.title)}>What friends fill in</h2>
      <p {...stylex.attrs(styles.hint)}>Changes apply to links you already sent.</p>
    </div>
    {#key book.profile.form}<FormFieldsEditor config={book.profile.form} />{/key}
  </section>

  <section {...stylex.attrs(styles.section)} aria-labelledby="card-title">
    <div {...stylex.attrs(styles.sectionHead)}>
      <h2 id="card-title" {...stylex.attrs(styles.title)}>Your card</h2>
      <p {...stylex.attrs(styles.hint)}>Fills in invitations other people send you.</p>
    </div>
    <div {...stylex.attrs(ui.panel, styles.row)}>
      {#if book.savedCard}<Avatar person={book.savedCard} size={36} />
        <div {...stylex.attrs(styles.rowText)}>
          <p {...stylex.attrs(styles.rowTitle)}>{Contact.name(book.savedCard)}</p>
          <p {...stylex.attrs(styles.rowDetail)}>
            {book.savedCard.email || book.savedCard.phone}
          </p>
        </div>{:else}<p {...stylex.attrs(styles.rowText, styles.rowDetail)}>No card yet</p>{/if}
      {#if book.viewer.kind === 'demo'}<a {...stylex.attrs(ui.button, ui.small)} href="/login"
          >Sign up</a
        >{:else}<button {...stylex.attrs(ui.button, ui.small)} onclick={() => (editing = true)}
          >{book.savedCard ? 'Edit' : 'Create'}</button
        >{/if}
    </div>
  </section>

  <section {...stylex.attrs(styles.section)} aria-labelledby="account-title">
    <div {...stylex.attrs(styles.sectionHead)}>
      <h2 id="account-title" {...stylex.attrs(styles.title)}>Account</h2>
    </div>
    <div>
      <div {...stylex.attrs(ui.panel, styles.row)}>
        {#if book.viewer.kind === 'account'}<p {...stylex.attrs(styles.rowText)}>
            {book.viewer.email}
          </p>
          <button
            {...stylex.attrs(ui.button, ui.small)}
            onclick={async () => {
              await authClient.signOut();
              window.location.href = '/login';
            }}>Sign out</button
          >{:else}<p {...stylex.attrs(styles.rowText, styles.rowDetail)}>Viewing sample data</p>
          <a {...stylex.attrs(ui.button, ui.small, ui.primary)} href="/login">Create account</a
          >{/if}
      </div>
    </div>
  </section>
</div>
{#if editing}<Modal title="Your card" size="wide" onclose={() => (editing = false)}
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
