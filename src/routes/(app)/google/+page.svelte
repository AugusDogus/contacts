<script lang="ts">
  import * as stylex from '@stylexjs/stylex';
  import { ui } from '#lib/ui.stylex.ts';
  import { styles } from './google.stylex.ts';
  import { ArrowLeft, Download, FileText } from '@lucide/svelte';
  import { getGoogleConnection, importToGoogle, previewExport } from '#lib/google.remote.ts';
  import { getAddressBook } from '#lib/contacts.remote.ts';
  import { authClient } from '#lib/auth-client.ts';
  import ExportReview from '#lib/components/ExportReview.svelte';
  import ExportProgress, { type ExportStep } from '#lib/components/ExportProgress.svelte';
  import { GooglePerson, type Resolution, type Row } from '#lib/google-person.ts';
  import type { ContactInput } from '#lib/contact.ts';
  let book = $derived(await getAddressBook());
  let connection = $derived(await getGoogleConnection());
  let busy = $state(false);
  let error = $state('');
  let imports = $derived(connection.status === 'connected' ? connection.imports : []);
  let pending = $derived(book.contacts.filter((c) => !imports.some((i) => i.contactId === c.id)));
  const statusOf = (id: string) => imports.find((i) => i.contactId === id)?.status;
  let uncertain = $derived(
    book.contacts.filter((c) => ['pending', 'uncertain'].includes(statusOf(c.id) ?? ''))
  );
  let added = $derived(book.contacts.filter((c) => statusOf(c.id) === 'done').length);
  let updated = $derived(book.contacts.filter((c) => statusOf(c.id) === 'merged').length);
  let summary = $derived(
    !book.contacts.length
      ? 'No contacts yet'
      : [
          added && `${added} added`,
          updated && `${updated} merged`,
          pending.length && `${pending.length} not exported`,
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
  type Review = {
    items: { contactId: string; match: 'existing' | 'new'; person: ContactInput; rows: Row[] }[];
    created: number;
    merged: number;
  };
  let review = $state<Review | null>(null);
  type Decisions = Record<string, Record<string, Resolution>>;
  type Job = {
    steps: ExportStep[];
    decisions: Decisions;
    running: boolean;
    stopping: boolean;
    notice: string;
  };
  let job = $state<Job | null>(null);
  // Leaving mid-export stops the remaining batches, so ask first.
  $effect(() => {
    if (!job?.running) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  });
  // Work out what would change first, and only ask when Google has different details.
  async function startExport() {
    busy = true;
    error = '';
    try {
      const plan = await previewExport(pending.map((c) => c.id));
      if (!plan.ok) {
        error = plan.message;
        busy = false;
        return;
      }
      if (!plan.review.some(({ rows }) => rows.some(GooglePerson.needsChoice)))
        return await run(
          {},
          pending.map((c) => c.id)
        );
      review = {
        created: plan.created,
        merged: plan.merged,
        items: plan.review.flatMap(({ contactId, match, rows }) => {
          const contact = book.contacts.find((c) => c.id === contactId);
          return contact ? [{ contactId, match, person: contact.data, rows }] : [];
        })
      };
    } catch {
      error = 'Couldn’t check your Google contacts. Nothing was exported. Try again.';
      busy = false;
    }
  }
  /** Exports in batches of three, showing each person's outcome as it arrives. */
  async function run(decisions: Decisions, ids: string[]) {
    review = null;
    busy = true;
    error = '';
    const current: Job = {
      decisions,
      running: true,
      stopping: false,
      notice: '',
      steps: ids.flatMap((contactId) => {
        const contact = book.contacts.find((c) => c.id === contactId);
        return contact ? [{ contactId, person: contact.data, state: 'waiting', message: '' }] : [];
      })
    };
    job = current;
    // The reactive copy, so each change shows up in the progress modal immediately.
    const live = job;
    const update = (contactId: string, change: Partial<ExportStep>) => {
      const step = live.steps.find((s) => s.contactId === contactId);
      if (step) Object.assign(step, change);
    };
    for (let i = 0; i < ids.length; i += 3) {
      if (live.stopping) break;
      const batch = ids.slice(i, i + 3);
      for (const id of batch) update(id, { state: 'working' });
      try {
        const result = await importToGoogle({ ids: batch, decisions });
        for (const outcome of result.outcomes)
          update(
            outcome.contactId,
            outcome.status === 'failed'
              ? { state: 'failed', message: outcome.message }
              : outcome.status === 'skipped'
                ? { state: 'skipped' }
                : {
                    state: outcome.status,
                    message: outcome.photoSkipped ? 'The photo couldn’t be copied.' : ''
                  }
          );
        if (!result.ok) {
          live.notice = result.message;
          break;
        }
      } catch {
        live.notice =
          'Lost the connection to the server. Some of these may have been exported. Check Google Contacts, then refresh this page to see who’s left.';
        break;
      }
    }
    for (const step of live.steps)
      if (step.state === 'waiting' || step.state === 'working') step.state = 'stopped';
    live.running = false;
    busy = false;
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
            onclick={startExport}
            >{busy ? (job ? 'Exporting…' : 'Checking Google…') : `Export ${pending.length}`}</button
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
  Google export matches existing contacts by email, phone, or name, fills in what’s missing, and
  asks before changing anything they already have.
</p>
{#if review}<ExportReview
    items={review.items}
    created={review.created}
    merged={review.merged}
    onconfirm={(decisions) =>
      void run(
        decisions,
        pending.map((c) => c.id)
      )}
    onclose={() => {
      review = null;
      busy = false;
    }}
  />{/if}
{#if job}<ExportProgress
    steps={job.steps}
    running={job.running}
    stopping={job.stopping}
    notice={job.notice}
    onstop={() => {
      if (job) job.stopping = true;
    }}
    onretry={() => {
      if (!job) return;
      const failed = job.steps.filter((step) => step.state === 'failed').map((s) => s.contactId);
      void run(job.decisions, failed);
    }}
    onclose={() => (job = null)}
  />{/if}
