<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './google.stylex.ts';
  import { Download } from '@lucide/svelte';
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
      ? 'No contacts to add yet.'
      : [
          added && `${added} already added.`,
          pending.length && `${pending.length} not added yet.`,
          uncertain.length && `${uncertain.length} couldn’t be confirmed. See below.`
        ]
          .filter(Boolean)
          .join(' ')
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
<div {...stylex.attrs(ui.pageHeading)}>
  <div>
    <h1>Export</h1>
    <p {...stylex.attrs(ui.subtitle)}>Take your contacts to your phone or another app.</p>
  </div>
</div>
<div {...stylex.attrs(styles.stack)}>
  <section {...stylex.attrs(ui.panel, styles.section)} aria-labelledby="google-title">
    <div {...stylex.attrs(styles.heading)}>
      <h2 id="google-title">Google Contacts</h2>
      {#if connection.status === 'connected'}<span {...stylex.attrs(ui.badge, ui.green)}
          >Connected</span
        >{/if}
    </div>
    <p {...stylex.attrs(styles.text)}>
      Add your contacts to Google, including photos, addresses, and birthdays. If your phone syncs
      with Google, they’ll appear there too.
    </p>
    {#if connection.status === 'connected'}
      <p {...stylex.attrs(styles.text)}>{summary}</p>
      <div {...stylex.attrs(styles.actions)}>
        {#if pending.length}<button
            {...stylex.attrs(ui.button, ui.primary)}
            disabled={busy}
            onclick={importContacts}
            >{busy ? `Adding ${progress} of ${total}…` : `Add ${pending.length} to Google`}</button
          >{/if}<button {...stylex.attrs(ui.textButton)} disabled={busy} onclick={connect}
          >Reconnect</button
        >
      </div>
    {:else if connection.status === 'demo'}<a {...stylex.attrs(ui.button, ui.primary)} href="/login"
        >Create an account to connect Google</a
      >
    {:else if connection.status === 'unavailable'}<p {...stylex.attrs(styles.text)}>
        Google isn’t available right now. Download a file below and import it into Google Contacts
        instead.
      </p>
    {:else}<button {...stylex.attrs(ui.button, ui.primary)} disabled={busy} onclick={connect}
        >Connect Google</button
      >{/if}
    {#if error}<p {...stylex.attrs(ui.formError, styles.after)} role="alert">{error}</p>{/if}
    {#if uncertain.length}<div {...stylex.attrs(styles.uncertain)} role="status">
        <p>
          We couldn’t confirm these were added. Check Google before adding them by hand. We won’t
          retry, to avoid duplicates.
        </p>
        <ul {...stylex.attrs(styles.uncertainList)}>
          {#each uncertain as contact (contact.id)}<li>
              {contact.data.firstName}
              {contact.data.lastName}
            </li>{/each}
        </ul>
      </div>{/if}
    <p {...stylex.attrs(styles.fine)}>
      We only add contacts. Nothing already in Google is read or changed, so you may need to merge
      duplicates there.
    </p>
  </section>
  <section {...stylex.attrs(ui.panel, styles.section)} aria-labelledby="file-title">
    <h2 id="file-title" {...stylex.attrs(styles.heading)}>Download a file</h2>
    <p {...stylex.attrs(styles.text)}>
      A vCard (.vcf) works with Apple Contacts, Outlook, Google, and most other apps.
    </p>
    {#if book.contacts.length}<a {...stylex.attrs(ui.button)} href="/export" download
        ><Download size={16} />Download {book.contacts.length}
        {book.contacts.length === 1 ? 'contact' : 'contacts'}</a
      >{:else}<p {...stylex.attrs(styles.fine)}>Nothing to download yet.</p>{/if}
  </section>
</div>
