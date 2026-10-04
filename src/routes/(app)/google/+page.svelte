<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './google.stylex.ts';
  import { ArrowLeft, Download, FileText } from '@lucide/svelte';
  import { getGoogleConnection, importToGoogle } from '#lib/google.remote.ts';
  import { getAddressBook } from '#lib/contacts.remote.ts';
  import { authClient } from '#lib/auth-client.ts';
  import { notify } from '#lib/notice.svelte.ts';
  let book = $derived(await getAddressBook());
  let connection = $derived(await getGoogleConnection());
  let busy = $state(false);
  let error = $state('');
  let progress = $state(0);
  let total = $state(0);
  let imports = $derived(connection.status === 'connected' ? connection.imports : []);
  let pending = $derived(book.contacts.filter((c) => !imports.some((i) => i.contactId === c.id)));
  let uncertain = $derived(
    book.contacts.filter((c) => imports.some((i) => i.contactId === c.id && i.status !== 'done'))
  );
  let added = $derived(
    book.contacts.filter((c) => imports.some((i) => i.contactId === c.id && i.status === 'done'))
      .length
  );
  let summary = $derived(
    !book.contacts.length
      ? 'No contacts yet'
      : [
          added && `${added} added`,
          pending.length && `${pending.length} not added`,
          uncertain.length && `${uncertain.length} unconfirmed`
        ]
          .filter(Boolean)
          .join(' · ')
  );
  async function connect() {
    busy = true;
    error = '';
    try {
      const result = await authClient.linkSocial({
        provider: 'google',
        scopes: ['https://www.googleapis.com/auth/contacts'],
        callbackURL: '/google',
        additionalParams: { access_type: 'offline', prompt: 'consent' }
      });
      if (result.error) error = result.error.message || 'Google didn’t connect. Try again.';
    } catch {
      error = 'Couldn’t reach Google. Nothing changed here. Try again.';
    } finally {
      busy = false;
    }
  }
  async function importContacts() {
    const ids = pending.map((c) => c.id);
    busy = true;
    error = '';
    progress = 0;
    total = ids.length;
    let photoSkipped = 0;
    try {
      for (let i = 0; i < ids.length; i += 3) {
        const result = await importToGoogle(ids.slice(i, i + 3));
        progress += result.imported;
        photoSkipped += result.photoSkipped;
        if (!result.ok) {
          error = `Added ${progress} of ${total}. ${result.message}`;
          return;
        }
      }
      notify(
        `Added ${progress} to Google${photoSkipped ? `. ${photoSkipped} photos couldn’t be copied.` : ''}`
      );
    } catch {
      error = `Stopped after adding ${progress} of ${total}. Refresh to see who’s left.`;
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Export | Contacts Exchange</title></svelte:head>
<a href="/" {...stylex.attrs(ui.back)}><ArrowLeft size={15} />People</a>
<div {...stylex.attrs(ui.pageHeading)}><h1>Export</h1></div>
<section {...stylex.attrs(ui.panel)} aria-label="Export options">
  <div {...stylex.attrs(styles.row)}>
    <span {...stylex.attrs(styles.icon)} aria-hidden="true"
      ><svg width="18" height="18" viewBox="0 0 24 24"
        ><path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
        /><path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
        /><path
          fill="#FBBC05"
          d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
        /><path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        /></svg
      ></span
    >
    <div {...stylex.attrs(styles.text)}>
      <h2 id="google-title" {...stylex.attrs(styles.title)}>
        Google Contacts{#if connection.status === 'connected'}<span
            {...stylex.attrs(ui.badge, ui.green)}>Connected</span
          >{/if}
      </h2>
      <p {...stylex.attrs(styles.detail)}>
        {#if connection.status === 'connected'}{summary}{:else if connection.status === 'unavailable'}Unavailable
          right now. Use the file instead.{:else}Syncs to your phone through Google.{/if}
      </p>
    </div>
    <div {...stylex.attrs(styles.actions)}>
      {#if connection.status === 'connected'}<button
          {...stylex.attrs(ui.button, ui.small)}
          disabled={busy}
          onclick={connect}>Reconnect</button
        >{#if pending.length}<button
            {...stylex.attrs(ui.button, ui.small, ui.primary)}
            disabled={busy}
            onclick={importContacts}
            >{busy ? `Adding ${progress}/${total}…` : `Add ${pending.length}`}</button
          >{/if}
      {:else if connection.status === 'demo'}<a {...stylex.attrs(ui.button, ui.small)} href="/login"
          >Sign up to connect</a
        >
      {:else if connection.status === 'disconnected'}<button
          {...stylex.attrs(ui.button, ui.small)}
          disabled={busy}
          onclick={connect}>Connect</button
        >{/if}
    </div>
  </div>
  {#if error || uncertain.length}<div {...stylex.attrs(styles.notes)}>
      {#if error}<p {...stylex.attrs(ui.formError)} role="alert">{error}</p>{/if}
      {#if uncertain.length}<div {...stylex.attrs(styles.uncertain)} role="status">
          <p>
            Check Google for these before adding them by hand. They won’t be retried, to avoid
            duplicates.
          </p>
          <ul {...stylex.attrs(styles.uncertainList)}>
            {#each uncertain as contact (contact.id)}<li>
                {contact.data.firstName}
                {contact.data.lastName}
              </li>{/each}
          </ul>
        </div>{/if}
    </div>{/if}
  <div {...stylex.attrs(styles.row)}>
    <span {...stylex.attrs(styles.icon)} aria-hidden="true"><FileText size={18} /></span>
    <div {...stylex.attrs(styles.text)}>
      <h2 {...stylex.attrs(styles.title)}>vCard file</h2>
      <p {...stylex.attrs(styles.detail)}>For Apple Contacts, Outlook, and most apps</p>
    </div>
    <div {...stylex.attrs(styles.actions)}>
      {#if book.contacts.length}<a {...stylex.attrs(ui.button, ui.small)} href="/export" download
          ><Download size={14} />Download {book.contacts.length}</a
        >{/if}
    </div>
  </div>
</section>
<p {...stylex.attrs(styles.fine)}>
  Google export only adds new contacts. Existing ones aren’t read or changed.
</p>
