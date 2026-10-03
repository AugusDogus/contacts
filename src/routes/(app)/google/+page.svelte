<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './google.stylex.ts';
  import { Download, ArrowUpRight, ShieldCheck, RefreshCw, ContactRound } from '@lucide/svelte';
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
      if (result.error) error = result.error.message || 'Google could not be connected. Try again.';
    } catch {
      error = 'Google could not be reached. Your contacts are still saved here. Try again.';
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
          error = `${progress} contacts imported. ${result.message}`;
          return;
        }
      }
      notify(
        `${progress} contacts added to Google${photoSkipped ? `. ${photoSkipped} photos could not be transferred.` : '.'}`
      );
    } catch {
      error =
        'The import was interrupted. Completed contacts are preserved. Refresh this page to see which contacts still need importing.';
    } finally {
      busy = false;
    }
  }
</script>

<svelte:head><title>Google Contacts | Contacts Exchange</title></svelte:head>
<div {...stylex.attrs(ui.pageHeading)}>
  <div>
    <h1>Your people. Wherever you need them.</h1>
    <p {...stylex.attrs(ui.subtitle)}>
      From your address book to your next call, text, or birthday card.
    </p>
  </div>
</div>
<div {...stylex.attrs(styles.container)}>
  <section {...stylex.attrs(ui.panel, styles.connection)}>
    <div {...stylex.attrs(styles.identity)}>
      <span {...stylex.attrs(styles.google)}>G</span>
      <div {...stylex.attrs(styles.name)}>
        <h2>Google Contacts</h2>
        <p {...stylex.attrs(ui.help)}>Bring your new contacts along.</p>
      </div>
      <span {...stylex.attrs(ui.badge, connection.status === 'connected' && ui.green)}
        >{connection.status === 'connected' ? 'Connected' : 'Not connected'}</span
      >
    </div>
    <p {...stylex.attrs(styles.description)}>
      Add the contact cards you’ve collected to Google Contacts, including addresses, birthdays,
      notes, and photos. They’ll be there on the devices you sync with Google.
    </p>
    {#if connection.status === 'connected'}<div {...stylex.attrs(styles.syncInfo)}>
        {imports.filter((i) => i.status === 'done').length} already imported. {pending.length} ready to
        add.
      </div>
      <div {...stylex.attrs(styles.actions)}>
        <button
          {...stylex.attrs(ui.button, ui.primary)}
          disabled={busy || !pending.length}
          onclick={importContacts}
          >{#if busy}<RefreshCw size={16} />Adding {progress} of {total}…{:else}<ArrowUpRight
              size={16}
            />Add {pending.length}
            {pending.length === 1 ? 'contact' : 'contacts'} to Google{/if}</button
        ><button {...stylex.attrs(styles.reconnect)} disabled={busy} onclick={connect}
          >Reconnect account</button
        >
      </div>
    {:else if connection.status === 'demo'}<a {...stylex.attrs(ui.button, ui.primary)} href="/login"
        >Create an account to connect Google <ArrowUpRight size={16} /></a
      >
      <p {...stylex.attrs(ui.help)}>Sample contacts stay in this demo workspace.</p>
    {:else if connection.status === 'unavailable'}<p {...stylex.attrs(styles.syncInfo)}>
        Google Contacts is not available yet. You can download your contacts below and import the
        file into Google Contacts.
      </p>
    {:else}<button {...stylex.attrs(ui.button, ui.primary)} disabled={busy} onclick={connect}
        >Connect Google Contacts <ArrowUpRight size={16} /></button
      >{/if}
    {#if error}<p {...stylex.attrs(ui.formError, styles.actions)} role="alert">{error}</p>{/if}
    {#if uncertain.length}<div {...stylex.attrs(styles.uncertain)}>
        These imports could not be confirmed. Check Google Contacts before adding them manually. We
        won’t retry automatically, to avoid duplicates.
        <ul {...stylex.attrs(styles.uncertainList)}>
          {#each uncertain as contact}<li>
              {contact.data.firstName}
              {contact.data.lastName}
            </li>{/each}
        </ul>
      </div>{/if}
    <p {...stylex.attrs(styles.note)}>
      <ShieldCheck size={17} />You choose when to import. We don’t read or overwrite your existing
      Google contacts. Cards already imported by Contacts Exchange are skipped; existing contacts
      you added outside Contacts Exchange may still need merging in Google.
    </p>
  </section>
  <section {...stylex.attrs(ui.panel, styles.exportPanel)}>
    <span {...stylex.attrs(ui.emptyIcon)}><ContactRound size={23} /></span>
    <div {...stylex.attrs(styles.exportInfo)}>
      <h3 {...stylex.attrs(styles.exportTitle)}>An address book that travels.</h3>
      <p {...stylex.attrs(styles.exportText)}>
        Download all {book.contacts.length} contacts as a .vcf file. Import it into Google Contacts, Apple
        Contacts, Outlook, or your favorite address book.
      </p>
    </div>
    <a {...stylex.attrs(ui.button)} href="/export" download><Download size={16} />Download vCards</a
    >
  </section>
</div>
